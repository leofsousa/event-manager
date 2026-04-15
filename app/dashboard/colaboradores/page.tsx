'use client';

import TableColaboradores from '@/components/colaboradores/table-colaboradores';
import { useState } from 'react';

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);

  return (
    <TableColaboradores colaboradores={colaboradores}/>
  )
}