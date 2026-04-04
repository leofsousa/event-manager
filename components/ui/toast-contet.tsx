"use client";

import { createContext, useContext, useState } from 'react';

type Toast = {
    id: string;
    message: string;
    type: "success" | "error";
};

type ToastContextType = {
    showToast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: Toast["type"] = "success") => {
        const id = crypto.randomUUID();

        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }
    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toasts.id}
                        className={`px-4 py-2 rounded-lg shadow-md text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                        >
                            {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
