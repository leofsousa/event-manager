'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

type Props = {
  title: string;
  placeholder?: string;
  onClose: () => void;
  onCreate: (value: string) => void;
};

export default function CreateOptionModal({
    title,
    placeholder = "Digite um valor",
    onClose,
    onCreate,
  }: Props) {
    const [value, setValue] = useState('');
    const handleCreate = () => {
        if (!value.trimm()) return;
        onCreate(value.trimm());
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" 
        onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md" 
            onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h2>
                <Input 
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose} variant='secondary'>Cancelar</Button>
                    <Button onCLick={handleCreate}>Criar</Button>
                </div>
            </div>
        </div>
    )
}