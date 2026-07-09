import { useState, useCallback } from 'react';
import { browseDirectory, playFile, type FileEntry } from '../api/mpchc';

interface UseFileBrowserResult {
  entries: FileEntry[];
  currentPath: string;
  loading: boolean;
  error: string | null;
  navigate: (path: string) => Promise<void>;
  goUp: () => Promise<void>;
  play: (path: string) => Promise<void>;
}

/**
 * Manage file browser state: current directory, entries, navigation.
 */
export function useFileBrowser(initialPath = 'C:\\'): UseFileBrowserResult {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await browseDirectory(path);
      setEntries(result.entries);
      setCurrentPath(result.resolvedPath);
    } catch {
      setError('无法读取目录');
    } finally {
      setLoading(false);
    }
  }, []);

  const goUp = useCallback(async () => {
    // "Root" or empty means we're already at the drive list — nothing to go up to
    if (!currentPath || currentPath === 'Root') return;

    // Drive root (e.g. "C:\") → navigate to empty path to show all drives
    if (/^[A-Z]:\\?$/i.test(currentPath)) {
      await navigate('');
      return;
    }

    const parentPath = currentPath.endsWith('\\')
      ? currentPath + '..'
      : currentPath + '\\..';
    await navigate(parentPath);
  }, [currentPath, navigate]);

  const play = useCallback(async (path: string) => {
    await playFile(path);
  }, []);

  return { entries, currentPath, loading, error, navigate, goUp, play };
}
