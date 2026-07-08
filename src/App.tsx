import { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Container,
  Alert,
} from '@mui/material';
import {
  Remote as RemoteIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { useStatus } from './hooks/useStatus';
import { NowPlaying } from './components/NowPlaying';
import { PlayerControls } from './components/PlayerControls';
import { FileBrowser } from './components/FileBrowser';

export function App() {
  const [tab, setTab] = useState(0);
  const { status, error } = useStatus(1000);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
        MPC-HC Remote
      </Typography>

      {/* Connection error */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Player section */}
      <NowPlaying status={status} />
      <Box mt={2}>
        <PlayerControls status={status} />
      </Box>

      {/* Tab switcher */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mt: 3 }}
      >
        <Tab icon={<RemoteIcon />} label="控制" />
        <Tab icon={<FolderIcon />} label="文件" />
      </Tabs>

      {/* Tab content */}
      {tab === 0 && (
        <Box pt={2}>
          {/* Future: extra controls (audio track, subtitle, zoom, etc.) */}
          <Typography variant="body2" color="text.secondary" textAlign="center">
            播放控制已在上方面板
          </Typography>
        </Box>
      )}
      {tab === 1 && (
        <Box pt={2}>
          <FileBrowser />
        </Box>
      )}
    </Container>
  );
}
