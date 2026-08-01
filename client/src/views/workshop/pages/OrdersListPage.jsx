import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { workOrderService } from '../services/workOrderService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { ALL_STATUSES, STATUS_LABELS } from '../utils/workOrderStatus';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import NewOrderModal from '../components/NewOrderModal';

const PAGE_SIZE = 10;

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v));

export default function OrdersListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workOrderService.list({
        status: filterStatus || undefined,
        plate: filterPlate || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlate, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleOrderCreated = (order) => {
    setShowModal(false);
    navigate(`/orders/${order.id}`);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Órdenes de trabajo</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva orden
        </button>
      </div>

      <div className="filters">
        <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filtrar por placa..."
          value={filterPlate}
          onChange={handleFilterChange(setFilterPlate)}
        />
        {(filterStatus || filterPlate) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFilterStatus(''); setFilterPlate(''); setPage(1); }}
          >
            Limpiar filtros
          </button>
        )}
        {!loading && (
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {pagination.total} {pagination.total === 1 ? 'orden' : 'órdenes'}
          </span>
        )}
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <Spinner center label="Cargando órdenes..." />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No hay órdenes que coincidan con los filtros.</p>
            {!filterStatus && !filterPlate && (
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
                Crear primera orden
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="mobile-card-table orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Placa</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Ingreso</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/orders/${o.id}`)}
                  >
                    <td className="muted" data-label="Orden">#{o.id}</td>
                    <td className="mobile-primary" data-label="Moto">
                      <span className="plate-text">{o.bike?.plate}</span>
                      <div className="xs">{o.bike?.brand} {o.bike?.model}</div>
                    </td>
                    <td data-label="Cliente">{o.bike?.client?.name}</td>
                    <td data-label="Estado"><StatusBadge status={o.status} /></td>
                    <td className="muted" data-label="Ingreso">{o.entryDate}</td>
                    <td className="money" data-label="Total">{fmt(o.total)}</td>
                    <td className="mobile-actions" data-label="Acciones">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`); }}
                      >
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>← Ant.</button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Sig. →</button>
        </div>
      )}

      {showModal && (
        <NewOrderModal onClose={() => setShowModal(false)} onCreated={handleOrderCreated} />
      )}
    </>
  );
}
