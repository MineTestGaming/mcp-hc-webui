import { useCallback, useState } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Stack,
  Paper,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipPrevious as SkipBackIcon,
  SkipNext as SkipForwardIcon,
  FastRewind as JumpBackIcon,
  FastForward as JumpForwardIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseFileIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { sendCommand, seekPercent, setVolume } from '../api/mpchc';
import type { PlayerStatus } from '../api/mpchc';

interface PlayerControlsProps {
  status: PlayerStatus | null;
}

export function PlayerControls({ status }: PlayerControlsProps) {
  const [seekValue, setSeekValue] = useState<number | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);

  const positionMs = status?.positionMs ?? 0;
  const durationMs = status?.durationMs ?? 0;
  const isPlaying = status?.state === '正在播放';
  const currentVolume = volumeValue ?? (status?.volume ?? 100);

  const seekPercentValue =
    seekValue ?? (durationMs > 0 ? (positionMs / durationMs) * 100 : 0);

  const handleSeekChange = (_: Event, value: number | number[]) => {
    setSeekValue(value as number);
  };

  const handleSeekCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const pct = value as number;
    setSeekValue(null);
    void seekPercent(pct);
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    setVolumeValue(value as number);
  };

  const handleVolumeCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const vol = value as number;
    setVolumeValue(null);
    void setVolume(vol);
  };

  const handleSkipBack = useCallback(() => {
    // Go back to start or previous file
    void sendCommand(921);
  }, []);

  const handleSkipForward = useCallback(() => {
    void sendCommand(922);
  }, []);

  const handleJumpBack = useCallback(() => {
    void sendCommand(901);  // Short jump backward
  }, []);

  const handleJumpForward = useCallback(() => {
    void sendCommand(900);  // Short jump forward
  }, []);

  const handlePlay = useCallback(() => {
    void sendCommand(887);
  }, []);

  const handlePause = useCallback(() => {
    void sendCommand(888);
  }, []);

  const handleStop = useCallback(() => {
    void sendCommand(890);
  }, []);

  const handleMute = useCallback(() => {
    void sendCommand(909);
  }, []);

  const handleFullscreen = useCallback(() => {
    void sendCommand(830);
  }, []);

  const handleCloseFile = useCallback(() => {
    void sendCommand(804);
  }, []);

  const handleCloseApp = useCallback(() => {
    if (window.confirm('确定要关闭 MPC-HC 吗？')) {
      void sendCommand(816).then(() => window.close());
    }
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* Seek bar */}
      <Box sx={{ px: 1, mb: 0.5 }}>
        <Slider
          value={seekPercentValue}
          onChange={handleSeekChange}
          onChangeCommitted={handleSeekCommit}
          min={0}
          max={100}
          step={0.1}
          size="small"
          aria-label="播放进度"
        />
      </Box>

      {/* Time display */}
      <Box sx={{ px: 1, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" fontFamily="monospace">
          {status?.position ?? '00:00:00'}
        </Typography>
        <Typography variant="caption" fontFamily="monospace">
          {status?.duration ?? '00:00:00'}
        </Typography>
      </Box>

      {/* Control buttons */}
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
        <IconButton onClick={handleSkipBack} color="inherit" title="上一个">
          <SkipBackIcon />
        </IconButton>
        <IconButton onClick={handleJumpBack} color="inherit" title="快退">
          <JumpBackIcon />
        </IconButton>

        <IconButton
          onClick={isPlaying ? handlePause : handlePlay}
          color="primary"
          size="large"
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
        </IconButton>

        <IconButton onClick={handleStop} color="inherit" title="停止">
          <StopIcon />
        </IconButton>
        <IconButton onClick={handleJumpForward} color="inherit" title="快进">
          <JumpForwardIcon />
        </IconButton>
        <IconButton onClick={handleSkipForward} color="inherit" title="下一个">
          <SkipForwardIcon />
        </IconButton>
      </Stack>

      {/* Volume */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, mt: 1 }}>
        <IconButton onClick={handleMute} size="small" title="静音">
          {currentVolume === 0 ? <MuteIcon fontSize="small" /> : <VolumeIcon fontSize="small" />}
        </IconButton>
        <Slider
          value={currentVolume}
          onChange={handleVolumeChange}
          onChangeCommitted={handleVolumeCommit}
          min={0}
          max={100}
          step={1}
          size="small"
          aria-label="音量"
          sx={{ maxWidth: 160 }}
        />
        <Typography variant="caption" fontFamily="monospace" sx={{ minWidth: 32 }}>
          {Math.round(currentVolume)}%
        </Typography>
      </Stack>

      {/* Utility buttons */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
        <IconButton onClick={handleFullscreen} color="inherit" size="small" title="全屏">
          <FullscreenIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleCloseFile} color="inherit" size="small" title="关闭文件">
          <CloseFileIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleCloseApp} color="error" size="small" title="关闭播放器">
          <PowerIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
