import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeService } from '../services/bikeService';
import { clientService } from '../services/clientService';
import { workOrderService } from '../services/workOrderService';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorBanner from '../components/ErrorBanner';

export default function NewOrderPage() {
  const navigate = useNavigate();

  const [plate, setPlate] = useState('');
  const [bike, setBike] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Registro rápido si la moto/cliente no existen
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickForm, setQuickForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    brand: '',
    model: '',
    cylinder: '',
  });

  const [faultDescription, setFaultDescription] = useState('');

  const handleSearchPlate = async (e) => {
    e.preventDefault();
    if (!plate.trim()) return;
    setSearching(true);
    setError('');
    setBike(null);
    try {
      const results = await bikeService.list(plate.trim());
      const exact = results.find((b) => b.plate === plate.trim().toUpperCase());
      if (exact) {
        setBike(exact);
        setShowQuickCreate(false);
      } else {
        setShowQuickCreate(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleQuickFormChange = (field) => (e) =>
    setQuickForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const client = await clientService.create({
        name: quickForm.clientName,
        phone: quickForm.clientPhone,
        email: quickForm.clientEmail || undefined,
      });

      const newBike = await bikeService.create({
        plate: plate.trim(),
        brand: quickForm.brand,
        model: quickForm.model,
        cylinder: quickForm.cylinder || undefined,
        clientId: client.id,
      });

      setBike(newBike);
      setShowQuickCreate(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!bike) return;
    setError('');
    setSubmitting(true);
    try {
      const order = await workOrderService.create({
        motoId: bike.id,
        faultDescription,
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h1>Nueva orden de trabajo</h1>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="card">
        <h2>1. Buscar moto por placa</h2>
        <form className="inline-form" onSubmit={handleSearchPlate}>
          <input
            type="text"
            placeholder="Ej: ABC123"
            value={plate}
            onChange={(e) => {
              setPlate(e.target.value.toUpperCase());
              setBike(null);
              setShowQuickCreate(false);
              setSearched(false);
            }}
          />
          <button type="submit" className="btn btn-secondary" disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {bike && (
          <div className="found-bike">
            ✓ Moto encontrada: <strong>{bike.plate}</strong> — {bike.brand} {bike.model} (
            {bike.client?.name})
          </div>
        )}

        {searched && !bike && showQuickCreate && (
          <div className="quick-create">
            <p className="muted">No se encontró ninguna moto con esa placa. Regístrala junto con el cliente:</p>
            <form onSubmit={handleQuickCreate} className="form-grid">
              <label>
                Nombre del cliente
                <input
                  required
                  value={quickForm.clientName}
                  onChange={handleQuickFormChange('clientName')}
                />
              </label>
              <label>
                Teléfono del cliente
                <input
                  required
                  value={quickForm.clientPhone}
                  onChange={handleQuickFormChange('clientPhone')}
                />
              </label>
              <label>
                Email del cliente (opcional)
                <input
                  type="email"
                  value={quickForm.clientEmail}
                  onChange={handleQuickFormChange('clientEmail')}
                />
              </label>
              <label>
                Marca de la moto
                <input required value={quickForm.brand} onChange={handleQuickFormChange('brand')} />
              </label>
              <label>
                Modelo
                <input required value={quickForm.model} onChange={handleQuickFormChange('model')} />
              </label>
              <label>
                Cilindraje (opcional)
                <input value={quickForm.cylinder} onChange={handleQuickFormChange('cylinder')} />
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Registrar cliente y moto'}
              </button>
            </form>
          </div>
        )}
      </div>

      {bike && (
        <div className="card">
          <h2>2. Detalle de la orden</h2>
          <form onSubmit={handleCreateOrder} className="form-grid">
            <label>
              Descripción de la falla
              <textarea
                required
                rows={4}
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                placeholder="Describe el motivo del ingreso de la moto..."
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creando orden...' : 'Crear orden'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
