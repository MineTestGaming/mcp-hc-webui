// MPC-HC Web Interface API client
// All endpoints are relative to the same origin (deployed under MPC-HC WebServer).

export interface PlayerStatus {
  file: string;
  state: string;
  positionMs: number;
  position: string;
  durationMs: number;
  duration: string;
  playbackMode: number;
  volume: number;
  fullPath: string;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  type: string;
  size: string;
  dateModified: string;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** Send a wm_command to MPC-HC. */
export async function sendCommand(
  wmCommand: number,
  params?: Record<string, string>,
): Promise<void> {
  const search = new URLSearchParams({ wm_command: String(wmCommand) });
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      search.set(k, v);
    }
  }
  await fetch(`/command.html?${search.toString()}`);
}

/** Seek to a percentage (0-100). */
export async function seekPercent(percent: number): Promise<void> {
  await sendCommand(-1, { percent: String(Math.max(0, Math.min(100, percent))) });
}

/** Seek to a specific time string HH:MM:SS or HH:MM:SS.mmm. */
export async function seekTo(position: string): Promise<void> {
  await sendCommand(-1, { position });
}

/** Set volume (0-100).wm_command=-2 is the special "set volume" command. */
export async function setVolume(volume: number): Promise<void> {
  await fetch(`/command.html?wm_command=-2&volume=${Math.max(0, Math.min(100, volume))}`);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATUS_RE = /^OnStatus\((.+)\)$/s;

/** Fetch and parse the current playback status from /status.html. */
export async function getStatus(): Promise<PlayerStatus | null> {
  const res = await fetch('/status.html');
  const text = await res.text();
  const match = text.match(STATUS_RE);
  if (!match) return null;

  // Parse arguments respecting quoted strings
  const args = parseOnStatusArgs(match[1]!);
  if (args.length < 9) return null;

  return {
    file: args[0]!,
    state: args[1]!,
    positionMs: parseInt(args[2]!, 10) || 0,
    position: args[3]!,
    durationMs: parseInt(args[4]!, 10) || 0,
    duration: args[5]!,
    playbackMode: parseInt(args[6]!, 10) || 0,
    volume: parseInt(args[7]!, 10) || 0,
    fullPath: args[8]!,
  };
}

/** Split the OnStatus(...) argument list, respecting double-quoted strings. */
function parseOnStatusArgs(raw: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.length > 0) {
    args.push(current.trim());
  }

  // Strip surrounding quotes from each arg
  return args.map((a) => {
    if (a.startsWith('"') && a.endsWith('"')) {
      return a.slice(1, -1);
    }
    return a;
  });
}

// ---------------------------------------------------------------------------
// File Browser
// ---------------------------------------------------------------------------

export interface BrowseResult {
  entries: FileEntry[];
  resolvedPath: string;
}

/** Browse a directory by path. Returns parsed entries and the resolved absolute path. */
export async function browseDirectory(path: string): Promise<BrowseResult> {
  const res = await fetch(`/browser.html?path=${encodeURIComponent(path)}`);
  const html = await res.text();
  return parseBrowserHtml(html);
}

/** Play a file by its full path. */
export async function playFile(path: string): Promise<void> {
  await fetch(`/browser.html?path=${encodeURIComponent(path)}`);
}

/**
 * Parse the browser.html HTML response into structured entries.
 * MPC-HC returns a table with rows: Name, Type, Size, Date Modified.
 * Directories have class="dirname", files have a class derived from extension.
 */
function parseBrowserHtml(html: string): BrowseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table.browser-table');

  // First table contains "Location: <path>"
  const locText = tables[0]?.querySelector('td')?.textContent ?? '';
  const resolvedPath = locText.replace('Location:', '').trim();

  const rows = tables[1]?.querySelectorAll('tr') ?? doc.querySelectorAll('table.browser-table tr');

  const entries: FileEntry[] = [];

  for (const row of rows) {
    const link = row.querySelector('td a');
    if (!link) continue;

    const name = link.textContent ?? '';
    if (name === '..') continue;

    const href = link.getAttribute('href') ?? '';

    // Extract path from href query param
    const url = new URL(href, 'http://localhost');
    const entryPath = url.searchParams.get('path') ?? '';

    const isDirectory = row.classList.contains('dirname')
      || !!row.querySelector('.dirname');

    const cells = row.querySelectorAll('td');
    const type = cells[1]?.textContent?.trim() ?? '';
    const size = cells[2]?.textContent?.trim() ?? '';
    const dateModified = cells[3]?.textContent?.trim() ?? '';

    entries.push({ name, path: entryPath, isDirectory, type, size, dateModified });
  }

  return { entries, resolvedPath };
}
