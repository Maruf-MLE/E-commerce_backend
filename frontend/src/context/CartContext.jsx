import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, addToCart, removeFromCart, updateCartQuantity } from '../api/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleCartError = useCallback((err) => {
        if (err.message === 'PROFILE_INCOMPLETE') {
            showToast('Please complete your profile details first.', 'warning');
            navigate('/profile/setup');
        }
        throw err;
    }, [navigate, showToast]);

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) { setCart(null); return; }
        try {
            setLoading(true);
            const data = await fetchCart();
            setCart(data);
        } catch (e) {
            if (e.message === 'PROFILE_INCOMPLETE') {
                showToast('Please complete your profile details.', 'warning');
                navigate('/profile/setup');
            } else {
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, navigate, showToast]);

    useEffect(() => { loadCart(); }, [loadCart]);

    async function addItem(product_id) {
        try {
            await addToCart(product_id);
            await loadCart();
        } catch (e) {
            handleCartError(e);
        }
    }

    async function removeItem(item_id) {
        try {
            await removeFromCart(item_id);
            await loadCart();
        } catch (e) {
            handleCartError(e);
        }
    }

    async function updateQty(item_id, quantity) {
        try {
            await updateCartQuantity(item_id, quantity);
            await loadCart();
        } catch (e) {
            handleCartError(e);
        }
    }

    const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

    return (
        <CartContext.Provider value={{ cart, loading, addItem, removeItem, updateQty, cartCount, loadCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
