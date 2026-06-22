import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/api';
import { useToast } from '../components/Toast';

export default function ForgotPasswordPage() {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await requestPasswordReset(email);
            setSuccess(true);
            showToast(res.message || 'Password reset link sent! 📧', 'success');
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
            showToast(err.message || 'Failed to request password reset', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🛍️ ShopNest</div>
                <h1 className="auth-title">Forgot Password</h1>
                <p className="auth-subtitle">
                    Enter your email address to recover your account access.
                </p>

                {error && <div className="form-error">{error}</div>}

                {success ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div className="success-icon" style={{
                            fontSize: '48px',
                            color: '#28a745',
                            margin: '20px 0'
                        }}>📧</div>
                        <p className="auth-subtitle" style={{ fontSize: '0.95rem' }}>
                            We have sent a password reset link to your email if an account is registered. Please check your inbox and follow the instructions.
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', padding: '13px', marginTop: '20px', textDecoration: 'none' }}>
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} id="forgot-password-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="forgot-email">Email Address</label>
                            <input
                                id="forgot-email"
                                type="email"
                                className="form-input"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            id="forgot-submit"
                            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                        >
                            {loading ? '⏳ Sending Link…' : '→ Send Reset Link'}
                        </button>

                        <div className="auth-footer" style={{ marginTop: '20px' }}>
                            Remembered your password? <Link to="/login">Sign In</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
