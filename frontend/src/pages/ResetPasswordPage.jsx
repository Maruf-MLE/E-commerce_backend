import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from '../api/api';
import { useToast } from '../components/Toast';

export default function ResetPasswordPage() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await confirmPasswordReset(uid, token, password);
            setSuccess(true);
            showToast(res.message || 'Password reset successful! 🎉', 'success');
        } catch (err) {
            setError(err.message || 'Verification or password reset failed. The link might be expired.');
            showToast(err.message || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🛍️ ShopNest</div>
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">
                    Please key in your new password below.
                </p>

                {error && <div className="form-error">{error}</div>}

                {success ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div className="success-icon" style={{
                            fontSize: '48px',
                            color: '#28a745',
                            margin: '20px 0'
                        }}>✓</div>
                        <h2 className="auth-title" style={{ color: '#28a745' }}>Success!</h2>
                        <p className="auth-subtitle">
                            Your password has been reset successfully. You can now use your new password to sign in.
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', padding: '13px', marginTop: '20px', textDecoration: 'none' }}>
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} id="reset-password-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="new-password">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                className="form-input"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                            <input
                                id="confirm-new-password"
                                type="password"
                                className="form-input"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            id="reset-submit"
                            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                        >
                            {loading ? '⏳ Resetting Password…' : '→ Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
