import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/api';

export default function VerifyEmailPage() {
    const { uid, token } = useParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function performVerification() {
            try {
                const res = await verifyEmail(uid, token);
                if (isMounted) {
                    setStatus('success');
                    setMessage(res.message || 'Your email has been verified successfully!');
                }
            } catch (err) {
                if (isMounted) {
                    setStatus('error');
                    setMessage(err.message || 'Invalid or expired verification link.');
                }
            }
        }
        performVerification();
        return () => {
            isMounted = false;
        };
    }, [uid, token]);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="auth-logo">🛍️ ShopNest</div>

                {status === 'verifying' && (
                    <div>
                        <div className="loading-spinner" style={{
                            margin: '30px auto',
                            width: '50px',
                            height: '50px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid var(--primary-color, #ff4e00)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <h2 className="auth-title">Verifying your email...</h2>
                        <p className="auth-subtitle">Please wait while we confirm your credentials.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <div className="success-icon" style={{
                            fontSize: '48px',
                            color: '#28a745',
                            margin: '20px 0'
                        }}>✓</div>
                        <h2 className="auth-title" style={{ color: '#28a745' }}>Email Verified!</h2>
                        <p className="auth-subtitle">{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', padding: '13px', marginTop: '20px', textDecoration: 'none' }}>
                            Go to Sign In
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div className="error-icon" style={{
                            fontSize: '48px',
                            color: '#dc3545',
                            margin: '20px 0'
                        }}>✗</div>
                        <h2 className="auth-title" style={{ color: '#dc3545' }}>Verification Failed</h2>
                        <p className="auth-subtitle">{message}</p>
                        <Link to="/register" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', padding: '13px', marginTop: '20px', textDecoration: 'none', backgroundColor: '#6c757d' }}>
                            Back to Register
                        </Link>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}} />
            </div>
        </div>
    );
}
