import { useState } from 'react';

const UserForm = ({ user, onSubmit, onCancel, theme }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    membership: user?.membership || '',
    status: user?.status || 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Teléfono</label>
        <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Membresía</label>
        <input name="membership" value={form.membership} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Estado</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="pending">Pendiente</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
      </div>
    </form>
  );
};

export default UserForm;
