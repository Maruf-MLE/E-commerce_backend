import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, googleLogin, getProfileStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.username || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const data = await loginUser(form.username, form.password);
            const userData = { username: form.username };
            login(userData, data.access);
            // profile complete কি না চেক করো
            const profile = await getProfileStatus();
            showToast('Welcome back! 👋', 'success');
            if (!profile.is_completed) {
                navigate('/profile/setup');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        try {
            setError('');
            const data = await googleLogin(credentialResponse.credential);
            const userData = { username: data.username || 'User' };
            login(userData, data.access);
            // profile complete কি না চেক করো
            const profile = await getProfileStatus();
            showToast('Welcome! Signed in with Google 🎉', 'success');
            if (!profile.is_completed) {
                navigate('/profile/setup');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Google sign-in failed. Please try again.');
        }
    }

    function handleGoogleError() {
        setError('Google sign-in was cancelled or failed. Please try again.');
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🛍️ ShopNest</div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} id="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-username">Username or Email</label>
                        <input
                            id="login-username"
                            name="username"
                            type="text"
                            className="form-input"
                            placeholder="Enter your username or email"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="login-submit"
                        style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                    >
                        {loading ? '⏳ Signing in…' : '→ Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    margin: '20px 0', color: 'var(--text-muted)'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Google Login Button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="signin_with"
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                <div className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
