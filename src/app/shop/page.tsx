'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Globe, User, X, Mail, Phone, ShieldCheck, CheckCircle, Plus, Minus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import styles from './shop.module.css';

interface Product {
    id: string | number;
    name: string;
    category: string;
    fullCategory?: string;
    price: number;
    image: string;
    description: string;
}

interface CartItem extends Product {
    qty: number;
}

// ─── Auth utilities ────────────────────────────────────────────────────────
const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('cutixa_current_user') || 'null'); } catch { return null; }
};

const generate6OTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Auth Popup ────────────────────────────────────────────────────────────
function AuthPopup({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: any) => void }) {
    type Stage = 'choose' | 'register' | 'otp';
    const [stage, setStage] = useState<Stage>('choose');
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [genOtp, setGenOtp] = useState('');
    const [error, setError] = useState('');
    const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });
    const [provider, setProvider] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

    const sendOTP = (contact: string) => {
        const code = generate6OTP();
        setGenOtp(code);
        alert(`📱 OTP for ${contact}:\n\n${code}\n\n(Simulated — in production sent via SMS/Email)`);
        setStage('otp');
    };

    const loginSocial = (prov: string) => {
        setProvider(prov);
        setStage('register');
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendOTP(regForm.email || regForm.phone || contact);
    };

    const handleOTPDigit = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const nd = [...otpDigits]; nd[i] = val; setOtpDigits(nd);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
        const full = nd.join('');
        if (nd.every(d => d)) {
            if (full === genOtp) {
                const user = {
                    name: regForm.name || (provider ? `${provider} User` : (contact.includes('@') ? contact.split('@')[0] : contact)),
                    email: regForm.email || (contact.includes('@') ? contact : ''),
                    phone: regForm.phone || (contact.includes('@') ? '' : contact),
                    provider, id: 'USR-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                };
                const users = JSON.parse(localStorage.getItem('cutixa_registered_users') || '[]');
                users.push(user);
                localStorage.setItem('cutixa_registered_users', JSON.stringify(users));
                localStorage.setItem('cutixa_current_user', JSON.stringify(user));
                localStorage.setItem('userAccount', user.name);
                onSuccess(user);
            } else {
                setError('Invalid code. Please try again.');
                setOtpDigits(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={onClose}>
            <div
                className="glass"
                style={{
                    width: '100%', maxWidth: '420px', borderRadius: '24px', padding: '2.5rem',
                    position: 'relative', textAlign: 'center',
                    animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                    <X size={20} />
                </button>

                <h2 className="brand-name" style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>CutiXa Adore</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    {stage === 'choose' && 'Join or sign in to continue'}
                    {stage === 'register' && (provider ? `Complete your ${provider} profile` : 'Set up your account')}
                    {stage === 'otp' && 'Verify your identity'}
                </p>

                {/* ─── Choose method ─── */}
                {stage === 'choose' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { label: '🔵 Continue with Google', provider: 'Google' },
                            { label: '📘 Continue with Facebook', provider: 'Facebook' },
                            { label: '📸 Continue with Instagram', provider: 'Instagram' },
                        ].map(({ label, provider: p }) => (
                            <button key={p} onClick={() => loginSocial(p)}
                                style={{
                                    padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)',
                                    background: 'var(--surface)', color: 'var(--foreground)', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s',
                                    fontFamily: 'inherit'
                                }}>
                                {label}
                            </button>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text" placeholder="Email or Mobile Number" value={contact}
                                onChange={e => setContact(e.target.value)}
                                style={{
                                    flex: 1, padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)',
                                    background: 'var(--surface)', color: 'var(--foreground)', outline: 'none',
                                    fontFamily: 'inherit', fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (!contact.trim()) return;
                                    setRegForm(f => ({ ...f, email: contact.includes('@') ? contact : '', phone: contact.includes('@') ? '' : contact }));
                                    sendOTP(contact.trim());
                                }}
                                style={{
                                    padding: '0.9rem 1.2rem', borderRadius: '12px', border: 'none',
                                    background: 'var(--gold-shining)', color: 'white', cursor: 'pointer',
                                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <ShieldCheck size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Register form (after social) ─── */}
                {stage === 'register' && (
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', textAlign: 'left' }}>
                        {[
                            { icon: User, placeholder: 'Full Name', key: 'name', type: 'text' },
                            { icon: Mail, placeholder: 'Email Address', key: 'email', type: 'email' },
                            { icon: Phone, placeholder: 'Mobile Number', key: 'phone', type: 'tel' },
                        ].map(({ icon: Icon, placeholder, key, type }) => (
                            <div key={key} style={{ position: 'relative' }}>
                                <Icon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-matte)' }} />
                                <input
                                    type={type} placeholder={placeholder} value={(regForm as any)[key]}
                                    onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                                    required={key === 'name'}
                                    style={{
                                        width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px',
                                        border: '1px solid var(--border)', background: 'var(--surface)',
                                        color: 'var(--foreground)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        ))}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            A 6-digit verification code will be sent to your contact
                        </p>
                        <button type="submit"
                            style={{ padding: '1rem', background: 'var(--gold-shining)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Send Verification Code
                        </button>
                        <button type="button" onClick={() => setStage('choose')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                            ← Back
                        </button>
                    </form>
                )}

                {/* ─── OTP verify ─── */}
                {stage === 'otp' && (
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Enter the 6-digit code sent to your contact
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            {otpDigits.map((d, i) => (
                                <input key={i} ref={el => { otpRefs.current[i] = el; }}
                                    type="text" inputMode="numeric" maxLength={1} value={d}
                                    onChange={e => handleOTPDigit(i, e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                                    style={{
                                        width: '48px', height: '56px', textAlign: 'center', fontSize: '1.4rem',
                                        fontWeight: 700, border: `2px solid ${d ? 'var(--gold-matte)' : 'var(--border)'}`,
                                        borderRadius: '12px', background: 'var(--surface)', color: 'var(--foreground)', outline: 'none'
                                    }}
                                />
                            ))}
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{error}</p>}
                        <button
                            onClick={() => {
                                const code = generate6OTP(); setGenOtp(code); setError(''); setOtpDigits(['', '', '', '', '', '']);
                                alert(`📱 New OTP: ${code}`);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                        >
                            Resend Code
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

// ─── Cart Sidebar ──────────────────────────────────────────────────────────
function CartSidebar({ cart, onUpdate, onClose, currency }: {
    cart: CartItem[]; onUpdate: (cart: CartItem[]) => void; onClose: () => void; currency: string;
}) {
    const total = cart.reduce((s, item) => s + item.price * item.qty, 0);

    const change = (id: string | number, delta: number) => {
        const updated = cart.map(item => item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        ).filter(item => item.qty > 0);
        onUpdate(updated);
    };

    const remove = (id: string | number) => onUpdate(cart.filter(item => item.id !== id));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            display: 'flex', justifyContent: 'flex-end'
        }}>
            <div style={{ flex: 1 }} onClick={onClose} />
            <div className="glass" style={{
                width: '380px', height: '100vh', padding: '2rem', display: 'flex',
                flexDirection: 'column', animation: 'slideInRight 0.35s ease',
                borderLeft: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 className="brand-name" style={{ fontSize: '1.5rem' }}>Cart ({cart.length})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
                </div>

                {cart.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                        <ShoppingCart size={48} style={{ marginBottom: '1rem' }} />
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '8px', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--gold-matte)', fontWeight: 700 }}>{currency} {(item.price * item.qty).toLocaleString()}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                            <button onClick={() => change(item.id, -1)} style={{ width: 24, height: 24, borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                                            <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                                            <button onClick={() => change(item.id, 1)} style={{ width: 24, height: 24, borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                                            <button onClick={() => remove(item.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6 }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--gold-matte)' }}>{currency} {total.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => window.location.href = '/checkout'}
                                style={{
                                    width: '100%', padding: '1rem', background: 'var(--gold-shining)',
                                    color: 'white', border: 'none', borderRadius: '14px',
                                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit'
                                }}
                            >
                                Proceed to Checkout →
                            </button>
                        </div>
                    </>
                )}
            </div>
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </div>
    );
}

// ─── Main Shop Page ────────────────────────────────────────────────────────
export default function ShopPage() {
    const { t, language, setLanguage } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [products, setProducts] = useState<any[]>([]);
    const [navCategories, setNavCategories] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('userCurrency');
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const isPkDomain = hostname.includes('cutixaadore.pk');

        if (isPkDomain) {
            setCurrency('PKR');
        } else if (savedCurrency) {
            setCurrency(savedCurrency);
        }

        // Load persisted cart
        const savedCart = localStorage.getItem('cutixa_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        // Load user session
        setCurrentUser(getCurrentUser());

        const loadData = async () => {
            let parsedProducts = [];
            let parsedCats = [];

            try {
                const apiBase = process.env.NODE_ENV === 'production' ? '/api' : '/api';
                const [pRes, cRes] = await Promise.all([
                    fetch(`${apiBase}/products.php`).then(r => r.json()),
                    // If categories are also in db, fetch them here. Otherwise use current local.
                    Promise.resolve(JSON.parse(localStorage.getItem('cutixa_categories') || '[]'))
                ]);
                if (pRes && !pRes.error) parsedProducts = Array.isArray(pRes) ? pRes : [];
                parsedCats = Array.isArray(cRes) ? cRes : [];
            } catch (e) {
                console.warn('API error, using local');
            }

            if (parsedProducts.length === 0) {
                parsedProducts = JSON.parse(localStorage.getItem('cutixa_products') || '[]');
            }

            setNavCategories(parsedCats);
            (window as any)._allCats = parsedCats;

            const mapped = parsedProducts
                .filter((p: any) => {
                    const isPublished = p.published === undefined || p.published == 1 || p.published === true;
                    if (!isPublished || p.visibility?.toLowerCase() !== 'visible') return false;

                    const checkVis = (list: any[], path: string[]): boolean => {
                        if (path.length === 0) return true;
                        const current = list.find(c => c.name === path[0]);
                        if (!current || !current.isVisible) return false;
                        return checkVis(current.subcategories || [], path.slice(1));
                    };
                    const catData = (window as any)._allCats;
                    const categoriesStr = p.categories || p.category || '';
                    if (catData && categoriesStr) {
                        const fullPath = categoriesStr.split(' > ').map((s: string) => s.trim());
                        return checkVis(catData, fullPath);
                    }
                    return true;
                })
                .map((p: any) => ({
                    id: p.id, name: p.name,
                    category: (p.categories || p.category || 'Uncategorized').split(' > ')[0],
                    fullCategory: p.categories || p.category || 'Uncategorized',
                    price: p.regular_price || p.regularPrice || 0,
                    image: p.images || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
                    description: p.description || ''
                }));
            setProducts(mapped);
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    const updateCart = (newCart: CartItem[]) => {
        setCart(newCart);
        const total = newCart.reduce((acc, item) => acc + item.price * item.qty, 0);
        localStorage.setItem('cutixa_cart', JSON.stringify(newCart));
        localStorage.setItem('cartTotal', total.toString());
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        const newCart = existing
            ? cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
            : [...cart, { ...product, qty: 1 }];
        updateCart(newCart);
        setSelectedProduct(null);
        setShowCart(true);
    };

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => (p.fullCategory || p.category).includes(selectedCategory));

    const NavItem = ({ cat, depth = 0 }: { cat: any; depth?: number }) => {
        if (!cat.isVisible) return null;
        return (
            <div style={{ marginLeft: depth > 0 ? '1rem' : 0 }}>
                <button
                    className={`${styles.catBtn} ${selectedCategory === cat.name ? styles.activeCat : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{ fontSize: depth === 0 ? '0.9rem' : '0.8rem', opacity: depth === 0 ? 1 : 0.8, fontWeight: depth === 0 ? 600 : 400 }}
                >
                    {t(cat.name)}
                </button>
                {cat.subcategories?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {cat.subcategories.map((sub: any) => <NavItem key={sub.id} cat={sub} depth={depth + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    return (
        <div className={styles.shopContainer}>
            {/* ─── Auth Modal ─── */}
            {showAuth && (
                <AuthPopup
                    onClose={() => setShowAuth(false)}
                    onSuccess={(user) => { setCurrentUser(user); setShowAuth(false); }}
                />
            )}

            {/* ─── Cart Sidebar ─── */}
            {showCart && (
                <CartSidebar
                    cart={cart}
                    onUpdate={updateCart}
                    onClose={() => setShowCart(false)}
                    currency={currency}
                />
            )}

            {/* ─── Header ─── */}
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
                        <select className={styles.langSelect} value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                            {['English', 'Urdu', 'Arabic', 'Chinese', 'Sri Lankan', 'Nepali', 'Malaysian', 'Indonesian'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <ThemeSwitcher />

                    {/* Cart Icon with item count badge */}
                    <div className={styles.cartIcon} onClick={() => setShowCart(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className={styles.cartCount}>{cart.reduce((s, i) => s + i.qty, 0)}</span>
                        )}
                    </div>

                    {/* Login/Register button or user avatar */}
                    {currentUser ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/account'}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'var(--gold-shining)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.9rem'
                            }}>
                                {currentUser.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-matte)' }}>
                                {currentUser.name?.split(' ')[0] || 'Account'}
                            </span>
                        </div>
                    ) : (
                        <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>
                            {t('Login/Register')}
                        </button>
                    )}
                </div>
            </header>

            {/* ─── Category Navigation ─── */}
            <nav className={styles.categoryNav} style={{ flexWrap: 'wrap', height: 'auto', padding: '1rem 2rem', alignItems: 'flex-start' }}>
                <button
                    className={`${styles.catBtn} ${selectedCategory === 'All' ? styles.activeCat : ''}`}
                    onClick={() => setSelectedCategory('All')}
                >
                    All
                </button>
                {Array.isArray(navCategories) && navCategories.map((cat: any) => (
                    <NavItem key={cat.id} cat={cat} />
                ))}
            </nav>

            {/* ─── Product Grid ─── */}
            <main className={styles.productGrid}>
                {filteredProducts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
                        <ShoppingCart size={48} style={{ marginBottom: '1rem' }} />
                        <p>No products available in this category.</p>
                        <p style={{ fontSize: '0.85rem' }}>Add products from the Dashboard to see them here.</p>
                    </div>
                ) : filteredProducts.map(product => (
                    <div key={product.id} className={`${styles.productCard} glass`} onClick={() => setSelectedProduct(product)}>
                        <div className={styles.productImage} style={{ backgroundImage: `url(${product.image})` }} />
                        <div className={styles.productInfo}>
                            <h3>{product.name}</h3>
                            <p className={styles.price}>{currency} {product.price?.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </main>

            {/* ─── Product Detail Popup ─── */}
            {selectedProduct && (
                <div className={styles.overlay} onClick={() => setSelectedProduct(null)}>
                    <div className={`${styles.popup} glass`} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedProduct(null)}>×</button>
                        <div className={styles.popupContent}>
                            <div className={styles.popupImage} style={{ backgroundImage: `url(${selectedProduct.image})` }} />
                            <div className={styles.popupInfo}>
                                <h1 className="brand-name" style={{ fontSize: '2.2rem' }}>{selectedProduct.name}</h1>
                                <p className={styles.popupDesc}>{selectedProduct.description || 'Premium quality product from CutiXa Adore.'}</p>
                                <div className={styles.popupPrice}>{currency} {selectedProduct.price?.toLocaleString()}</div>
                                <button className={styles.atcBtn} onClick={() => addToCart(selectedProduct)}>
                                    {t('Add to Cart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Footer ─── */}
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
                            style={{ color: s.color, fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                            {s.name}
                        </a>
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
