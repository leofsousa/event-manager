type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function InputDate({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded w-full"
    />
  );
}
