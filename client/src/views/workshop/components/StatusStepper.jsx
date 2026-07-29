// El flujo lineal de estados. CANCELADA se maneja aparte.
const FLOW = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA'];
const LABELS = {
  RECIBIDA:    'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO:  'En proceso',
  LISTA:       'Lista',
  ENTREGADA:   'Entregada',
};
const ICONS = {
  RECIBIDA:    '📋',
  DIAGNOSTICO: '🔍',
  EN_PROCESO:  '🔧',
  LISTA:       '✅',
  ENTREGADA:   '🏍️',
};

export default function StatusStepper({ status }) {
  if (status === 'CANCELADA') {
    return (
      <div className="stepper">
        <div className="step-item">
          <div className="step-node step-cancelled">
            <div className="step-circle">✕</div>
            <span className="step-label">Cancelada</span>
          </div>
        </div>
      </div>
    );
  }

  const activeIdx = FLOW.indexOf(status);

  return (
    <div className="stepper">
      {FLOW.map((s, i) => {
        const isDone   = i < activeIdx;
        const isActive = i === activeIdx;
        const cls = isDone ? 'step-done' : isActive ? 'step-active' : '';

        return (
          <div key={s} className="step-item">
            <div className={`step-node ${cls}`}>
              <div className="step-circle">
                {isDone ? '✓' : ICONS[s]}
              </div>
              <span className="step-label">{LABELS[s]}</span>
            </div>
            {i < FLOW.length - 1 && (
              <div className={`step-connector ${isDone ? 'step-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
