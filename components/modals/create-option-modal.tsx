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
        <div>
            
        </div>
    )
}