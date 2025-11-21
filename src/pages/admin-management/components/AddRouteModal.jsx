import React, { useState } from 'react';
import { API_BASE } from '../../../config/constants';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';

const AddRouteModal = ({ open, onClose, onRouteAdded }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    routeNumber: '',
    name: '',
    estimatedDuration: 30,
    //frequency: 30,
    //capacity: 30,
    operatingHours: { start: '06:00', end: '22:00' },
    operatingDays: ['monday','tuesday','wednesday','thursday','friday'],
    // start/end stop name fields (no coordinates required)
    startStopName: '',
    endStopName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'start' || name === 'end') {
      setForm(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, [name]: value } }));
      return;
    }
    if (name === 'operatingDays') {
      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
      setForm(prev => ({ ...prev, operatingDays: opts }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // prepare payload: do not include stop coordinates here
      const payload = { ...form };
      // include startStop/endStop names as simple fields if provided
      if (form.startStopName) payload.startStopName = form.startStopName;
      if (form.endStopName) payload.endStopName = form.endStopName;

      const res = await fetch(`${API_BASE}/routes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.message || 'Failed to create route');
        return;
      }

      alert(data.message || 'Route created successfully');
      onRouteAdded && onRouteAdded(data.data && data.data.route ? data.data.route : null);
      onClose && onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create route');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Create Route</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input name="routeNumber" value={form.routeNumber} onChange={handleChange} placeholder="Route Number (e.g. R-001)" />
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Route Name" />
          </div>
         

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Start Time</label>
              <Input name="start" value={form.operatingHours.start} onChange={handleChange} type="time" className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">End Time</label>
              <Input name="end" value={form.operatingHours.end} onChange={handleChange} type="time" className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Operating Days</label>
              <select name="operatingDays" value={form.operatingDays} onChange={handleChange} multiple className="input h-24 text-foreground bg-card">
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>

          {/* Start / End stop inputs */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Start Stop</label>
              <Input name="startStopName" value={form.startStopName} onChange={handleChange} placeholder="Start stop name" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">End Stop</label>
              <Input name="endStopName" value={form.endStopName} onChange={handleChange} placeholder="End stop name" />
              
            </div>
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

export default AddRouteModal;
