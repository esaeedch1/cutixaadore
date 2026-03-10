'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import styles from './login.module.css';

// Native SVG Icons
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <defs>
            <radialGradient id="rg" r="150%" cx="30%" cy="107%">
                <stop stopColor="#fdf497" offset="0" />
                <stop stopColor="#fdf497" offset="0.05" />
                <stop stopColor="#fd5949" offset="0.45" />
                <stop stopColor="#d6249f" offset="0.6" />
                <stop stopColor="#285AEB" offset="0.9" />
            </radialGradient>
        </defs>
        <path fill="url(#rg)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.422-.164-1.056-.36-2.227-.413-1.266-.057-1.646-.07-4.85-.07s-3.584-.015-4.85-.071c-1.17.055-1.805.249-2.227.415-.562.217-.96.477-1.382.896-.419.42-.679.819-.896 1.382-.164.422-.36 1.057-.413 2.227-.057 1.266-.07 1.646-.07 4.85s.015 3.584.071 4.85c.055 1.17.249 1.805.415 2.227.217.562.477.96.896 1.382.42.419.819.679 1.381.896.422.164 1.057.36 2.227.413 1.266.057 1.646.07 4.85.07zM12 5.837a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

export default function CustomerLogin() {
    const [method, setMethod] = useState<'social' | 'otp' | 'verify'>('social');
    const [contact, setContact] = useState('');
    const router = useRouter();

    const handleOTPRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setMethod('verify');
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('userAccount', contact || 'Guest');
        router.push('/account');
    };

    return (
        <div className={styles.loginPage}>
            <div className={`${styles.loginCard} glass`}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </button>

                <div className={styles.header}>
                    <h1 className="brand-name">Welcome Back</h1>
                    <p className="tagline">CutiXa Adore Community</p>
                </div>

                {method === 'social' && (
                    <div className={styles.socialContainer}>
                        <p className={styles.label}>Login with Social Account</p>
                        <div className={styles.socialGrid}>
                            <button className={styles.socialBtn} onClick={() => { localStorage.setItem('userAccount', 'Social User'); router.push('/account'); }}>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>
                            <button className={styles.socialBtn} onClick={() => { localStorage.setItem('userAccount', 'Social User'); router.push('/account'); }}>
                                <FacebookIcon />
                                <span>Continue with Facebook</span>
                            </button>
                            <button className={styles.socialBtn} onClick={() => { localStorage.setItem('userAccount', 'Social User'); router.push('/account'); }}>
                                <InstagramIcon />
                                <span>Continue with Instagram</span>
                            </button>
                        </div>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <button className={styles.otpLink} onClick={() => setMethod('otp')}>
                            <div className={styles.otpIcon}><ShieldCheck size={20} /></div>
                            <span>Login with Email or Mobile (OTP)</span>
                        </button>
                    </div>
                )}

                {method === 'otp' && (
                    <div className={styles.otpFormContainer}>
                        <h3>Enter Details</h3>
                        <p>We'll send a secure code to your account</p>
                        <form onSubmit={handleOTPRequest} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputIcon}>
                                    {contact.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Email or Mobile Number"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.actionBtn}>Get Secure Code</button>
                            <button type="button" className={styles.cancelBtn} onClick={() => setMethod('social')}>Use Social Login</button>
                        </form>
                    </div>
                )}

                {method === 'verify' && (
                    <div className={styles.otpFormContainer}>
                        <h3>Verify Account</h3>
                        <p>Code sent to <strong>{contact}</strong></p>
                        <form onSubmit={handleVerify} className={styles.form}>
                            <div className={styles.pinGrid}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <input key={i} type="text" maxLength={1} className={styles.pinInput} />
                                ))}
                            </div>
                            <button type="submit" className={styles.actionBtn}>Verify & Login</button>
                            <p className={styles.resend}>Didn't get it? <span onClick={() => setMethod('otp')}>Resend</span></p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
