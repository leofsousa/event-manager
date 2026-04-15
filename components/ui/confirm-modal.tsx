type Props = {
    title?: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void
}

export default function ConfirmModal({
    title = "Confirmar Ação",
    description = "Tem certeza que deseja continuar?",
    onConfirm,
    onCancel
}: Props) {
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
        onClick={onCancel}>
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {description}
            </p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300">
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 dark:hover:bg-red-400"
                >
                    Excluir
                </button>
            </div>
        </div>
    </div>
}