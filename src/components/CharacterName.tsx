interface CharacterNameProps {
  value: string;
  onChange: (name: string) => void;
}

export default function CharacterName({ value, onChange }: CharacterNameProps) {
  return (
    <div className="character-name-section">
      <input
        type="text"
        className="character-name-input"
        placeholder="Character Name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
