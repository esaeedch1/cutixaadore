'use client';

import React, { useState, useEffect } from 'react';
import { Play, Video, Lock, Crown } from 'lucide-react';
import styles from './courses.module.css';

interface CourseVideo {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    category: string;
    addedDate: string;
    isPrivate?: boolean;
    views?: number;
}

interface Subscriber {
    id: string;
    email: string;
    name: string;
    tier: string;
    status: 'active' | 'pending' | 'expired';
}

function getEmbedUrl(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return url;
}

function getThumbnail(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
    return '';
}

const CATEGORIES = ['Skincare Routine', 'Hair Care Tips', 'Beauty Tutorials', 'Product Usage', 'DIY Recipes'];

export default function CoursesPage() {
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
    const [filterCat, setFilterCat] = useState('All');
    const [currentSubscriber, setCurrentSubscriber] = useState<Subscriber | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cutixa_courses');
        if (saved) setVideos(JSON.parse(saved));
        else {
            const demo: CourseVideo[] = [
                {
                    id: '1',
                    title: 'Perfect Skincare Routine for Beginners',
                    description: 'Learn the essential steps for a glowing skincare routine using CutiXa products.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                    category: 'Skincare Routine',
                    addedDate: '2026-03-11',
                    isPrivate: false,
                    views: 124,
                },
                {
                    id: '2',
                    title: 'Advanced Hair Care Secrets 🔒',
                    description: 'Premium hair care techniques available for subscribers only.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                    category: 'Hair Care Tips',
                    addedDate: '2026-03-11',
                    isPrivate: true,
                    views: 0,
                }
            ];
            setVideos(demo);
            localStorage.setItem('cutixa_courses', JSON.stringify(demo));
        }

        // Check if user already logged in
        const savedUser = localStorage.getItem('cutixa_current_viewer');
        if (savedUser) setCurrentSubscriber(JSON.parse(savedUser));
    }, []);

    const handleLogin = () => {
        setLoginError('');
        const subscribers: Subscriber[] = JSON.parse(localStorage.getItem('cutixa_subscribers') || '[]');
        const found = subscribers.find(s => s.email.toLowerCase() === loginEmail.toLowerCase() && s.status === 'active');
        if (found) {
            setCurrentSubscriber(found);
            localStorage.setItem('cutixa_current_viewer', JSON.stringify(found));
            setShowLoginModal(false);
            setLoginEmail('');
        } else {
            setLoginError('Email not found or subscription not active. Please check your invite.');
        }
    };

    const handlePlayVideo = (video: CourseVideo) => {
        if (video.isPrivate && !currentSubscriber) {
            setShowLoginModal(true);
            return;
        }
        setSelectedVideo(video);
    };

    const filtered = filterCat === 'All' ? videos : videos.filter(v => v.category === filterCat);

    return (
        <div className={styles.coursesPage}>
            <header className={styles.header}>
                <h2 className="brand-name" onClick={() => window.location.href = '/shop'} style={{ cursor: 'pointer' }}>
                    CutiXa Adore
                </h2>
                <nav className={styles.nav}>
                    <a href="/shop">Shop</a>
                    <a href="/courses" className={styles.active}>Courses</a>
                    <a href="/contact">Contact</a>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {currentSubscriber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-shining)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '0.85rem'
                            }}>
                                {currentSubscriber.name[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gold-matte)' }}>{currentSubscriber.tier}</span>
                            <button
                                onClick={() => { setCurrentSubscriber(null); localStorage.removeItem('cutixa_current_viewer'); }}
                                style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            style={{
                                padding: '0.5rem 1.2rem', background: 'var(--gold-shining)', color: 'white',
                                border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Crown size={14} /> Subscriber Login
                        </button>
                    )}
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.hero}>
                    <Video size={40} className={styles.heroIcon} />
                    <h1>Beauty <span className="brand-name">Courses</span> &amp; Tutorials</h1>
                    <p>Learn from expert beauty guides. Watch, learn, and glow!</p>
                    {!currentSubscriber && (
                        <div style={{
                            marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.5rem', background: 'rgba(197,160,89,0.1)', border: '1px solid rgba(197,160,89,0.3)',
                            borderRadius: '50px', fontSize: '0.875rem', color: 'var(--gold-matte)'
                        }}>
                            <Lock size={14} /> Some videos are for subscribers only.{' '}
                            <button onClick={() => setShowSubscribeModal(true)} style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                                Subscribe
                            </button>
                        </div>
                    )}
                </div>

                {/* Category Filter */}
                <div className={styles.filterBar}>
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${filterCat === cat ? styles.filterActive : ''}`}
                            onClick={() => setFilterCat(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Video Grid */}
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Video size={48} opacity={0.3} />
                        <p>No videos yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className={styles.videoGrid}>
                        {filtered.map(video => (
                            <div
                                key={video.id}
                                className={`${styles.videoCard} glass`}
                                onClick={() => handlePlayVideo(video)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.thumbnail}>
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={video.title} style={video.isPrivate && !currentSubscriber ? { filter: 'blur(4px)' } : {}} />
                                    ) : (
                                        <div className={styles.thumbPlaceholder}><Video size={32} /></div>
                                    )}
                                    <div className={styles.playOverlay}>
                                        {video.isPrivate && !currentSubscriber ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                <Lock size={28} fill="white" color="white" />
                                                <span style={{ fontSize: '0.72rem', color: 'white', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Subscribers Only</span>
                                            </div>
                                        ) : (
                                            <Play size={32} fill="white" />
                                        )}
                                    </div>
                                </div>
                                <div className={styles.videoInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <span className={styles.categoryBadge}>{video.category}</span>
                                        {video.isPrivate && (
                                            <span style={{
                                                background: 'rgba(197,160,89,0.12)', color: 'var(--gold-matte)',
                                                padding: '2px 8px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: 3
                                            }}>
                                                <Crown size={10} /> Premium
                                            </span>
                                        )}
                                    </div>
                                    <h3>{video.title}</h3>
                                    <p>{video.isPrivate && !currentSubscriber ? '🔒 Subscribe to unlock this premium content.' : video.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className={styles.playerOverlay} onClick={() => setSelectedVideo(null)}>
                    <div className={styles.playerModal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>×</button>
                        <div className={styles.playerWrapper}>
                            {getEmbedUrl(selectedVideo.videoUrl).includes('youtube') || getEmbedUrl(selectedVideo.videoUrl).includes('vimeo') ? (
                                <iframe
                                    src={getEmbedUrl(selectedVideo.videoUrl)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className={styles.iframe}
                                    title={selectedVideo.title}
                                />
                            ) : (
                                <video controls className={styles.videoPlayer} src={selectedVideo.videoUrl} />
                            )}
                        </div>
                        <div className={styles.playerInfo}>
                            <span className={styles.categoryBadge}>{selectedVideo.category}</span>
                            <h2>{selectedVideo.title}</h2>
                            <p>{selectedVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscriber Login Modal */}
            {showLoginModal && (
                <div className={styles.playerOverlay} onClick={() => setShowLoginModal(false)}>
                    <div className={styles.playerModal} onClick={e => e.stopPropagation()} style={{ maxWidth: 440, padding: '2rem' }}>
                        <button className={styles.closeBtn} onClick={() => setShowLoginModal(false)}>×</button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <Crown size={40} style={{ color: 'var(--gold-matte)', marginBottom: 8 }} />
                            <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Subscriber Access</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                                Enter your invited email address to unlock premium content.
                            </p>
                        </div>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={loginEmail}
                            onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            style={{
                                width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)',
                                borderRadius: '10px', background: 'var(--surface)', color: 'var(--foreground)',
                                fontSize: '0.9rem', outline: 'none', marginBottom: '0.5rem', boxSizing: 'border-box'
                            }}
                        />
                        {loginError && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{loginError}</p>
                        )}
                        <button
                            onClick={handleLogin}
                            style={{
                                width: '100%', padding: '0.8rem', background: 'var(--gold-shining)', color: 'white',
                                border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
                            }}
                        >
                            Access My Courses
                        </button>
                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Not a subscriber?{' '}
                            <button
                                onClick={() => { setShowLoginModal(false); setShowSubscribeModal(true); }}
                                style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Subscribe now
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Subscribe Info Modal */}
            {showSubscribeModal && (
                <div className={styles.playerOverlay} onClick={() => setShowSubscribeModal(false)}>
                    <div className={styles.playerModal} onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: '2rem' }}>
                        <button className={styles.closeBtn} onClick={() => setShowSubscribeModal(false)}>×</button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <Crown size={40} style={{ color: 'var(--gold-matte)', marginBottom: 8 }} />
                            <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Get Premium Access</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                                Choose a plan to access all exclusive beauty courses.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'Basic', price: 'PKR 299/month', features: '5 videos/month, Newsletter' },
                                { name: 'Pro ⭐', price: 'PKR 699/month', features: 'Unlimited videos, Live Q&A, Guides' },
                                { name: 'VIP 👑', price: 'PKR 1,499/month', features: '1-on-1 consultations, Exclusive content' },
                            ].map(plan => (
                                <div key={plan.name} style={{
                                    padding: '1rem', border: plan.name.includes('⭐') ? '2px solid var(--gold-matte)' : '1px solid var(--border)',
                                    borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: plan.name.includes('⭐') ? 'rgba(197,160,89,0.05)' : 'transparent'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{plan.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{plan.features}</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--gold-matte)' }}>{plan.price}</div>
                                </div>
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            To subscribe, contact us at{' '}
                            <a href="/contact" style={{ color: 'var(--gold-matte)', fontWeight: 600 }}>our Contact page</a>{' '}
                            and we will send you an email invite.
                        </p>
                    </div>
                </div>
            )}

            <footer className={styles.footer}>
                <p>© 2026 CutiXa Adore. All rights reserved.</p>
                <div className={styles.footerLinks}>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                    <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
                </div>
            </footer>
        </div>
    );
}
