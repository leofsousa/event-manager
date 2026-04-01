import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type Props = {
    onClose: () => void;
    onCreate: (value:string) => void
}

export default function CreateTypeModal({onClose, onCreate}:Props){
    const [ value,setValue ] = useState('');

    const handleCreate = () => {
        if(!value.trim()) return;

        onCreate(value);
        onClose();
    }
    return(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
        onClick={onClose}>
            <div 
            className=""
            onClick={(e) => e.stopPropagation()}>

            </div>

        </div>
    )
}