import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import { useToast } from '../components/Toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.username || !form.email || !form.password || !form.password2) {
            setError('Please fill in all required fields.');
            return;
        }
        if (form.password !== form.password2) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await registerUser(form);
            showToast('Account created! Please check your email for a verification link to activate your account.', 'success');
            navigate('/login');
        } catch (err) {
            try {
                const parsed = JSON.parse(err.message);
                const msgs = Object.values(parsed).flat();
                setError(msgs.join(' '));
            } catch {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🛍️ ShopNest</div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join thousands of happy shoppers today</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} id="register-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-username">Username *</label>
                        <input
                            id="reg-username"
                            name="username"
                            type="text"
                            className="form-input"
                            placeholder="Choose a username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email *</label>
                        <input
                            id="reg-email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password *</label>
                        <input
                            id="reg-password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password2">Confirm Password *</label>
                        <input
                            id="reg-password2"
                            name="password2"
                            type="password"
                            className="form-input"
                            placeholder="Repeat your password"
                            value={form.password2}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="register-submit"
                        style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                    >
                        {loading ? '⏳ Creating account…' : '🚀 Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
