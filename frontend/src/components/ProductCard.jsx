import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const PLACEHOLDER_EMOJIS = ['👟', '👗', '📱', '💻', '⌚', '🎧', '📷', '🎮', '👜', '💎'];

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const emoji = PLACEHOLDER_EMOJIS[product.id % PLACEHOLDER_EMOJIS.length];

    async function handleAddToCart(e) {
        e.stopPropagation();
        if (!isAuthenticated) {
            showToast('Please login to add items to cart', 'error');
            navigate('/login');
            return;
        }
        try {
            await addItem(product.id);
            showToast(`${product.name} added to cart!`, 'success');
        } catch (err) {
            if (err.message !== 'PROFILE_INCOMPLETE') {
                showToast('Failed to add to cart', 'error');
            }
        }
    }

    return (
        <div className="product-card" onClick={() => navigate(`/products/${product.id}`)} id={`product-card-${product.id}`}>
            <div className="product-card-img">
                {product.image ? (
                    <img src={`http://localhost:8000${product.image}`} alt={product.name} />
                ) : (
                    <div className="product-card-img-placeholder">{emoji}</div>
                )}
                <span className="product-card-badge">New</span>
            </div>

            <div className="product-card-body">
                {product.category?.name && (
                    <p className="product-card-category">{product.category.name}</p>
                )}
                <h3 className="product-card-name">{product.name}</h3>
                {product.description && (
                    <p className="product-card-desc">{product.description}</p>
                )}
                <div className="product-card-footer">
                    <div className="product-price">
                        <span className="currency">৳</span>{parseFloat(product.price).toLocaleString()}
                    </div>
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        id={`add-to-cart-${product.id}`}
                    >
                        🛒 Add
                    </button>
                </div>
            </div>
        </div>
    );
}
