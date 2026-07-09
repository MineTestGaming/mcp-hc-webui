import { useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  IconButton,
  Breadcrumbs,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  PlayArrow as PlayIcon,
  ArrowUpward as UpIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useFileBrowser } from '../hooks/useFileBrowser';

const MEDIA_EXTENSIONS: { video: string[]; audio: string[]; image: string[] } = {
  video: ['mkv', 'mp4', 'avi', 'wmv', 'mov', 'flv', 'webm', 'ts', 'm2ts', 'mpg', 'mpeg', 'vob'],
  audio: ['mp3', 'flac', 'aac', 'wav', 'ogg', 'wma', 'm4a', 'opus'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (MEDIA_EXTENSIONS.video.includes(ext)) return <VideoIcon color="primary" />;
  if (MEDIA_EXTENSIONS.audio.includes(ext)) return <AudioIcon color="secondary" />;
  if (MEDIA_EXTENSIONS.image.includes(ext)) return <ImageIcon color="action" />;
  return <FileIcon color="action" />;
}

export function FileBrowser() {
  const { entries, currentPath, loading, error, navigate, goUp, play } =
    useFileBrowser('C:\\');

  useEffect(() => {
    void navigate('C:\\');
  }, [navigate]);

  // currentPath is always in decoded form
  const breadcrumbParts = currentPath
    .split('\\')
    .filter(Boolean)
    .map((part, idx, arr) => {
      const slice = arr.slice(0, idx + 1).join('\\') + '\\';
      return { label: part, path: slice };
    });

  const handleDirClick = (entry: typeof entries[0]) => {
    if (entry.isDirectory) {
      void navigate(entry.path);
    } else {
      void play(entry.path);
    }
  };

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Box display="flex" alignItems="center" gap={1} px={1} pb={1}>
        <IconButton onClick={() => void goUp()} size="small" title="上级目录">
          <UpIcon />
        </IconButton>
        <Breadcrumbs separator="\" maxItems={4}>
          <Typography variant="body2" color="text.secondary">
            {currentPath ? 'Root' : currentPath}
          </Typography>
          {breadcrumbParts.map((part) => (
            <Typography
              key={part.path}
              variant="body2"
              color="text.primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => void navigate(part.path)}
            >
              {part.label}
            </Typography>
          ))}
        </Breadcrumbs>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center" py={2}>
          {error}
        </Typography>
      )}

      <List dense>
        {entries.map((entry) => (
          <ListItem
            key={entry.path}
            disablePadding
            secondaryAction={
              !entry.isDirectory && (
                <IconButton edge="end" onClick={() => void play(entry.path)} title="播放">
                  <PlayIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            <ListItemButton onClick={() => handleDirClick(entry)}>
              <ListItemIcon>
                {entry.isDirectory ? <FolderIcon color="warning" /> : getFileIcon(entry.name)}
              </ListItemIcon>
              <ListItemText
                primary={entry.name}
                secondary={entry.isDirectory ? entry.type : `${entry.size} · ${entry.dateModified}`}
                primaryTypographyProps={{
                  noWrap: true,
                  variant: 'body2',
                  fontWeight: entry.isDirectory ? 'medium' : 'regular',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
