'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Globe } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import styles from './shop.module.css';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
}

const dummyProducts: Product[] = [
    { id: 1, name: 'Radiance Serum', category: 'Beauty & Self Care', price: 45, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', description: 'Glow like never before with our signature radiance serum.' },
    { id: 2, name: 'Midnight Recovery Cream', category: 'Beauty & Self Care', price: 60, image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=400', description: 'Repair and rejuvenate your skin while you sleep.' },
    { id: 3, name: 'Oud Wood Essence', category: 'Fragrances', price: 120, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400', description: 'A deep, smokey fragrance for those who dare.' },
    { id: 4, name: 'Daily Hydrator for Men', category: 'Mens', price: 25, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400', description: 'Quick-absorbing hydration designed for men\'s skin.' },
    { id: 5, name: 'Silk Cleansing Balm', category: 'Women', price: 35, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400', description: 'Melts away makeup and leaves skin feeling like silk.' },
    { id: 6, name: 'Pure Rose Water', category: 'Special Offers', price: 15, image: 'https://images.unsplash.com/photo-1556228448-61928ec26e11?auto=format&fit=crop&q=80&w=400', description: '100% organic rose water for instant refreshment.' },
];

const categories = ['All', 'Mens', 'Women', 'Fragrances', 'Beauty & Self Care', 'Special Offers'];

export default function ShopPage() {
    const { t, language, setLanguage } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        const savedCurrency = localStorage.getItem('userCurrency');
        if (savedCurrency) setCurrency(savedCurrency);
    }, []);

    const filteredProducts = selectedCategory === 'All'
        ? dummyProducts
        : dummyProducts.filter(p => p.category === selectedCategory);

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

                    <a href="/contact" className={styles.navLink}>{t('Contact Us')}</a>

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
                {categories.map(cat => (
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
        </div>
    );
}
