'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Package, ShoppingCart, User, MapPin, CreditCard, Bell } from 'lucide-react';
import styles from './checkout.module.css';

// ─── Payment methods ─────────────────────────────────────────────────────
const staticPaymentMethods = [
    { id: 'jazzcash', name: 'JazzCash', category: 'Local Wallets', icon: '📱' },
    { id: 'easypaisa', name: 'EasyPaisa', category: 'Local Wallets', icon: '📲' },
    { id: 'sadapay', name: 'SadaPay', category: 'Local Wallets', icon: '💳' },
    { id: 'online-banking', name: 'Online Banking', category: 'Bank & Cards', icon: '🏦' },
    { id: 'cards', name: 'Debit/Credit Cards', category: 'Bank & Cards', icon: '💳' },
];

// ─── Utility: broadcast an event cross-tab AND same-tab ──────────────────
const broadcastEvent = (key: string, data: any) => {
    localStorage.setItem(key + '_event', JSON.stringify({ data, ts: Date.now() }));
    window.dispatchEvent(new CustomEvent(key, { detail: data }));
    // Also trigger storage event for cross-tab
    window.dispatchEvent(new Event('storage'));
};

// ─── Utility: create order + invoice from cart ────────────────────────────
const createOrderFromCart = (cart: any[], user: any, address: any, paymentMethod: string, currency: string) => {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const invoiceId = (() => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const existing = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');
        const count = String(existing.length + 1).padStart(3, '0');
        return `${dd}${mm}${yyyy}/${hh}:${min}/${count}`;
    })();

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
    const itemsSummary = cart.map(item => `${item.name} x${item.qty || 1}`).join(', ');

    const payMethodMap: Record<string, string> = {
        jazzcash: 'JazzCash',
        easypaisa: 'EasyPaisa',
        sadapay: 'SadaPay',
        'online-banking': 'Bank Transfer',
        cards: 'Bank Transfer'
    };

    const order = {
        id: orderId,
        customerName: user?.name || address?.name || 'Guest Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || address?.phone || '',
        customerAddress: `${address?.street || ''}, ${address?.city || ''} ${address?.postal || ''}`.trim(),
        totalAmount,
        status: 'Pending',
        paymentStatus: 'Awaiting',
        paymentMethod: payMethodMap[paymentMethod] || 'Bank Transfer',
        date: new Date().toISOString(),
        items: itemsSummary,
        invoiceId,
        confirmedByCall: false,
        confirmedByEmail: false,
        cart: cart
    };

    const invoice = {
        id: invoiceId,
        orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        date: new Date().toISOString().split('T')[0],
        amount: totalAmount,
        status: 'Pending',
        items: cart,
        paymentMethod: payMethodMap[paymentMethod] || 'Bank Transfer'
    };

    // Save order
    const existingOrders = JSON.parse(localStorage.getItem('cutixa_orders') || '[]');
    localStorage.setItem('cutixa_orders', JSON.stringify([order, ...existingOrders]));

    // Save invoice
    const existingInvoices = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');
    localStorage.setItem('cutixa_invoices', JSON.stringify([invoice, ...existingInvoices]));

    // Clear cart
    localStorage.setItem('cutixa_cart', '[]');
    localStorage.setItem('cartTotal', '0');

    // Broadcast new order event for real-time notification
    broadcastEvent('cutixa_new_order', { order, invoice });

    return { order, invoice };
};

// ─── OTP Input ────────────────────────────────────────────────────────────
const OTPInput = ({ onComplete }: { onComplete: (v: string) => void }) => {
    const [vals, setVals] = useState(['', '', '', '', '', '']);
    const refs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handle = (i: number, v: string) => {
        if (!/^\d?$/.test(v)) return;
        const nv = [...vals]; nv[i] = v; setVals(nv);
        if (v && i < 5) refs.current[i + 1]?.focus();
        if (nv.every(x => x)) onComplete(nv.join(''));
    };
    const handleKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    };

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '1.5rem 0' }}>
            {vals.map((v, i) => (
                <input key={i} ref={el => { refs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={v}
                    onChange={e => handle(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className={styles.otpBox}
                    style={{ borderColor: v ? 'var(--gold-matte)' : 'var(--border)' }}
                />
            ))}
        </div>
    );
};

// ─── Main Checkout Page ───────────────────────────────────────────────────
export default function CheckoutPage() {
    const [step, setStep] = useState(1); // 1=auth, 2=address, 3=payment, 4=success
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [currency, setCurrency] = useState('PKR');
    const [total, setTotal] = useState(0);
    const [gateways, setGateways] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [address, setAddress] = useState({ name: '', street: '', city: '', postal: '', phone: '' });
    const [orderResult, setOrderResult] = useState<any>(null);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [contactInput, setContactInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('userCurrency') || 'PKR';
        setCurrency(savedCurrency);

        // Load current user session
        const userStr = localStorage.getItem('cutixa_current_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setStep(2); // Skip auth if already logged in
        }

        // Load persistent cart
        const savedCart = localStorage.getItem('cutixa_cart');
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            setCart(parsed);
            const t = parsed.reduce((acc: number, item: any) => acc + (item.price * (item.qty || 1)), 0);
            setTotal(t);
        } else {
            // Fallback: reconstruct from cartTotal
            const savedTotal = Number(localStorage.getItem('cartTotal') || '0');
            setTotal(savedTotal);
        }

        // Load active payment gateways
        const savedGateways = localStorage.getItem('cutixa_gateways');
        if (savedGateways) {
            const parsed = JSON.parse(savedGateways);
            setGateways(parsed.filter((g: any) => g.active));
        }
    }, []);

    const sendOTP = (contact: string) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpSent(true);
        alert(`📱 OTP Sent to ${contact}\n\nYour code: ${code}\n\n(This simulates a real SMS/Email delivery)`);
    };

    const handleOTPVerify = (code: string) => {
        if (code === generatedOtp) {
            const user = {
                name: contactInput.includes('@') ? contactInput.split('@')[0] : contactInput,
                email: contactInput.includes('@') ? contactInput : '',
                phone: contactInput.includes('@') ? '' : contactInput,
                id: 'USR-' + Math.random().toString(36).substr(2, 8).toUpperCase()
            };
            localStorage.setItem('cutixa_current_user', JSON.stringify(user));
            localStorage.setItem('userAccount', user.name);
            setCurrentUser(user);
            setOtpError('');
            setStep(2);
        } else {
            setOtpError('Incorrect code. Please try again.');
        }
    };

    const getQRData = () =>
        `merchant:cutixaadore;method:${selectedMethod};amount:${total};currency:${currency};id:${Math.random().toString(36).substr(2, 9)}`;

    const handleConfirmPayment = () => {
        if (!selectedMethod) return;
        setIsProcessing(true);

        setTimeout(() => {
            const result = createOrderFromCart(
                cart.length > 0 ? cart : [{ name: 'Cart Items', price: total, qty: 1 }],
                currentUser,
                address,
                selectedMethod,
                currency
            );
            setOrderResult(result);
            setStep(4);
            setIsProcessing(false);
        }, 1500); // Simulate processing delay
    };

    const allGateways = gateways.length > 0 ? gateways : staticPaymentMethods;
    const localWallets = allGateways.filter((m: any) => m.category === 'Local Wallets' || ['jazzcash', 'easypaisa', 'sadapay'].includes(m.id));
    const bankCards = staticPaymentMethods.filter(m => m.category === 'Bank & Cards');

    return (
        <div className={styles.checkoutContainer}>
            {/* ─── Header ─── */}
            <header className={`${styles.header} glass`}>
                <h2 className="brand-name" onClick={() => window.location.href = '/shop'} style={{ cursor: 'pointer' }}>
                    CutiXa Adore
                </h2>
                <div className={styles.steps}>
                    {[
                        { label: 'Identity', icon: User, n: 1 },
                        { label: 'Address', icon: MapPin, n: 2 },
                        { label: 'Payment', icon: CreditCard, n: 3 },
                        { label: 'Done', icon: CheckCircle, n: 4 },
                    ].map(({ label, icon: Icon, n }) => (
                        <div key={n} className={`${styles.stepItem} ${step >= n ? styles.activeStep : ''}`}>
                            <Icon size={14} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
                {cart.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gold-matte)' }}>
                        <ShoppingCart size={16} />
                        <strong>{cart.length}</strong> item{cart.length !== 1 ? 's' : ''} · <strong>{currency} {total.toLocaleString()}</strong>
                    </div>
                )}
            </header>

            <main className={styles.content}>

                {/* ─── Step 1: Identity / Auth ─── */}
                {step === 1 && (
                    <div className={`${styles.card} glass`}>
                        <h2>Identify Yourself</h2>
                        <p>Quick login to continue your order</p>

                        {/* Social Shortcuts */}
                        <div className={styles.loginGrid}>
                            {[
                                { label: 'Google', color: '#4285F4', emoji: '🔵' },
                                { label: 'Facebook', color: '#1877F2', emoji: '📘' },
                                { label: 'Instagram', color: '#e1306c', emoji: '📸' },
                            ].map(({ label, color, emoji }) => (
                                <button key={label}
                                    className={styles.socialBtn}
                                    onClick={() => {
                                        const user = { name: `${label} User`, email: '', phone: '', loginMethod: label, id: 'USR-' + Date.now() };
                                        localStorage.setItem('cutixa_current_user', JSON.stringify(user));
                                        setCurrentUser(user);
                                        setStep(2);
                                    }}
                                    style={{ borderColor: color }}
                                >
                                    {emoji} {label}
                                </button>
                            ))}
                            <button className={styles.socialBtn} onClick={() => {
                                const user = { name: 'Guest', email: '', phone: '', loginMethod: 'Guest', id: 'GUEST-' + Date.now() };
                                localStorage.setItem('cutixa_current_user', JSON.stringify(user));
                                setCurrentUser(user);
                                setStep(2);
                            }}>
                                👤 Continue as Guest
                            </button>
                        </div>

                        <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Or verify with Email / Mobile OTP
                            </p>
                            {!otpSent ? (
                                <div className={styles.otpSection}>
                                    <input
                                        type="text"
                                        placeholder="Email or Mobile Number"
                                        value={contactInput}
                                        onChange={e => setContactInput(e.target.value)}
                                        className={styles.input}
                                    />
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => contactInput.trim() && sendOTP(contactInput.trim())}
                                    >
                                        Send OTP
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontSize: '0.85rem' }}>Enter code sent to <strong>{contactInput}</strong></p>
                                    <OTPInput onComplete={handleOTPVerify} />
                                    {otpError && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{otpError}</p>}
                                    <button style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                        onClick={() => sendOTP(contactInput)}>Resend Code</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Delivery Address ─── */}
                {step === 2 && (
                    <div className={`${styles.card} glass`}>
                        {currentUser && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', padding: '0.8rem 1rem', background: 'rgba(34,197,94,0.08)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <CheckCircle size={18} color="#22c55e" />
                                <span style={{ fontSize: '0.9rem' }}>Logged in as <strong>{currentUser.name}</strong></span>
                            </div>
                        )}
                        <h2>Delivery Address</h2>
                        <form className={styles.form} onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            setAddress({
                                name: fd.get('name') as string,
                                street: fd.get('street') as string,
                                city: fd.get('city') as string,
                                postal: fd.get('postal') as string,
                                phone: fd.get('phone') as string,
                            });
                            setStep(3);
                        }}>
                            <input name="name" type="text" placeholder="Full Name" className={styles.input}
                                defaultValue={currentUser?.name || ''} required />
                            <input name="street" type="text" placeholder="Street Address" className={styles.input} required />
                            <div className={styles.row}>
                                <input name="city" type="text" placeholder="City" className={styles.input} required />
                                <input name="postal" type="text" placeholder="Postal Code" className={styles.input} required />
                            </div>
                            <input name="phone" type="tel" placeholder="Contact Phone" className={styles.input}
                                defaultValue={currentUser?.phone || ''} required />
                            <button type="submit" className={styles.actionBtn}>Proceed to Payment →</button>
                        </form>
                    </div>
                )}

                {/* ─── Step 3: Payment ─── */}
                {step === 3 && (
                    <div className={`${styles.card} glass`}>
                        <h2>Payment Method</h2>
                        <p>Choose your preferred payment method</p>

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ORDER SUMMARY</p>
                                {cart.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
                                        <span>{item.name} × {item.qty || 1}</span>
                                        <span style={{ color: 'var(--gold-matte)', fontWeight: 600 }}>{currency} {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--gold-matte)' }}>{currency} {total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.paymentMethods}>
                            {localWallets.length > 0 && (
                                <div className={styles.methodGroup}>
                                    <h4>Local Wallets</h4>
                                    <div className={styles.chipGrid}>
                                        {localWallets.map((m: any) => (
                                            <span key={m.id}
                                                className={`${styles.methodChip} ${selectedMethod === m.id ? styles.activeChip : ''}`}
                                                onClick={() => setSelectedMethod(m.id)}
                                            >
                                                {m.icon || '📱'} {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className={styles.methodGroup}>
                                <h4>Bank & Cards</h4>
                                <div className={styles.chipGrid}>
                                    {bankCards.map(m => (
                                        <span key={m.id}
                                            className={`${styles.methodChip} ${selectedMethod === m.id ? styles.activeChip : ''}`}
                                            onClick={() => setSelectedMethod(m.id)}
                                        >
                                            {m.icon} {m.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {selectedMethod && (
                            <div className={styles.qrSection}>
                                <div className={styles.qrWrapper}>
                                    <QRCodeSVG value={getQRData()} size={200} fgColor="var(--foreground)" bgColor="transparent" includeMargin />
                                    <p className={styles.qrLabel}>
                                        Scan with {staticPaymentMethods.find(m => m.id === selectedMethod)?.name || selectedMethod} App
                                    </p>
                                </div>
                                <div className={styles.amountBox}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Payable:</span>
                                    <h3 className="brand-name" style={{ fontSize: '2rem', margin: '0.3rem 0' }}>{currency} {total.toLocaleString()}</h3>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={!selectedMethod || isProcessing}
                            className={styles.finalBtn}
                            onClick={handleConfirmPayment}
                            style={{ opacity: selectedMethod && !isProcessing ? 1 : 0.5 }}
                        >
                            {isProcessing ? '⏳ Processing...' : selectedMethod ? '✅ Confirm & Place Order' : 'Select a Method First'}
                        </button>
                    </div>
                )}

                {/* ─── Step 4: Confirmation / Success ─── */}
                {step === 4 && orderResult && (
                    <div className={`${styles.card} glass`} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 1s ease' }}>🎉</div>
                        <h2 style={{ color: '#22c55e', fontFamily: 'Playfair Display, serif' }}>Order Placed!</h2>
                        <p style={{ marginBottom: '2rem' }}>Your order has been confirmed and the dashboard has been notified in real-time.</p>

                        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <Package size={18} color="var(--gold-matte)" />
                                <span style={{ fontWeight: 700, color: 'var(--gold-matte)' }}>Order Confirmation</span>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.7 }}>Order ID</span>
                                    <span style={{ fontWeight: 700 }}>{orderResult.order.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.7 }}>Invoice</span>
                                    <span style={{ fontWeight: 700 }}>{orderResult.invoice.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.7 }}>Total</span>
                                    <span style={{ fontWeight: 700, color: 'var(--gold-matte)' }}>{currency} {orderResult.order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.7 }}>Status</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Awaiting Payment Confirmation</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => window.location.href = '/shop'}
                                style={{ flex: 1 }}
                            >
                                Continue Shopping
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={() => window.location.href = '/account'}
                                style={{ flex: 1, background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                            >
                                View My Orders
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
