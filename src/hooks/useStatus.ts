import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatus, type PlayerStatus } from '../api/mpchc';

interface UseStatusResult {
  status: PlayerStatus | null;
  error: string | null;
  refresh: () => void;
}

/**
 * Poll MPC-HC status.html at a fixed interval.
 * Default interval: 1000ms (balanceBetween responsiveness and server load).
 */
export function useStatus(intervalMs = 1000): UseStatusResult {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getStatus();
      setStatus(s);
      setError(null);
    } catch {
      setError('无法连接到 MPC-HC，请确认播放器已启动且 Web Interface 已启用');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    timerRef.current = setInterval(fetchStatus, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchStatus, intervalMs]);

  return { status, error, refresh: fetchStatus };
}
