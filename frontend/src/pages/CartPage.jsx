import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/api';
import { useToast } from '../components/Toast';

const PLACEHOLDER_EMOJIS = ['👟', '👗', '📱', '💻', '⌚', '🎧', '📷', '🎮', '👜', '💎'];

export default function CartPage() {
    const { cart, loading, removeItem, updateQty, loadCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [placing, setPlacing] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <div className="icon">🔒</div>
                    <h3>Login Required</h3>
                    <p style={{ marginBottom: '24px' }}>Please login to view your cart.</p>
                    <Link to="/login" className="btn btn-primary" id="cart-login-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading your cart…</p>
            </div>
        );
    }

    const items = cart?.items ?? [];
    const total = items.reduce((sum, item) => sum + parseFloat(item.product_price) * item.quantity, 0);

    async function handlePlaceOrder() {
        if (!address.trim()) { showToast('Please enter a delivery address', 'error'); return; }
        if (!phone.trim()) { showToast('Please enter your phone number', 'error'); return; }
        if (items.length === 0) { showToast('Your cart is empty', 'error'); return; }
        try {
            setPlacing(true);
            const result = await createOrder({ address, phone, payment_method: paymentMethod });
            showToast(`Order #${result.order_id} placed successfully! 🎉`, 'success');
            await loadCart();
            setAddress('');
            setPhone('');
        } catch (error) {
            if (error.message === 'PROFILE_INCOMPLETE') {
                showToast('Please complete your profile details to place an order.', 'warning');
                navigate('/profile/setup');
            } else {
                showToast('Failed to place order. Please try again.', 'error');
            }
        } finally {
            setPlacing(false);
        }
    }

    async function handleRemove(item_id) {
        try {
            await removeItem(item_id);
            showToast('Item removed', 'info');
        } catch {
            showToast('Failed to remove item', 'error');
        }
    }

    async function handleQtyChange(item_id, newQty) {
        if (newQty < 1) return;
        try { await updateQty(item_id, newQty); }
        catch { showToast('Failed to update quantity', 'error'); }
    }

    return (
        <div className="cart-page">
            <h1 className="cart-page-title">🛒 My Cart
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '12px' }}>
                    ({items.length} item{items.length !== 1 ? 's' : ''})
                </span>
            </h1>

            {items.length === 0 ? (
                <div className="cart-empty">
                    <div className="icon">🛍️</div>
                    <h3>Your cart is empty</h3>
                    <p style={{ marginBottom: '24px' }}>Add some products to get started!</p>
                    <Link to="/" className="btn btn-primary" id="cart-shop-btn">Start Shopping</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    {/* CART ITEMS */}
                    <div className="cart-items">
                        {items.map(item => {
                            const emoji = PLACEHOLDER_EMOJIS[item.product % PLACEHOLDER_EMOJIS.length];
                            const subtotal = parseFloat(item.product_price) * item.quantity;
                            return (
                                <div className="cart-item" key={item.id} id={`cart-item-${item.id}`}>
                                    <div className="cart-item-img">
                                        {item.product_image
                                            ? <img src={`http://localhost:8000${item.product_image}`} alt={item.product_name} />
                                            : emoji}
                                    </div>

                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.product_name}</div>
                                        <div className="cart-item-price">৳{parseFloat(item.product_price).toLocaleString()} each</div>
                                    </div>

                                    <div className="qty-controls">
                                        <button className="qty-btn" onClick={() => handleQtyChange(item.id, item.quantity - 1)} id={`qty-dec-${item.id}`}>−</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => handleQtyChange(item.id, item.quantity + 1)} id={`qty-inc-${item.id}`}>+</button>
                                    </div>

                                    <div className="cart-item-subtotal">৳{subtotal.toLocaleString()}</div>

                                    <button className="remove-btn" onClick={() => handleRemove(item.id)} id={`remove-item-${item.id}`} title="Remove item">✕</button>
                                </div>
                            );
                        })}
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="order-summary">
                        <h2 className="order-summary-title">Order Summary</h2>

                        {items.map(item => (
                            <div className="summary-row" key={item.id}>
                                <span>{item.product_name} × {item.quantity}</span>
                                <span>৳{(parseFloat(item.product_price) * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}

                        <div className="summary-total">
                            <span>Total</span>
                            <span className="price">৳{total.toLocaleString()}</span>
                        </div>

                        {/* CHECKOUT FORM */}
                        <div className="checkout-section">
                            <p className="checkout-section-title">Delivery Info</p>
                            <div className="form-group">
                                <label className="form-label" htmlFor="order-address">Delivery Address *</label>
                                <textarea
                                    id="order-address"
                                    className="form-input"
                                    rows={2}
                                    placeholder="Full address…"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="order-phone">Phone Number *</label>
                                <input
                                    id="order-phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="01XXXXXXXXX"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>

                            <p className="checkout-section-title" style={{ marginTop: '16px' }}>Payment Method</p>
                            <div className="payment-options">
                                {['COD', 'Online'].map(pm => (
                                    <div
                                        key={pm}
                                        className={`payment-option ${paymentMethod === pm ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod(pm)}
                                        id={`pay-${pm}`}
                                    >
                                        {pm === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-success"
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px' }}
                                onClick={handlePlaceOrder}
                                disabled={placing}
                                id="place-order-btn"
                            >
                                {placing ? '⏳ Placing Order…' : '✅ Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
