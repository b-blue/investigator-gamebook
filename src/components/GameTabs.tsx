import { Tabs, Tab, Box } from '@mui/material';
import type { GameType } from '../types';

interface GameTabsProps {
  activeGame: GameType;
  onGameChange: (game: GameType) => void;
}

export default function GameTabs({ activeGame, onGameChange }: GameTabsProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={activeGame} 
        onChange={(_, newValue) => onGameChange(newValue as GameType)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '1rem',
          },
          '& .Mui-selected': {
            color: 'rgba(255, 255, 255, 0.87)',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#646cff',
            height: 3,
          },
        }}
      >
        <Tab label="TDOA" value="TDOA" />
        <Tab label="TTOI" value="TTOI" />
      </Tabs>
    </Box>
  );
}
