"use client";

import { createContext, useContext, useState } from 'react';

type Toast = {
    id: string;
    message: string;
    type: "success" | "error";
    leaving?: boolean;
};

type ToastContextType = {
    showToast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: Toast["type"] = "success") => {
        const id = crypto.randomUUID();

        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, leaving: true } : t
              )
            );
          
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
          }, 3000);
          
    }
    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                        px-4 py-2 rounded-lg shadow-md text-white
                        transform transition-all duration-300
                    
                        ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}
                    
                        ${
                          toast.leaving
                            ? "opacity-0 -translate-y-2"
                            : "opacity-100 translate-y-0"
                        }
                      `}
                        >
                            {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export { ToastContext };