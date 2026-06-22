import { createContext, useContext, useState, useEffect } from 'react';
import { logoutBackend } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    function login(userData) {
        // The Token is safely stored in the HttpOnly Cookie automatically!
        // We only save basic User Profile Data in local storage for instant UI rendering.
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }

    async function logout() {
        try {
            await logoutBackend(); // Tells the server to destroy cookies
        } catch (e) {
            console.error("Logout error", e);
        }
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
