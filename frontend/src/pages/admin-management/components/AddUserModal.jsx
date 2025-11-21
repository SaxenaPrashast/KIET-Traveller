import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';

const AddUserModal = ({ open, onClose, onUserAdded }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      setLoading(false);
      // server returns { success, message, data }
      if (res && res.success) {
        const createdUser = res.data?.user;
        alert(res.message || 'User added successfully');
        onUserAdded && onUserAdded(createdUser);
        onClose && onClose();
      } else {
        setError((res && res.message) || 'Failed to add user');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to add user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
          </div>
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
          <Input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
          <div className="flex gap-2">
            <select name="role" value={form.role} onChange={handleChange} className="input text-foreground bg-card">
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="input" />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end space-x-2 mt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
