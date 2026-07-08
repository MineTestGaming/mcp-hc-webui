import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  PlayCircle as PlayingIcon,
  PauseCircle as PausedIcon,
  StopCircle as StoppedIcon,
} from '@mui/icons-material';
import type { PlayerStatus } from '../api/mpchc';

interface NowPlayingProps {
  status: PlayerStatus | null;
}

export function NowPlaying({ status }: NowPlayingProps) {
  if (!status) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">等待连接...</Typography>
        </CardContent>
      </Card>
    );
  }

  const icon =
    status.state === '正在播放' ? <PlayingIcon color="success" /> :
    status.state === '已暂停' ? <PausedIcon color="warning" /> :
    <StoppedIcon color="error" />;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon}
          <Chip label={status.state} size="small" variant="outlined" />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" noWrap>
          {status.file}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {status.fullPath}
        </Typography>
      </CardContent>
    </Card>
  );
}
