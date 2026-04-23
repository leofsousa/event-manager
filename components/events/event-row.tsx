type Props = {
    event: Event;
    onEdit: (event: Event) => void;
    onDelete: (event: Event) => void;
    onOpenScale: (id: string) => void;
    isMobile?: boolean;
  };
  
  export default function EventRow({
    event,
    onEdit,
    onDelete,
    onOpenScale,
    isMobile
  }: Props) {
    if (isMobile) {
      return (
        <div className="bg-white dark:bg-blue-900 rounded-xl p-4 shadow-sm space-y-2">
  
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">{event.nome}</h2>
  
            <span className={`text-xs px-2 py-1 rounded
              ${event.hasScale
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
              }`}>
              {event.hasScale ? "Com escala" : "Sem escala"}
            </span>
          </div>
  
          <div className="text-sm">
            <p>{event.tipo}</p>
            <p>{event.data}</p>
            <p>{event.local}</p>
          </div>
  
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onOpenScale(event.id)}>
              {event.hasScale ? "Escala" : "Criar"}
            </button>
  
            <button onClick={() => onEdit(event)}>
              Editar
            </button>
  
            <button onClick={() => onDelete(event)}>
              Excluir
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <tr className="border-b">
        <td>{event.nome}</td>
        <td>{event.tipo}</td>
        <td>{event.data}</td>
        <td>{event.local}</td>
        <td>
          <button onClick={() => onOpenScale(event.id)}>
            {event.hasScale ? "Escala" : "Criar"}
          </button>
  
          <button onClick={() => onEdit(event)}>
            Editar
          </button>
  
          <button onClick={() => onDelete(event)}>
            Excluir
          </button>
        </td>
      </tr>
    );
  }
  