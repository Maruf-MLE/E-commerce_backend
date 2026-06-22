import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <CartProvider>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products/:id" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
                            <Route path="/profile/setup" element={<ProfileSetupPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                        </Routes>
                        <footer className="footer">
                            <p>© 2025 <span>ShopNest</span> — Premium E-Commerce Experience</p>
                        </footer>
                    </CartProvider>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
