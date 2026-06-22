import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
                setProducts(prods);
                setCategories(cats);
            } catch (e) {
                setError('Failed to load products. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = activeCategory === 'all'
        ? products
        : products.filter(p => p.category?.slug === activeCategory);

    return (
        <>
            {/* HERO */}
            <section className="hero">
                <div className="container">
                    <h1>
                        Discover <span>Premium</span><br />Products Online
                    </h1>
                    <p>Your one-stop destination for the best deals, trending items, and amazing products — delivered fast.</p>
                    <div className="hero-actions">
                        <a href="#products" className="btn btn-primary" id="hero-shop-btn">
                            🛍️ Shop Now
                        </a>
                        <Link to="/register" className="btn btn-ghost" id="hero-join-btn">
                            Join Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* PRODUCTS SECTION */}
            <section className="page-section" id="products">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">All Products</h2>
                        <p className="section-subtitle">{products.length} items available</p>
                    </div>
                </div>

                {/* CATEGORIES */}
                {categories.length > 0 && (
                    <div className="categories-bar">
                        <button
                            className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('all')}
                            id="cat-all"
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-chip ${activeCategory === cat.slug ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.slug)}
                                id={`cat-${cat.slug}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="loading-screen">
                        <div className="spinner"></div>
                        <p>Loading products…</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '12px',
                        padding: '20px',
                        color: 'var(--danger)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">📦</div>
                        <h3>No products found</h3>
                        <p>Try adding products from your Django admin panel.</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="products-grid" id="products-grid">
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
