import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workOrderService } from '../services/workOrderService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { STATUS_LABELS, STATUS_TRANSITIONS } from '../utils/workOrderStatus';
import { downloadWorkOrderReceiptPdf } from '../utils/workOrderReceiptPdf';
import { useAuth } from 'contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StatusStepper from '../components/StatusStepper';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import Modal from '../components/Modal';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v));

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const TABS = [
  { key: 'info',     label: '📋 Información' },
  { key: 'items',    label: '🔧 Ítems y total' },
  { key: 'estado',   label: '🔄 Estado' },
  { key: 'historial',label: '📜 Historial' },
];

const ITEM_EMPTY = { type: 'MANO_OBRA', description: '', count: 1, unitValue: '' };

/* ──────────────────────────────────────────────
   Tab: Información
────────────────────────────────────────────── */
function TabInfo({ order }) {
  const { bike } = order;
  return (
    <div className="info-grid">
      <div>
        <p className="section-title">Cliente</p>
        <div className="card">
          <div className="info-item"><label>Nombre</label><span>{bike?.client?.name}</span></div>
          <div className="info-item" style={{ marginTop: 10 }}><label>Teléfono</label><span>{bike?.client?.phone}</span></div>
          {bike?.client?.email && (
            <div className="info-item" style={{ marginTop: 10 }}><label>Email</label><span>{bike.client.email}</span></div>
          )}
        </div>
      </div>
      <div>
        <p className="section-title">Moto</p>
        <div className="card">
          <div className="info-item"><label>Placa</label><span className="plate-text" style={{ fontSize: 16 }}>{bike?.plate}</span></div>
          <div className="info-item" style={{ marginTop: 10 }}><label>Marca / Modelo</label><span>{bike?.brand} {bike?.model}</span></div>
          {bike?.cylinder && (
            <div className="info-item" style={{ marginTop: 10 }}><label>Cilindraje</label><span>{bike.cylinder}</span></div>
          )}
        </div>
      </div>
      <div>
        <p className="section-title">Orden</p>
        <div className="card">
          <div className="info-item"><label>Fecha de ingreso</label><span>{order.entryDate}</span></div>
          <div className="info-item" style={{ marginTop: 10 }}><label>Falla reportada</label><span>{order.faultDescription}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Tab: Ítems
────────────────────────────────────────────── */
function TabItems({ order, canEdit, onRefresh }) {
  const [item, setItem] = useState(ITEM_EMPTY);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const setF = (f) => (e) => setItem((i) => ({ ...i, [f]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await workOrderService.addItem(order.id, {
        type: item.type,
        description: item.description,
        count: Number(item.count),
        unitValue: Number(item.unitValue),
      });
      setItem(ITEM_EMPTY);
      onRefresh();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setAdding(false); }
  };

  const handleDelete = async (itemId) => {
    setError('');
    try { await workOrderService.deleteItem(itemId); onRefresh(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      <div className="table-wrap">
        <table className="mobile-card-table items-table">
          <thead>
            <tr>
              <th>Tipo</th><th>Descripción</th><th>Cant.</th>
              <th>Valor unitario</th><th>Subtotal</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {order.items?.length === 0 ? (
              <tr><td className="mobile-empty" colSpan={canEdit ? 6 : 5}>
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-icon">🔧</div>
                  <p>Sin ítems registrados aún.</p>
                </div>
              </td></tr>
            ) : (
              order.items.map((it) => (
                <tr key={it.id}>
                  <td data-label="Tipo">
                    <span className={`badge ${it.type === 'MANO_OBRA' ? 'badge-EN_PROCESO' : 'badge-LISTA'}`}>
                      {it.type === 'MANO_OBRA' ? 'Mano de obra' : 'Repuesto'}
                    </span>
                  </td>
                  <td className="mobile-primary" data-label="Descripción">{it.description}</td>
                  <td data-label="Cantidad">{it.count}</td>
                  <td className="money" data-label="Valor unitario">{fmt(it.unitValue)}</td>
                  <td className="money" data-label="Subtotal">{fmt(it.count * it.unitValue)}</td>
                  {canEdit && (
                    <td className="mobile-actions" data-label="Acciones">
                      <button className="icon-btn" title="Eliminar" onClick={() => handleDelete(it.id)}>🗑</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="mobile-total-label" colSpan={4}><strong>Total de la orden</strong></td>
              <td className="money mobile-total-value" style={{ fontSize: 15 }}>{fmt(order.total)}</td>
              {canEdit && <td className="mobile-total-spacer" />}
            </tr>
          </tfoot>
        </table>
      </div>

      {canEdit && (
        <div style={{ marginTop: 16 }}>
          <p className="section-title">Agregar ítem</p>
          <form onSubmit={handleAdd}>
            <div className="item-add-row">
              <div className="form-group">
                <label>Tipo</label>
                <select value={item.type} onChange={setF('type')}>
                  <option value="MANO_OBRA">Mano de obra</option>
                  <option value="REPUESTO">Repuesto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <input required value={item.description} onChange={setF('description')} placeholder="Ej. Cambio de aceite" />
              </div>
              <div className="form-group">
                <label>Cant. *</label>
                <input type="number" min="1" required value={item.count} onChange={setF('count')} />
              </div>
              <div className="form-group">
                <label>Valor unitario *</label>
                <input type="number" min="0" step="1" required value={item.unitValue} onChange={setF('unitValue')} placeholder="0" />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? <><div className="spinner" /></> : '+ Agregar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Tab: Estado
────────────────────────────────────────────── */
function TabEstado({ order, onRefresh }) {
  const { isAdmin } = useAuth();
  const [confirmModal, setConfirmModal] = useState(null);
  const [note, setNote] = useState('');
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');

  // Los mecánicos no pueden ENTREGAR ni CANCELAR
  const MECANICO_BLOCKED = ['ENTREGADA', 'CANCELADA'];
  const allTransitions = STATUS_TRANSITIONS[order.status] || [];
  const transitions = isAdmin
    ? allTransitions
    : allTransitions.filter((t) => !MECANICO_BLOCKED.includes(t));

  const handleConfirm = async () => {
    setChanging(true);
    setError('');
    try {
      await workOrderService.updateStatus(order.id, confirmModal.next, note.trim() || undefined);
      setConfirmModal(null);
      setNote('');
      onRefresh();
    } catch (err) {
      setError(getErrorMessage(err));
      setConfirmModal(null);
    } finally { setChanging(false); }
  };

  const btnClass = (next) => {
    if (next === 'CANCELADA') return 'btn btn-danger';
    if (next === 'ENTREGADA') return 'btn btn-success';
    return 'btn btn-amber';
  };

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="card mb-4">
        <p className="section-title" style={{ marginBottom: 8 }}>Flujo de la orden</p>
        <StatusStepper status={order.status} />
        <p className="muted" style={{ marginTop: 6 }}>
          Estado actual: <strong>{STATUS_LABELS[order.status]}</strong>
        </p>
      </div>

      {transitions.length === 0 ? (
        <div className="alert-success">
          ✓ Esta orden no admite más cambios de estado
          {order.status === 'ENTREGADA' ? ' — fue entregada al cliente.' : '.'}
        </div>
      ) : (
        <div className="card">
          <p className="section-title">Cambiar estado</p>
          <div className="actions-strip">
            {transitions.map((next) => (
              <button
                key={next}
                className={btnClass(next)}
                disabled={changing}
                onClick={() => { setNote(''); setConfirmModal({ next, label: STATUS_LABELS[next] }); }}
              >
                Pasar a {STATUS_LABELS[next]} →
              </button>
            ))}
          </div>
          {!isAdmin && allTransitions.some((t) => MECANICO_BLOCKED.includes(t)) && (
            <p className="xs" style={{ marginTop: 10 }}>
              ⓘ Entregar o cancelar la orden requiere permisos de ADMIN.
            </p>
          )}
        </div>
      )}

      {confirmModal && (
        <Modal
          title="Confirmar cambio de estado"
          onClose={() => setConfirmModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Cancelar</button>
              <button
                className={confirmModal.next === 'CANCELADA' ? 'btn btn-danger' : 'btn btn-primary'}
                disabled={changing}
                onClick={handleConfirm}
              >
                {changing ? <><div className="spinner" /> Cambiando...</> : `Confirmar → ${confirmModal.label}`}
              </button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Cambiar de <strong>{STATUS_LABELS[order.status]}</strong> a{' '}
            <strong>{confirmModal.label}</strong>.
          </p>
          {confirmModal.next === 'CANCELADA' && (
            <div className="alert-error" style={{ marginTop: 8 }}>⚠ Esta acción no se puede deshacer.</div>
          )}
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>Nota o motivo (opcional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Cliente recogió la moto..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Tab: Historial
────────────────────────────────────────────── */
function TabHistorial({ orderId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    workOrderService.getHistory(orderId)
      .then((res) => setHistory(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Spinner center label="Cargando historial..." />;

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>Sin registros de historial.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Línea vertical */}
          <div style={{
            position: 'absolute', left: 10, top: 8, bottom: 8,
            width: 2, background: 'var(--border)',
          }} />

          {history.map((h, i) => (
            <div key={h.id} style={{
              position: 'relative', marginBottom: i < history.length - 1 ? 20 : 0,
            }}>
              {/* Punto en la línea */}
              <div style={{
                position: 'absolute', left: -22, top: 14,
                width: 10, height: 10, borderRadius: '50%',
                background: h.toStatus === 'CANCELADA' ? 'var(--red)'
                  : h.toStatus === 'ENTREGADA' ? 'var(--teal)'
                  : 'var(--primary)',
                border: '2px solid var(--surface)',
                boxShadow: '0 0 0 2px var(--border)',
              }} />

              <div className="card" style={{ padding: '12px 16px' }}>
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                  {/* Transición */}
                  <div className="flex items-center gap-2">
                    {h.fromStatus ? (
                      <>
                        <StatusBadge status={h.fromStatus} />
                        <span style={{ color: 'var(--text-3)', fontSize: 14 }}>→</span>
                        <StatusBadge status={h.toStatus} />
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Orden creada</span>
                        <span style={{ color: 'var(--text-3)', fontSize: 14 }}>→</span>
                        <StatusBadge status={h.toStatus} />
                      </>
                    )}
                  </div>

                  {/* Fecha */}
                  <span className="xs">{fmtDate(h.createdAt)}</span>
                </div>

                {/* Usuario */}
                <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 16 }}>👤</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {h.changedBy?.name ?? 'Sistema'}
                    <span className={`badge ${h.changedBy?.role === 'ADMIN' ? 'badge-LISTA' : 'badge-EN_PROCESO'}`}
                      style={{ marginLeft: 8 }}>
                      {h.changedBy?.role ?? ''}
                    </span>
                  </span>
                </div>

                {/* Nota */}
                {h.note && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px',
                    background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                    fontSize: 13, color: 'var(--text-2)',
                    borderLeft: '3px solid var(--primary)',
                  }}>
                    {h.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Página principal
────────────────────────────────────────────── */
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('info');
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchOrder = useCallback(async () => {
    setError('');
    try {
      const data = await workOrderService.get(id);
      setOrder(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleDownloadReceipt = () => {
    setError('');
    setExportingPdf(true);

    try {
      downloadWorkOrderReceiptPdf(order);
    } catch (err) {
      setError(err?.message || 'No fue posible generar el recibo PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const canEdit = order && !['ENTREGADA', 'CANCELADA'].includes(order.status);

  if (loading) return <Spinner center label="Cargando orden..." />;
  if (error && !order) return (
    <div>
      <button className="back-link" onClick={() => navigate('/')}>← Volver</button>
      <ErrorBanner message={error} />
    </div>
  );

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/')}>← Volver al listado</button>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Orden #{order.id}</h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="order-header-actions">
          <div className="flex items-center gap-2 muted" style={{ fontSize: 13 }}>
            <span className="plate-text">{order.bike?.plate}</span>
            <span>·</span>
            <span>{order.bike?.client?.name}</span>
            <span>·</span>
            <span>{order.entryDate}</span>
          </div>
          <button className="btn btn-primary" type="button" onClick={handleDownloadReceipt} disabled={exportingPdf}>
            {exportingPdf ? 'Generando...' : '↓ Descargar recibo PDF'}
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info'      && <TabInfo order={order} />}
      {tab === 'items'     && <TabItems order={order} canEdit={canEdit} onRefresh={fetchOrder} />}
      {tab === 'estado'    && <TabEstado order={order} onRefresh={fetchOrder} />}
      {tab === 'historial' && <TabHistorial orderId={id} />}
    </div>
  );
}
