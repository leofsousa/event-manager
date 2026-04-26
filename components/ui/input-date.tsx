type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export default function InputDate({ value, onChange, id }: Props) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded-lg w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
    />
  );
}
