type Props = {
    onClose: () => void;
    onAddEvent: (event: Event) => void
}

import Event from '@/types/event.ts'

export default function EventModal({ onClose }: Props) {
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold m-6 text-gray-900">Novo Evento</h2>
            <button className="m-6 rounded-xl bg-blue-600 p-2 hover:bg-blue-300 transition" onClick={onClose}>Fechar</button>
        </div>
    </div>
}