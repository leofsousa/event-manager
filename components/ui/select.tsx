type Option = {
    label: string;
    value: string;
};

type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    error?: boolean;
}

export default function Select({
    value,
    onChange,
    options,
    error
}: SelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 ronded-lg border rounded-lg
            bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 
            dark:text-gray-100 focus:outline-none focus:ring-2 
            focus:ring-blue-500 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
            `}
        >
            <option value="" disabled hidden>Selecione um tipo</option>
            {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>))}
            <option value="__new__"> + Criar novo Tipo</option>
        </select>
    )
}