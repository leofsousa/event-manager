'use client';

import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
    colaboradores: any[];
    onAdd?: () => void;
    onEdit: (c: any) => void;
    onDelete: (c: any) => void;
}

export default function TableColaboradores({ colaboradores, onAdd, onEdit, onDelete, }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow:hidden">
            <table className="w-full">
                <thead className="bg-gray-200">
                    <tr>
                        <th colSpan={3} className="p-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">
                                    Colaboradores
                                </span>
                                <Button className="flex">
                                    <Plus size={20} />
                                    Adicionar
                                </Button>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th className="p-4 text-left">Nome</th>
                        <th className="p-4 text-left">Cargo</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {colaboradores.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500">Nenhum colaborar encontrado</td>
                        </tr>
                    ) : (colaboradores.map((c) => (
                        <tr key={c.id} className="border-b dark:border-gray-700">
                            <td className="p-4">{c.username}</td>
                            <td className="p-4">{c.cargo || '-'}</td>

                            <td className="p-4 text-right">
                                <div>
                                    <Button variant="secondary" onClick={() => onEdit(c)}>Editar</Button>
                                    <Button variant="danger" onClick={() => onDelete(c)}>Deletar</Button>
                                </div>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>
    )
}