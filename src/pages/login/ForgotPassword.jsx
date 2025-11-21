import React, { useState } from 'react';
import { API_BASE } from '../../config/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: null, error: null });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setStatus({ loading: true, message: null, error: null });

    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setStatus({ loading: false, message: 'If an account with that email exists, a password reset link has been sent.', error: null });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, message: null, error: 'Unable to process request. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-modal p-8">
          <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
          <p className="text-sm text-muted-foreground mb-4">Enter the email associated with your account and we'll send a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e?.target?.value)}
              required
            />

            {status.error && <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{status.error}</div>}
            {status.message && <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">{status.message}</div>}

            <Button type="submit" fullWidth disabled={status.loading || !!status.message}>
              {status.loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-xs text-muted-foreground mt-2">If you don't receive an email, check your spam folder or try again later.</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
