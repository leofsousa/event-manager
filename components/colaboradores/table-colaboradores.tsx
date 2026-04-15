'use client';

import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
    colaboradores: any[];
    onAdd?: () => void
}

export default function TableColaboradores({ colaboradores, onAdd }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow:hidden">
            <table className="w-full">
                <thead className="bg-gray-100">
                    <tr>
                        <th colSpan={4} className="p-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">
                                    Colaboradores
                                </span>
                                <Button className="flex">
                                    <Plus size={20}/>
                                    Adicionar
                                </Button>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Nome</th>
                        <th>Cargo</th>
                        
                    </tr>
                </thead>
            </table>
        </div>
    )
}