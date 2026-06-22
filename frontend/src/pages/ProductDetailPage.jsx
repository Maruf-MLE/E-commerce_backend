import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const PLACEHOLDER_EMOJIS = ['👟', '👗', '📱', '💻', '⌚', '🎧', '📷', '🎮', '👜', '💎'];

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchProduct(id)
            .then(setProduct)
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    async function handleAddToCart() {
        if (!isAuthenticated) {
            showToast('Please login to add items to cart', 'error');
            navigate('/login');
            return;
        }
        try {
            setAdding(true);
            await addItem(product.id);
            showToast(`${product.name} added to cart!`, 'success');
        } catch (err) {
            if (err.message !== 'PROFILE_INCOMPLETE') {
                showToast('Failed to add to cart', 'error');
            }
        } finally {
            setAdding(false);
        }
    }

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading product…</p>
            </div>
        );
    }

    if (!product) return null;

    const emoji = PLACEHOLDER_EMOJIS[product.id % PLACEHOLDER_EMOJIS.length];

    return (
        <div className="product-detail-page">
            <button className="back-btn" onClick={() => navigate(-1)} id="back-btn">
                ← Back to products
            </button>

            <div className="product-detail-grid">
                {/* IMAGE */}
                <div className="product-detail-img">
                    {product.image ? (
                        <img src={`http://localhost:8000${product.image}`} alt={product.name} />
                    ) : (
                        <div className="placeholder">{emoji}</div>
                    )}
                </div>

                {/* INFO */}
                <div className="product-detail-info">
                    {product.category?.name && (
                        <p className="product-detail-category">{product.category.name}</p>
                    )}
                    <h1 className="product-detail-name">{product.name}</h1>
                    {product.description && (
                        <p className="product-detail-desc">{product.description}</p>
                    )}
                    <div className="product-detail-price">
                        <span>৳ </span>{parseFloat(product.price).toLocaleString()}
                    </div>

                    <div className="product-detail-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleAddToCart}
                            disabled={adding}
                            id="detail-add-to-cart"
                            style={{ padding: '14px 32px', fontSize: '1rem' }}
                        >
                            {adding ? '⏳ Adding…' : '🛒 Add to Cart'}
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigate('/cart')}
                            id="detail-view-cart"
                        >
                            View Cart
                        </button>
                    </div>

                    {/* META */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 18px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <div>🚚 Free delivery on orders over ৳500</div>
                        <div>🔄 7-day easy return policy</div>
                        <div>🔒 Secure checkout guaranteed</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
