'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './checkout.module.css';

const paymentMethods = [
    { id: 'jazzcash', name: 'JazzCash', category: 'Local Wallets', icon: '📱' },
    { id: 'easypaisa', name: 'EasyPaisa', category: 'Local Wallets', icon: '📲' },
    { id: 'sadapay', name: 'SadaPay', category: 'Local Wallets', icon: '💳' },
    { id: 'online-banking', name: 'Online Banking', category: 'Bank & Cards', icon: '🏦' },
    { id: 'cards', name: 'Debit/Credit Cards', category: 'Bank & Cards', icon: '💳' },
];

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [loginMethod, setLoginMethod] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [total, setTotal] = useState(0);

    const [gateways, setGateways] = useState<any[]>([]);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('userCurrency') || 'USD';
        const savedTotal = localStorage.getItem('cartTotal') || '145';
        setCurrency(savedCurrency);
        setTotal(parseFloat(savedTotal));

        const loadGateways = () => {
            const saved = localStorage.getItem('cutixa_gateways');
            if (saved) {
                const parsed = JSON.parse(saved);
                setGateways(parsed.filter((g: any) => g.active));
            }
        };
        loadGateways();
        window.addEventListener('storage', loadGateways);
        return () => window.removeEventListener('storage', loadGateways);
    }, []);

    const handleSendOTP = () => {
        setOtpSent(true);
    };

    const handleVerifyOTP = () => {
        setStep(2);
    };

    const getQRData = () => {
        // Generate a payment URI or data string for the QR code
        return `merchant:cutixaadore;method:${selectedMethod};amount:${total};currency:${currency};id:${Math.random().toString(36).substr(2, 9)}`;
    };

    return (
        <div className={styles.checkoutContainer}>
            <header className={`${styles.header} glass`}>
                <h2 className="brand-name" onClick={() => window.location.href = '/shop'} style={{ cursor: 'pointer' }}>
                    CutiXa Adore
                </h2>
                <div className={styles.steps}>
                    <span className={step >= 1 ? styles.activeStep : ''}>Login</span>
                    <span className={step >= 2 ? styles.activeStep : ''}>Address</span>
                    <span className={step >= 3 ? styles.activeStep : ''}>Payment</span>
                </div>
            </header>

            <main className={styles.content}>
                {step === 1 && (
                    <div className={`${styles.card} glass`}>
                        <h2>Identify Yourself</h2>
                        <p>Select a method to login or create an account</p>

                        <div className={styles.loginGrid}>
                            <button className={`${styles.socialBtn} ${loginMethod === 'Google' ? styles.activeMethod : ''}`} onClick={() => setLoginMethod('Google')}>Google</button>
                            <button className={`${styles.socialBtn} ${loginMethod === 'Facebook' ? styles.activeMethod : ''}`} onClick={() => setLoginMethod('Facebook')}>Facebook</button>
                            <button className={`${styles.socialBtn} ${loginMethod === 'Instagram' ? styles.activeMethod : ''}`} onClick={() => setLoginMethod('Instagram')}>Instagram</button>
                            <button className={`${styles.socialBtn} ${loginMethod === 'Email' ? styles.activeMethod : ''}`} onClick={() => setLoginMethod('Email')}>Email / Phone</button>
                        </div>

                        {loginMethod && (
                            <div className={styles.otpSection}>
                                <input type="text" placeholder={`Enter ${loginMethod}`} className={styles.input} />
                                {!otpSent ? (
                                    <button className={styles.actionBtn} onClick={handleSendOTP}>Send OTP</button>
                                ) : (
                                    <div className={styles.otpEntry}>
                                        <input type="text" placeholder="Enter 6-digit OTP" className={styles.input} />
                                        <button className={styles.actionBtn} onClick={handleVerifyOTP}>Verify & Continue</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className={`${styles.card} glass`}>
                        <h2>Delivery Address</h2>
                        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                            <input type="text" placeholder="Full Name" className={styles.input} required />
                            <input type="text" placeholder="Street Address" className={styles.input} required />
                            <div className={styles.row}>
                                <input type="text" placeholder="City" className={styles.input} required />
                                <input type="text" placeholder="Postal Code" className={styles.input} required />
                            </div>
                            <input type="tel" placeholder="Contact Phone" className={styles.input} required />
                            <button type="submit" className={styles.actionBtn}>Proceed to Payment</button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className={`${styles.card} glass`}>
                        <h2>Payment Selection</h2>
                        <p>Choose your preferred payment method</p>

                        <div className={styles.paymentMethods}>
                            <div className={styles.methodGroup}>
                                <h4>Local Wallets</h4>
                                <div className={styles.chipGrid}>
                                    {gateways.map(m => (
                                        <span
                                            key={m.id}
                                            className={`${styles.methodChip} ${selectedMethod === m.id ? styles.activeChip : ''}`}
                                            onClick={() => setSelectedMethod(m.id)}
                                        >
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.methodGroup}>
                                <h4>Bank & Cards</h4>
                                <div className={styles.chipGrid}>
                                    {paymentMethods.filter(m => m.category === 'Bank & Cards').map(m => (
                                        <span
                                            key={m.id}
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
                                    <QRCodeSVG
                                        value={getQRData()}
                                        size={200}
                                        fgColor="var(--foreground)"
                                        bgColor="transparent"
                                        includeMargin={true}
                                    />
                                    <p className={styles.qrLabel}>Scan with {paymentMethods.find(m => m.id === selectedMethod)?.name} App</p>
                                </div>
                                <div className={styles.amountBox}>
                                    <span>Total Payable:</span>
                                    <h3 className="brand-name">{currency} {total}</h3>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={!selectedMethod}
                            className={styles.finalBtn}
                            onClick={() => alert(`Payment Processed via ${selectedMethod}!`)}
                        >
                            {selectedMethod ? 'Confirm Payment' : 'Select a Method'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
