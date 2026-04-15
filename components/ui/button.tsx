import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  className,
  ...props
}:ButtonProps) {

  const baseStyles = "px-4 py-2 rounded-lg transition font-medium";
  const variants = {primary: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
  danger: "bg-red-500 hover:bg-red-400 text-white",
}
const disabledStyles = "bg-gray-300 text-white cursor-not-allowed";

  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${disabled ? disabledStyles : variants[variant]}
        ${className || ""}
      `}
    >
      {children}
    </button>
  )
}