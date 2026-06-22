import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">🛍️ ShopNest</Link>

                <div className="navbar-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search products…" id="navbar-search-input" />
                </div>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Hi, {user?.username}
                            </span>
                            <Link to="/cart" className="cart-btn">
                                🛒
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            <button className="btn btn-ghost" onClick={handleLogout} id="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" id="nav-login-link">Login</Link>
                            <Link to="/register" className="btn btn-primary" id="nav-register-btn">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
