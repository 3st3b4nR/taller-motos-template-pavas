export const STATUS_LABELS = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En proceso',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export const STATUS_TRANSITIONS = {
  RECIBIDA: ['DIAGNOSTICO', 'CANCELADA'],
  DIAGNOSTICO: ['EN_PROCESO', 'CANCELADA'],
  EN_PROCESO: ['LISTA', 'CANCELADA'],
  LISTA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: [],
  CANCELADA: [],
};

export const ALL_STATUSES = Object.keys(STATUS_LABELS);

export const STATUS_COLORS = {
  RECIBIDA: '#64748b',
  DIAGNOSTICO: '#b45309',
  EN_PROCESO: '#1d4ed8',
  LISTA: '#15803d',
  ENTREGADA: '#0f766e',
  CANCELADA: '#b91c1c',
};
