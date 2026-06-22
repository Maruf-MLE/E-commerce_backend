const BASE_URL = '/api';

const fetchOptions = (options = {}) => ({
    ...options,
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

// Products
export async function fetchProducts() {
    const res = await fetch(`${BASE_URL}/products/`, fetchOptions());
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function fetchProduct(id) {
    const res = await fetch(`${BASE_URL}/products/${id}/`, fetchOptions());
    if (!res.ok) throw new Error('Product not found');
    return res.json();
}

export async function fetchCategories() {
    const res = await fetch(`${BASE_URL}/categories/`, fetchOptions());
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

// Auth
export async function loginUser(username, password) {
    const res = await fetch(`${BASE_URL}/auth/token/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ username, password }),
    }));
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.detail || 'Invalid credentials');
    }
    return json;
}

export async function registerUser(data) {
    const res = await fetch(`${BASE_URL}/auth/register/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return json;
}

export async function verifyEmail(uid, token) {
    const res = await fetch(`${BASE_URL}/auth/verify-email/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ uid, token }),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
}

export async function googleLogin(googleToken) {
    const res = await fetch(`${BASE_URL}/auth/google/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ token: googleToken }),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Google login failed');
    return json;
}

export async function logoutBackend() {
    const res = await fetch(`${BASE_URL}/auth/logout/`, fetchOptions({
        method: 'POST'
    }));
    return res.json().catch(() => ({}));
}

// Profile
export async function getProfileStatus() {
    const res = await fetch(`${BASE_URL}/auth/profile/status/`, fetchOptions());
    if (!res.ok) return { has_profile: false, is_completed: false };
    return res.json();
}

export async function saveProfile(data) {
    const res = await fetch(`${BASE_URL}/auth/profile/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to save profile');
    return json;
}

async function handleRes(res, fallbackErrorMsg) {
    if (!res.ok) {
        if (res.status === 403) {
            const errData = await res.json().catch(() => ({}));
            if (errData.detail === 'Profile is incomplete.') {
                throw new Error('PROFILE_INCOMPLETE');
            }
        }
        if (res.status === 401) {
            throw new Error('UNAUTHORIZED');
        }
        throw new Error(fallbackErrorMsg);
    }
    return res.json();
}

// Cart
export async function fetchCart() {
    const res = await fetch(`${BASE_URL}/cart/`, fetchOptions());
    return handleRes(res, 'Failed to fetch cart');
}

export async function addToCart(product_id) {
    const res = await fetch(`${BASE_URL}/add_to_cart/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ product_id }),
    }));
    return handleRes(res, 'Failed to add to cart');
}

export async function removeFromCart(item_id) {
    const res = await fetch(`${BASE_URL}/remove_from_cart/`, fetchOptions({
        method: 'DELETE',
        body: JSON.stringify({ item_id }),
    }));
    return handleRes(res, 'Failed to remove item');
}

export async function updateCartQuantity(item_id, quantity) {
    const res = await fetch(`${BASE_URL}/cart/update/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ item_id, quantity }),
    }));
    return handleRes(res, 'Failed to update quantity');
}

// Orders
export async function createOrder(data) {
    const res = await fetch(`${BASE_URL}/orders/create/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify(data),
    }));
    return handleRes(res, 'Failed to create order');
}

// Password Reset
export async function requestPasswordReset(email) {
    const res = await fetch(`${BASE_URL}/auth/password-reset-request/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ email }),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to request password reset');
    return json;
}

export async function confirmPasswordReset(uid, token, new_password) {
    const res = await fetch(`${BASE_URL}/auth/password-reset-confirm/`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ uid, token, new_password }),
    }));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reset password');
    return json;
}
