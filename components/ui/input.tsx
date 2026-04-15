import { useState, InputHTMLAttributes } from "react";
import { EyeOff, Eye } from "lucide-react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export default function Input({
  type = "text",
  className,
  error,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className={`
          w-full px-3 py-2 pr-10 rounded-lg border
          bg-white text-gray-900
          dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
          ${className || ""}
        `}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
