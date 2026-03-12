'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Info, Briefcase, AlertCircle } from 'lucide-react';
import styles from './contact.module.css';

const SUBJECTS = [
    { value: 'complaint', label: 'Complaint', icon: AlertCircle, color: '#ef4444' },
    { value: 'info', label: 'General Info', icon: Info, color: '#3b82f6' },
    { value: 'business', label: 'Business Offer', icon: Briefcase, color: '#c5a059' },
    { value: 'review', label: 'Product Review', icon: MessageSquare, color: '#22c55e' },
    { value: 'other', label: 'Other', icon: Mail, color: '#8b5cf6' },
];

export default function ContactPage() {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <div className={styles.contactPage}>
            <header className={styles.header}>
                <h2 className="brand-name" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/shop'}>
                    CutiXa Adore
                </h2>
                <nav className={styles.nav}>
                    <a href="/shop">Shop</a>
                    <a href="/contact" className={styles.active}>Contact</a>
                </nav>
            </header>

            <main className={styles.main}>
                <div className={styles.heroSection}>
                    <h1>Get In <span className="brand-name">Touch</span></h1>
                    <p>We&apos;d love to hear from you. Choose a subject and send us a message.</p>
                </div>

                <div className={styles.contentGrid}>
                    {/* Contact Info */}
                    <div className={styles.infoPanel}>
                        <div className={`${styles.infoCard} glass`}>
                            <h3>Contact Information</h3>
                            <div className={styles.infoItem}>
                                <Phone size={20} className={styles.infoIcon} />
                                <div>
                                    <p className={styles.infoLabel}>WhatsApp / Call</p>
                                    <a href="https://wa.me/923143022022" className={styles.infoValue}>+92 314 302 2022</a>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <Mail size={20} className={styles.infoIcon} />
                                <div>
                                    <p className={styles.infoLabel}>Email</p>
                                    <p className={styles.infoValue}>hello@cutixaadore.com</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={20} className={styles.infoIcon} />
                                <div>
                                    <p className={styles.infoLabel}>Location</p>
                                    <p className={styles.infoValue}>Pakistan</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className={`${styles.socialCard} glass`}>
                            <h3>Follow Us</h3>
                            <div className={styles.socialLinks}>
                                <a href="https://facebook.com" target="_blank" className={`${styles.socialLink} ${styles.fb}`} rel="noreferrer">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook
                                </a>
                                <a href="https://instagram.com" target="_blank" className={`${styles.socialLink} ${styles.ig}`} rel="noreferrer">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    Instagram
                                </a>
                                <a href="https://tiktok.com" target="_blank" className={`${styles.socialLink} ${styles.tt}`} rel="noreferrer">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z" /></svg>
                                    TikTok
                                </a>
                                <a href="https://pinterest.com" target="_blank" className={`${styles.socialLink} ${styles.pin}`} rel="noreferrer">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                                    Pinterest
                                </a>
                                <a href="https://linkedin.com" target="_blank" className={`${styles.socialLink} ${styles.li}`} rel="noreferrer">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={`${styles.formCard} glass`}>
                        {submitted ? (
                            <div className={styles.successMessage}>
                                <div className={styles.successIcon}>✓</div>
                                <h3>Message Sent!</h3>
                                <p>We&apos;ll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <h3>Send Us a Message</h3>

                                {/* Subject Selector */}
                                <div className={styles.formGroup}>
                                    <label>Select Subject *</label>
                                    <div className={styles.subjectGrid}>
                                        {SUBJECTS.map(sub => {
                                            const Icon = sub.icon;
                                            return (
                                                <div
                                                    key={sub.value}
                                                    className={`${styles.subjectChip} ${selectedSubject === sub.value ? styles.subjectSelected : ''}`}
                                                    style={selectedSubject === sub.value ? { borderColor: sub.color, background: `${sub.color}22` } : {}}
                                                    onClick={() => setSelectedSubject(sub.value)}
                                                >
                                                    <Icon size={18} style={{ color: sub.color }} />
                                                    <span>{sub.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <input type="hidden" name="subject" value={selectedSubject} required />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name *</label>
                                        <input type="text" className={styles.input} required placeholder="Your name" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email / Phone *</label>
                                        <input type="text" className={styles.input} required placeholder="Email or phone number" />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Your Message *</label>
                                    <textarea className={styles.textarea} required placeholder="Describe your query in detail..." rows={5} />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={!selectedSubject}>
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Social Bar */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <span className="brand-name" style={{ fontSize: '1.2rem' }}>CutiXa Adore</span>
                    <div className={styles.footerLinks}>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                        <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
                        <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
