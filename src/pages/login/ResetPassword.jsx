import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../../config/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, message: null, error: null });

  useEffect(() => {
    if (!token) {
      setStatus({ loading: false, message: null, error: 'Invalid or missing token.' });
    }
  }, [token]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setStatus({ loading: true, message: null, error: null });

    if (!token) return setStatus({ loading: false, message: null, error: 'Missing token' });
    if (form.newPassword.length < 6) return setStatus({ loading: false, message: null, error: 'Password must be at least 6 characters' });
    if (form.newPassword !== form.confirmPassword) return setStatus({ loading: false, message: null, error: 'Passwords do not match' });

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password/${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: form.newPassword })
      });

      const payload = await res.json();
      if (!res.ok) {
        return setStatus({ loading: false, message: null, error: payload?.message || 'Failed to reset password' });
      }

      setStatus({ loading: false, message: 'Password reset successfully. Redirecting to login...', error: null });
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, message: null, error: 'Unable to process request. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-modal p-8">
          <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
          <p className="text-sm text-muted-foreground mb-4">Enter a new password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="New password"
              value={form.newPassword}
              onChange={(e) => handleChange('newPassword', e?.target?.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e?.target?.value)}
              required
            />

            {status.error && <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{status.error}</div>}
            {status.message && <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">{status.message}</div>}

            <Button type="submit" fullWidth disabled={status.loading}>
              {status.loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <div className="text-xs text-muted-foreground mt-2">If you didn't request this, you can safely ignore this message.</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
