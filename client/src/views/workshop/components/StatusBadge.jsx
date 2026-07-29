const LABELS = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En proceso',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
