type Option = {
    label: string;
    value: string;
  };
  
  type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    error?: boolean;
    placeholder?: string;
    showCreateOption?: boolean;
    createOptionLabel?: string;
    id?: string;
  };
  
  export default function Select({
    value,
    onChange,
    options,
    error,
    placeholder = "Selecione uma opção",
    showCreateOption = false,
    createOptionLabel = "Criar novo",
    id
  }: SelectProps) {
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border
        bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 
        dark:text-gray-100 focus:outline-none focus:ring-2 
        focus:ring-blue-500 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300"
        }`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
  
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
  
        {showCreateOption && (
          <option value="__new__">+ {createOptionLabel}</option>
        )}
      </select>
    );
  }
  