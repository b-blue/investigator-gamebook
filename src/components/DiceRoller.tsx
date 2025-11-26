interface DiceRollerProps {
  value: number;
  onRoll: () => void;
}

export default function DiceRoller({ value, onRoll }: DiceRollerProps) {
  return (
    <button className="dice-button" onClick={onRoll}>
      {value}
    </button>
  );
}
