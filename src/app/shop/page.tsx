'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Globe } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import styles from './shop.module.css';


interface Product {
    id: string | number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
}

// Dummy data removed to prioritize real dashboard data
const categories = ['All', 'Mens', 'Women', 'Fragrances', 'Beauty & Self Care', 'Special Offers'];

export default function ShopPage() {
    const { t, language, setLanguage } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [products, setProducts] = useState<any[]>([]);
    const [navCategories, setNavCategories] = useState<string[]>(['All']);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('userCurrency');
        if (savedCurrency) setCurrency(savedCurrency);

        const loadData = () => {
            const savedProducts = localStorage.getItem('cutixa_products');
            const savedCats = localStorage.getItem('cutixa_categories');

            if (savedCats) {
                const parsedCats = JSON.parse(savedCats);
                // Get only visible main categories
                const visibleCats = parsedCats.filter((c: any) => c.isVisible);
                setNavCategories(['All', ...visibleCats.map((c: any) => c.name)]);

                // Store full category data for subcategory filtering
                (window as any)._allCats = parsedCats;
            }

            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                const mapped = parsed
                    .filter((p: any) => {
                        const isVisible = p.published && (p.visibility?.toLowerCase() === 'visible');
                        if (!isVisible) return false;

                        // Check if its category/subcategory is visible in Page Config
                        const catData = (window as any)._allCats;
                        if (catData && p.categories) {
                            const [main, sub] = p.categories.split(' > ').map((s: string) => s.trim());
                            const mainCat = catData.find((c: any) => c.name === main);
                            if (mainCat && !mainCat.isVisible) return false;

                            if (sub) {
                                const subCat = mainCat?.subcategories?.find((s: any) => s.name === sub);
                                if (subCat && !subCat.isVisible) return false;
                            }
                        }
                        return true;
                    })
                    .map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        category: p.categories?.split(' > ')[0] || 'Uncategorized',
                        price: p.regularPrice,
                        image: p.images || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
                        description: p.description || ''
                    }));
                setProducts(mapped);
            } else {
                setProducts([]);
            }
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    useEffect(() => {
        // Auto-refresh when dashboard pages config changes
        const checkPageConfig = () => {
            const savedPages = localStorage.getItem('cutixa_pages');
            if (savedPages) {
                // Potential logic for dynamic page content
            }
        };
        checkPageConfig();
    }, []);

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const addToCart = (product: Product) => {
        const newCart = [...cart, product];
        setCart(newCart);
        const newTotal = newCart.reduce((acc, item) => acc + item.price, 0);
        localStorage.setItem('cartTotal', newTotal.toString());
        setShowCartPopup(true);
        setSelectedProduct(null);
    };

    return (
        <div className={styles.shopContainer}>
            {/* Header */}
            <header className={`${styles.header} glass`}>
                <div className={styles.headerLeft}>
                    <h2 className="brand-name" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                        CutiXa Adore
                    </h2>
                    <nav style={{ display: 'flex', gap: '1.5rem', marginLeft: '2rem' }}>
                        <a href="/shop" style={{ color: 'var(--gold-matte)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>Shop</a>
                        <a href="/courses" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>Courses</a>
                        <a href="/contact" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>Contact Us</a>
                    </nav>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.langWrapper}>
                        <Globe size={18} className={styles.goldIcon} />
                        <select
                            className={styles.langSelect}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                        >
                            {['English', 'Urdu', 'Arabic', 'Chinese', 'Sri Lankan', 'Nepali', 'Malaysian', 'Indonesian'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <ThemeSwitcher />

                    <div className={styles.cartIcon} onClick={() => window.location.href = '/cart'}>
                        <ShoppingCart size={20} />
                        {cart.length > 0 && <span className={styles.cartCount}>{cart.length}</span>}
                    </div>

                    <button className={styles.loginBtn} onClick={() => window.location.href = '/login'}>
                        {t('Login/Register')}
                    </button>
                </div>
            </header>

            {/* Category Navigation */}
            <nav className={styles.categoryNav}>
                {navCategories.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.catBtn} ${selectedCategory === cat ? styles.activeCat : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat === 'All' ? 'All' : t(cat)}
                    </button>
                ))}
            </nav>

            {/* Product Grid */}
            <main className={styles.productGrid}>
                {filteredProducts.map(product => (
                    <div key={product.id} className={`${styles.productCard} glass`} onClick={() => setSelectedProduct(product)}>
                        <div className={styles.productImage} style={{ backgroundImage: `url(${product.image})` }}></div>
                        <div className={styles.productInfo}>
                            <h3>{product.name}</h3>
                            <p className={styles.price}>{currency} {product.price}</p>
                        </div>
                    </div>
                ))}
            </main>

            {/* Product Detail Popup */}
            {selectedProduct && (
                <div className={styles.overlay} onClick={() => setSelectedProduct(null)}>
                    <div className={`${styles.popup} glass`} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedProduct(null)}>×</button>
                        <div className={styles.popupContent}>
                            <div className={styles.popupImage} style={{ backgroundImage: `url(${selectedProduct.image})` }}></div>
                            <div className={styles.popupInfo}>
                                <h1 className="brand-name" style={{ fontSize: '2.5rem' }}>{selectedProduct.name}</h1>
                                <p className={styles.popupDesc}>{selectedProduct.description}</p>
                                <div className={styles.popupPrice}>{currency} {selectedProduct.price}</div>
                                <button className={styles.atcBtn} onClick={() => addToCart(selectedProduct)}>
                                    {t('Add to Cart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Success Popup */}
            {showCartPopup && (
                <div className={styles.overlay}>
                    <div className={`${styles.cartSuccess} glass`}>
                        <h3 className={styles.goldText}>{t('Item added to cart')}</h3>
                        <div className={styles.popupActions}>
                            <button
                                className={styles.continueBtn}
                                onClick={() => setShowCartPopup(false)}
                            >
                                {t('Continue Shopping')}
                            </button>
                            <button
                                className={styles.checkoutBtn}
                                onClick={() => window.location.href = '/checkout'}
                            >
                                {t('Checkout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Social Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <span className="brand-name" style={{ fontSize: '1rem' }}>CutiXa Adore</span>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {[
                        { name: 'Facebook', url: 'https://facebook.com', color: '#1877f2' },
                        { name: 'Instagram', url: 'https://instagram.com', color: '#e1306c' },
                        { name: 'TikTok', url: 'https://tiktok.com', color: 'var(--foreground)' },
                        { name: 'Pinterest', url: 'https://pinterest.com', color: '#e60023' },
                        { name: 'LinkedIn', url: 'https://linkedin.com', color: '#0077b5' },
                    ].map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                            style={{ color: s.color, fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}
                        >{s.name}</a>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Courses</a>
                    <a href="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Contact</a>
                </div>
            </footer>
        </div>
    );
}
