import { useState } from 'react';
import Modal from './Modal';
import ErrorBanner from './ErrorBanner';
import { bikeService } from '../services/bikeService';
import { clientService } from '../services/clientService';
import { workOrderService } from '../services/workOrderService';
import { getErrorMessage } from '../utils/getErrorMessage';

const EMPTY = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  plate: '',
  brand: '',
  model: '',
  cylinder: '',
  faultDescription: ''
};

const getExactBike = async (plate) => {
  const results = await bikeService.list(plate);
  return results.find((bike) => bike.plate === plate) || null;
};

export default function NewOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [selectedBike, setSelectedBike] = useState(null);
  const [plateError, setPlateError] = useState('');
  const [error, setError] = useState('');
  const [searchingPlate, setSearchingPlate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) => {
    const value = field === 'plate' ? event.target.value.toUpperCase() : event.target.value;

    if (field === 'plate') {
      const wasExisting = Boolean(selectedBike);
      setPlateError('');
      setError('');
      setSelectedBike(null);
      setForm((current) => ({
        ...current,
        plate: value,
        clientName: wasExisting ? '' : current.clientName,
        clientPhone: wasExisting ? '' : current.clientPhone,
        clientEmail: wasExisting ? '' : current.clientEmail,
        brand: wasExisting ? '' : current.brand,
        model: wasExisting ? '' : current.model,
        cylinder: wasExisting ? '' : current.cylinder
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const loadExistingBike = (bike) => {
    setSelectedBike(bike);
    setPlateError('');
    setForm((current) => ({
      ...current,
      plate: bike.plate,
      clientName: bike.client?.name || '',
      clientPhone: bike.client?.phone || '',
      clientEmail: bike.client?.email || '',
      brand: bike.brand || '',
      model: bike.model || '',
      cylinder: bike.cylinder || ''
    }));
  };

  const handlePlateBlur = async () => {
    const plate = form.plate.trim().toUpperCase();
    if (!plate) return;

    setSearchingPlate(true);
    setPlateError('');
    try {
      const bike = await getExactBike(plate);
      if (bike) loadExistingBike(bike);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSearchingPlate(false);
    }
  };

  const validateNewBike = () => {
    if (!form.clientName.trim()) return 'El nombre del cliente es obligatorio.';
    if (!form.clientPhone.trim()) return 'El teléfono del cliente es obligatorio.';
    if (!form.brand.trim()) return 'La marca de la moto es obligatoria.';
    if (!form.model.trim()) return 'El modelo de la moto es obligatorio.';
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setPlateError('');

    const plate = form.plate.trim().toUpperCase();
    if (!plate) return setError('La placa es obligatoria.');
    if (!form.faultDescription.trim()) return setError('Describe la falla o motivo de ingreso.');

    setSubmitting(true);
    try {
      // Se consulta nuevamente al guardar para evitar crear una placa duplicada
      // si el usuario presiona el botón antes de que termine el evento onBlur.
      const existingBike =
        selectedBike?.plate === plate ? selectedBike : await getExactBike(plate);

      let bike = existingBike;

      if (!bike) {
        const validationError = validateNewBike();
        if (validationError) {
          setError(validationError);
          return;
        }

        const client = await clientService.create({
          name: form.clientName.trim(),
          phone: form.clientPhone.trim(),
          email: form.clientEmail.trim() || undefined
        });

        bike = await bikeService.create({
          plate,
          brand: form.brand.trim(),
          model: form.model.trim(),
          cylinder: form.cylinder.trim() || undefined,
          clientId: client.id
        });
      }

      const order = await workOrderService.create({
        motoId: bike.id,
        faultDescription: form.faultDescription.trim()
      });

      onCreated(order);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      if (message.toLowerCase().includes('placa')) {
        setPlateError(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const existing = Boolean(selectedBike);

  return (
    <Modal
      title="Nueva orden de trabajo"
      onClose={onClose}
      size="modal-lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting || searchingPlate || Boolean(plateError)}
            onClick={handleSubmit}
          >
            {submitting ? <><div className="spinner" /> Creando orden...</> : 'Crear orden'}
          </button>
        </>
      }
    >
      <ErrorBanner message={error} onClose={() => setError('')} />

      <p className="section-title">Moto</p>
      <div className="form-group">
        <label>Placa *</label>
        <input
          value={form.plate}
          onChange={set('plate')}
          onBlur={handlePlateBlur}
          placeholder="ABC123"
          autoFocus
          style={plateError ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px rgba(220,38,38,.12)' } : {}}
        />
        {searchingPlate && <span className="muted" style={{ fontSize: 12 }}>Buscando moto...</span>}
        {plateError && <span style={{ color: 'var(--red)', fontSize: 12 }}>⚠ {plateError}</span>}
      </div>

      {existing && (
        <div className="alert-success" style={{ marginBottom: 16 }}>
          ✓ Moto encontrada. La nueva orden se asociará a esta moto sin volver a registrarla.
        </div>
      )}

      <div className="form-row-3">
        <div className="form-group">
          <label>Marca *</label>
          <input value={form.brand} onChange={set('brand')} placeholder="Yamaha" disabled={existing} />
        </div>
        <div className="form-group">
          <label>Modelo *</label>
          <input value={form.model} onChange={set('model')} placeholder="FZ 150" disabled={existing} />
        </div>
        <div className="form-group">
          <label>Cilindraje (opcional)</label>
          <input value={form.cylinder} onChange={set('cylinder')} placeholder="150cc" disabled={existing} />
        </div>
      </div>

      <hr className="divider" />
      <p className="section-title">Cliente propietario</p>

      <div className="form-row">
        <div className="form-group">
          <label>Nombre *</label>
          <input
            value={form.clientName}
            onChange={set('clientName')}
            placeholder="Nombre completo"
            disabled={existing}
          />
        </div>
        <div className="form-group">
          <label>Teléfono *</label>
          <input
            value={form.clientPhone}
            onChange={set('clientPhone')}
            placeholder="Celular o fijo"
            disabled={existing}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Email (opcional)</label>
        <input
          type="email"
          value={form.clientEmail}
          onChange={set('clientEmail')}
          placeholder="correo@ejemplo.com"
          disabled={existing}
        />
      </div>

      <hr className="divider" />
      <p className="section-title">Motivo de ingreso</p>

      <div className="form-group">
        <label>Descripción de la falla *</label>
        <textarea
          rows={3}
          value={form.faultDescription}
          onChange={set('faultDescription')}
          placeholder="Describe el problema reportado por el cliente..."
          style={{ resize: 'vertical' }}
        />
      </div>
    </Modal>
  );
}
