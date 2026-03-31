type FormFieldProps = {
    label: string;
    htmlFor: string;
    error?: string;
    required: boolean;
    children: React.ReactNode;
}

export default function FormField({
    label,
    htmlFor,
    error,
    required,
    children
}: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label htmlFor={htmlFor}
                className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {children}

            {error && (
                <span>{error}</span>
            )}
        </div>
    );
}