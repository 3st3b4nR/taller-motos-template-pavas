export const STATUS_TRANSITIONS = Object.freeze({
  RECIBIDA: ["DIAGNOSTICO", "CANCELADA"],
  DIAGNOSTICO: ["EN_PROCESO", "CANCELADA"],
  EN_PROCESO: ["LISTA", "CANCELADA"],
  LISTA: ["ENTREGADA", "CANCELADA"],
  ENTREGADA: [],
  CANCELADA: []
});

export const isValidTransition = (current, next) =>
  STATUS_TRANSITIONS[current]?.includes(next) ?? false;
