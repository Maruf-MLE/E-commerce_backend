import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../api/api';
import { useToast } from '../components/Toast';

export default function ProfileSetupPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [form, setForm] = useState({ phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.phone.trim() || !form.address.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await saveProfile({ phone: form.phone, address: form.address, active: true });
            showToast('Profile saved! Welcome to ShopNest 🎉', 'success');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🛍️ ShopNest</div>
                <h1 className="auth-title">Complete Your Profile</h1>
                <p className="auth-subtitle">
                    Just a few more details to get you started!
                </p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} id="profile-setup-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-phone">
                            📱 Phone Number
                        </label>
                        <input
                            id="profile-phone"
                            name="phone"
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 01712345678"
                            value={form.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-address">
                            📍 Delivery Address
                        </label>
                        <textarea
                            id="profile-address"
                            name="address"
                            className="form-input"
                            placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                            value={form.address}
                            onChange={handleChange}
                            rows={3}
                            style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="profile-setup-submit"
                        style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                    >
                        {loading ? '⏳ Saving...' : '✓ Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
