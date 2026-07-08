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
export function useFileBrowser(initialPath = 'C:%5c'): UseFileBrowserResult {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await browseDirectory(path);
      setEntries(result);
      setCurrentPath(path);
    } catch {
      setError('无法读取目录');
    } finally {
      setLoading(false);
    }
  }, []);

  const goUp = useCallback(async () => {
    // Navigate to parent by appending %5c.. (URL-encoded \..)
    const parentPath = currentPath.endsWith('%5c')
      ? currentPath + '..'
      : currentPath + '%5c..';
    await navigate(parentPath);
  }, [currentPath, navigate]);

  const play = useCallback(async (path: string) => {
    await playFile(path);
  }, []);

  return { entries, currentPath, loading, error, navigate, goUp, play };
}
