import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Alert,
} from '@mui/material';
import {
  SettingsRemote as RemoteIcon,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position="fixed" elevation={0} color="primary">
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            MPC-HC Remote
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}

      {/* Connection error */}
      {error && (
        <Alert severity="warning" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Content area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 && (
          <>
            <NowPlaying status={status} />
            <Box mt={2}>
              <PlayerControls status={status} />
            </Box>
          </>
        )}
        {tab === 1 && <FileBrowser />}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={tab}
        onChange={(_, v) => setTab(v)}
        showLabels
        sx={{ borderTop: 1, borderColor: 'divider' }}
      >
        <BottomNavigationAction label="正在播放" icon={<RemoteIcon />} />
        <BottomNavigationAction label="文件" icon={<FolderIcon />} />
      </BottomNavigation>
    </Box>
  );
}
