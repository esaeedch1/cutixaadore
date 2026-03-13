'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft, ShieldCheck, User, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './login.module.css';

// ─── Native SVG Icons ─────────────────────────────────────────────────────
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
                <stop stopColor="#fd5949" offset="0.45" />
                <stop stopColor="#d6249f" offset="0.6" />
                <stop stopColor="#285AEB" offset="0.9" />
            </radialGradient>
        </defs>
        <path fill="url(#rg)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.457-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

// ─── OTP and Auth Utilities ───────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getRegisteredUsers = (): any[] => {
    try { return JSON.parse(localStorage.getItem('cutixa_registered_users') || '[]'); } catch { return []; }
};

const saveRegisteredUser = (user: any) => {
    const users = getRegisteredUsers();
    const exists = users.findIndex((u: any) => u.email === user.email || u.phone === user.phone);
    if (exists >= 0) users[exists] = { ...users[exists], ...user };
    else users.push(user);
    localStorage.setItem('cutixa_registered_users', JSON.stringify(users));
};

// ─── OTP Input Component ──────────────────────────────────────────────────
const OTPInput = ({ onComplete }: { onComplete: (otp: string) => void }) => {
    const [values, setValues] = useState(['', '', '', '', '', '']);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const newVals = [...values];
        newVals[idx] = val;
        setValues(newVals);
        if (val && idx < 5) refs.current[idx + 1]?.focus();
        if (newVals.every(v => v !== '')) onComplete(newVals.join(''));
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !values[idx] && idx > 0) refs.current[idx - 1]?.focus();
    };

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1rem' }}>
            {values.map((v, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    style={{
                        width: '50px', height: '60px', textAlign: 'center', fontSize: '1.5rem',
                        fontWeight: 700, border: '2px solid var(--border)', borderRadius: '12px',
                        background: 'var(--surface)', color: 'var(--foreground)',
                        outline: 'none', transition: 'border-color 0.2s',
                        borderColor: v ? 'var(--gold-matte)' : 'var(--border)'
                    }}
                />
            ))}
        </div>
    );
};

// ─── Main Login Page ──────────────────────────────────────────────────────
export default function CustomerLogin() {
    type Stage = 'social' | 'register' | 'otp_entry' | 'otp_verify' | 'success';
    const [stage, setStage] = useState<Stage>('social');
    const [loginMethod, setLoginMethod] = useState('');
    const [contact, setContact] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', handle: '' });
    const [isNewUser, setIsNewUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    const checkIfNewUser = (email: string, phone: string) => {
        const users = getRegisteredUsers();
        return !users.some((u: any) => u.email === email || u.phone === phone);
    };

    const sendOTP = (contactVal: string) => {
        const otp = generateOTP();
        setGeneratedOTP(otp);
        setCountdown(60);
        console.info(`[CutiXa OTP] Code for ${contactVal}: ${otp}`); // In production, this would be sent via SMS/Email API
        // Show OTP in a dev-friendly way (simulates real-time delivery)
        alert(`📱 OTP Sent!\n\nYour secure code: ${otp}\n\n(In production, this is sent to ${contactVal} via SMS/Email)`);
    };

    const handleSocialLogin = (provider: string) => {
        setLoginMethod(provider);
        // After social auth would complete, ask for secondary contact
        setStage('register');
        setIsNewUser(true); // Assume new user for social login — will check on form submit
    };

    const handleOTPRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contact.trim()) return;
        const isEmail = contact.includes('@');
        const newUser = checkIfNewUser(isEmail ? contact : '', isEmail ? '' : contact);
        setIsNewUser(newUser);
        if (newUser) {
            setRegForm(prev => ({
                ...prev,
                email: isEmail ? contact : '',
                phone: isEmail ? '' : contact
            }));
            setStage('register');
        } else {
            sendOTP(contact);
            setStage('otp_verify');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contactInfo = loginMethod
            ? // Social login — use handle or typed contact
            (regForm.email || regForm.phone)
            : contact;

        sendOTP(contactInfo || regForm.email || regForm.phone);
        setStage('otp_verify');
    };

    const handleOTPVerify = (otp: string) => {
        if (otp === generatedOTP) {
            const isEmail = contact.includes('@');
            const user = {
                name: regForm.name || (loginMethod ? `${loginMethod} User` : (isEmail ? contact.split('@')[0] : contact)),
                email: regForm.email || (isEmail ? contact : ''),
                phone: regForm.phone || (isEmail ? '' : contact),
                socialHandle: regForm.handle,
                loginMethod,
                registeredAt: new Date().toISOString(),
                id: 'USR-' + Math.random().toString(36).substr(2, 8).toUpperCase()
            };
            saveRegisteredUser(user);
            localStorage.setItem('cutixa_current_user', JSON.stringify(user));
            localStorage.setItem('userAccount', user.name);
            setOtpError('');
            setStage('success');
            setTimeout(() => router.push('/account'), 1500);
        } else {
            setOtpError('Invalid code. Please try again.');
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={`${styles.loginCard} glass`}>
                {stage !== 'success' && stage !== 'social' && (
                    <button onClick={() => setStage('social')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </button>
                )}

                <div className={styles.header}>
                    <h1 className="brand-name">CutiXa Adore</h1>
                    <p className="tagline">
                        {stage === 'social' && 'Welcome — Join or Login'}
                        {stage === 'register' && 'Create Your Account'}
                        {stage === 'otp_entry' && 'Enter Your Contact'}
                        {stage === 'otp_verify' && 'Verify Your Identity'}
                        {stage === 'success' && 'Welcome to CutiXa! 🎉'}
                    </p>
                </div>

                {/* ─── Stage: Social Login Buttons ─── */}
                {stage === 'social' && (
                    <div className={styles.socialContainer}>
                        <p className={styles.label}>Quick Login — Social</p>
                        <div className={styles.socialGrid}>
                            {[
                                { Icon: GoogleIcon, label: 'Continue with Google', provider: 'Google' },
                                { Icon: FacebookIcon, label: 'Continue with Facebook', provider: 'Facebook' },
                                { Icon: InstagramIcon, label: 'Continue with Instagram', provider: 'Instagram' },
                            ].map(({ Icon, label, provider }) => (
                                <button
                                    key={provider}
                                    className={styles.socialBtn}
                                    onClick={() => handleSocialLogin(provider)}
                                >
                                    <Icon />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.divider}><span>OR</span></div>

                        <button className={styles.otpLink} onClick={() => setStage('otp_entry')}>
                            <div className={styles.otpIcon}><ShieldCheck size={20} /></div>
                            <span>Login with Email or Mobile (OTP)</span>
                        </button>
                    </div>
                )}

                {/* ─── Stage: OTP Entry (Email/Phone) ─── */}
                {stage === 'otp_entry' && (
                    <div className={styles.otpFormContainer}>
                        <h3>Enter Your Contact</h3>
                        <p>We&apos;ll send a secure 6-digit code</p>
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
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className={styles.actionBtn}>Continue</button>
                            <button type="button" className={styles.cancelBtn} onClick={() => setStage('social')}>
                                Back to Social Login
                            </button>
                        </form>
                    </div>
                )}

                {/* ─── Stage: Registration Form ─── */}
                {stage === 'register' && (
                    <div className={styles.otpFormContainer}>
                        <h3>
                            {loginMethod ? `Linked via ${loginMethod}` : 'New Account Setup'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
                            {loginMethod
                                ? `Please add a contact method to verify your ${loginMethod} account`
                                : 'Complete your profile to get started'}
                        </p>
                        <form onSubmit={handleRegisterSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputIcon}><User size={18} /></div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={regForm.name}
                                    onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputIcon}><Mail size={18} /></div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={regForm.email}
                                    onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputIcon}><Phone size={18} /></div>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number (e.g., 03xx-xxxxxxx)"
                                    value={regForm.phone}
                                    onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                                    className={styles.input}
                                />
                            </div>
                            {loginMethod && (
                                <div className={styles.inputGroup}>
                                    <div className={styles.inputIcon}>
                                        {loginMethod === 'Google' ? <GoogleIcon /> : loginMethod === 'Facebook' ? <FacebookIcon /> : <InstagramIcon />}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`${loginMethod} username / handle (optional)`}
                                        value={regForm.handle}
                                        onChange={e => setRegForm(f => ({ ...f, handle: e.target.value }))}
                                        className={styles.input}
                                    />
                                </div>
                            )}
                            <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                An OTP will be sent to verify your contact
                            </p>
                            <button type="submit" className={styles.actionBtn}>
                                Send Verification Code
                            </button>
                        </form>
                    </div>
                )}

                {/* ─── Stage: OTP Verify ─── */}
                {stage === 'otp_verify' && (
                    <div className={styles.otpFormContainer}>
                        <h3>🔐 Enter Verification Code</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                            Code sent to <strong>{contact || regForm.email || regForm.phone}</strong>
                        </p>
                        <div style={{ margin: '1.5rem 0' }}>
                            <OTPInput onComplete={handleOTPVerify} />
                        </div>
                        {otpError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} /> {otpError}
                            </div>
                        )}
                        {countdown > 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Resend available in <strong>{countdown}s</strong>
                            </p>
                        ) : (
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    sendOTP(contact || regForm.email || regForm.phone);
                                    setOtpError('');
                                }}
                            >
                                Resend Code
                            </button>
                        )}
                    </div>
                )}

                {/* ─── Stage: Success ─── */}
                {stage === 'success' && (
                    <div className={styles.otpFormContainer} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: '#22c55e' }}>Verified Successfully!</h3>
                        <p>Redirecting to your account...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
