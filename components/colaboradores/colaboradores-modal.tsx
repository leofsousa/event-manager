'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
    colaborador?: any
};

export default function ColaboradoresModal({ onClose, onSuccess, colaborador }: Props) {
    const { showToast } = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'colaborador'>('colaborador')

    useEffect(() => {
        if (colaborador) {
            setUsername(colaborador.username);
            setCargo(colaborador.cargo || '');
            setRole(colaborador.role || '');
            setEmail(colaborador.email || '')
        }
    }, [colaborador])

    const handleSubmit = async () => {
        if (!username) {
            showToast('Nome obrigatório');
            return;
        }

        try {
            if (colaborador) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        username,
                        cargo,
                        role,
                    })
                    .eq('id', colaborador.id);

                if (error) throw error;

                showToast('Atualizado com sucesso!');
            } else {
                const res = await fetch('/api/create-user', {
                    method: 'POST',
                    body: JSON.stringify({
                        username,
                        email,
                        password: '123456', // depois você melhora isso
                        cargo,
                        role,
                    }),
                });

                if (!res.ok) throw new Error();

                showToast('Colaborador criado!');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showToast('Erro ao salvar');
        }
    };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {colaborador ? "Editar colaborador" : "Novo Colaborador"}
                </h2>
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-500 dark:text-gray-300" />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <Input />
                </div>
            </div>
        </div>
    )
}