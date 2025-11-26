import { Button } from '@mui/material';

interface DiceRollerProps {
  value: number;
  onRoll: () => void;
}

export default function DiceRoller({ value, onRoll }: DiceRollerProps) {
  return (
    <Button className="dice-button" onClick={onRoll}>
      {value}
    </Button>
  );
}
