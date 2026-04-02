import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type Props = {
    onClose: () => void;
    onCreate: (value:string) => void
}

export default function CreateTypeModal({ onClose, onCreate }:Props){
    const [ value, setValue ] = useState('');

    const handleCreate = () => {
        if(!value.trim()) return;

        onCreate(value);
        onClose();
    }
    return(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
        onClick={onClose}>
            <div 
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Novo tipo de evento</h2>
                <Input 
                placeholder="Ex: Convenção"
                value={value}
                onChange={(e) => setValue(e.target.value)} />
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreate}>
                        Criar
                    </Button>
                </div>
            </div>

        </div>
    )
}