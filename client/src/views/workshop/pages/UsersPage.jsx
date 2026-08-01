import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from 'contexts/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'MECANICO' };

export default function UsersPage() {
  const { user: me, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const setF = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleCreate = async () => {
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return setFormError('Nombre, email y contraseña son obligatorios.');
    }
    if (form.password.length < 6) {
      return setFormError('La contraseña debe tener al menos 6 caracteres.');
    }
    setSubmitting(true);
    try {
      await authService.register(form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await authService.updateUser(u.id, { active: !u.active });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleRole = async (u) => {
    try {
      await authService.updateUser(u.id, { role: u.role === 'ADMIN' ? 'MECANICO' : 'ADMIN' });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!isAdmin) return <ErrorBanner message="Esta sección requiere rol ADMIN." />;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setForm(EMPTY_FORM); }}>
          + Nuevo usuario
        </button>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /><span>Cargando usuarios...</span></div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="mobile-card-table users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="mobile-primary" data-label="Nombre">
                      <strong>{u.name}</strong>
                      {u.id === me.id && <span className="xs" style={{ marginLeft: 6 }}>(tú)</span>}
                    </td>
                    <td className="muted" data-label="Email">{u.email}</td>
                    <td data-label="Rol">
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-LISTA' : 'badge-EN_PROCESO'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td data-label="Estado">
                      <span className={`badge ${u.active ? 'badge-LISTA' : 'badge-CANCELADA'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="mobile-actions" data-label="Acciones">
                      <div className="flex gap-2">
                        {u.id !== me.id && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u)}>
                              → {u.role === 'ADMIN' ? 'MECANICO' : 'ADMIN'}
                            </button>
                            <button
                              className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleActive(u)}
                            >
                              {u.active ? 'Desactivar' : 'Activar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="Nuevo usuario"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                {submitting ? <><div className="spinner" /> Creando...</> : 'Crear usuario'}
              </button>
            </>
          }
        >
          {formError && <div className="alert-error">{formError}</div>}
          <div className="form-group">
            <label>Nombre *</label>
            <input value={form.name} onChange={setF('name')} placeholder="Nombre completo" autoFocus />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={setF('email')} placeholder="usuario@taller.com" />
          </div>
          <div className="form-group">
            <label>Contraseña * (mín. 6 caracteres)</label>
            <input type="password" value={form.password} onChange={setF('password')} placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={form.role} onChange={setF('role')}>
              <option value="MECANICO">MECANICO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
