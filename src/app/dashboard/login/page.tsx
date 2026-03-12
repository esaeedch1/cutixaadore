'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function OwnerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Super User Login (Developer)
        if (email === 'esaeedch@gmail.com' && password === 'Sa3022022#@!') {
            localStorage.setItem('userRole', 'Developer');
            localStorage.setItem('userName', 'Saeed Ahmad');
            router.push('/dashboard');
        }
        // Standard Owner Login
        else if (email === 'admin@cutixa.com' && password === 'admin123') {
            localStorage.setItem('userRole', 'Owner');
            localStorage.setItem('userName', 'Executive Owner');
            router.push('/dashboard');
        } else {
            alert('Invalid credentials. Access Denied.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={`${styles.loginCard} glass`}>
                <h1 className="brand-name">Executive Portal</h1>
                <p className="tagline">CutiXa Adore Dashboard</p>

                <form onSubmit={handleLogin} className={styles.formSplit}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@cutixa.com"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.loginBtn}>Access Dashboard</button>
                </form>

                <button className={styles.backBtn} onClick={() => router.push('/')}>Return to Site</button>
            </div>
        </div>
    );
}
