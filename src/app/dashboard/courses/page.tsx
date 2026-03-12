'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit, Play, Save, Video, Lock, Unlock,
    Users, Mail, Crown, BarChart2, Eye, Globe, Check, X,
    Send, MapPin, UserCircle, Clock, TrendingUp
} from 'lucide-react';
import styles from '../dashboard.module.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface CourseVideo {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    category: string;
    addedDate: string;
    isPrivate: boolean;
    views: number;
    watchTimeMins: number;
}

interface Subscriber {
    id: string;
    email: string;
    name: string;
    tier: string;
    status: 'active' | 'pending' | 'expired';
    joinedDate: string;
    expiresDate: string;
}

interface SubscriptionTier {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    featured: boolean;
}

const CATEGORIES = ['Skincare Routine', 'Hair Care Tips', 'Beauty Tutorials', 'Product Usage', 'DIY Recipes'];

const DEFAULT_TIERS: SubscriptionTier[] = [
    {
        id: 'basic', name: 'Basic', priceMonthly: 299, priceYearly: 2500,
        features: ['Access to 5 videos/month', 'Beauty tips newsletter', 'Basic support'],
        featured: false
    },
    {
        id: 'pro', name: 'Pro', priceMonthly: 699, priceYearly: 6500,
        features: ['Unlimited videos', 'Live Q&A sessions', 'Priority support', 'Downloadable guides'],
        featured: true
    },
    {
        id: 'vip', name: 'VIP', priceMonthly: 1499, priceYearly: 13999,
        features: ['Everything in Pro', '1-on-1 consultations', 'Exclusive content', 'Early access'],
        featured: false
    },
];

const DEFAULT_SUBSCRIBERS: Subscriber[] = [
    { id: '1', email: 'ayesha@gmail.com', name: 'Ayesha Khan', tier: 'Pro', status: 'active', joinedDate: '2026-01-15', expiresDate: '2027-01-15' },
    { id: '2', email: 'sara@gmail.com', name: 'Sara Ahmed', tier: 'Basic', status: 'active', joinedDate: '2026-02-01', expiresDate: '2026-12-01' },
    { id: '3', email: 'zara@gmail.com', name: 'Zara Siddiqui', tier: 'VIP', status: 'active', joinedDate: '2025-12-10', expiresDate: '2026-12-10' },
    { id: '4', email: 'mina@yahoo.com', name: 'Mina Raza', tier: 'Pro', status: 'pending', joinedDate: '2026-03-11', expiresDate: '2027-03-11' },
];

// Mock analytics data
const locationData = [
    { name: 'Pakistan', views: 3840, watchTime: 12400 },
    { name: 'UAE', views: 1240, watchTime: 4500 },
    { name: 'UK', views: 860, watchTime: 2800 },
    { name: 'USA', views: 620, watchTime: 2100 },
    { name: 'Saudi', views: 540, watchTime: 1800 },
    { name: 'Canada', views: 320, watchTime: 980 },
];

const genderData = [
    { name: 'Female', value: 78, color: '#e879f9' },
    { name: 'Male', value: 16, color: '#3b82f6' },
    { name: 'Other', value: 6, color: '#94a3b8' },
];

const ageData = [
    { name: '13-17', value: 8, color: '#f59e0b' },
    { name: '18-24', value: 32, color: '#c5a059' },
    { name: '25-34', value: 38, color: '#e879f9' },
    { name: '35-44', value: 15, color: '#3b82f6' },
    { name: '45+', value: 7, color: '#22c55e' },
];

const weeklyWatchData = [
    { name: 'Mon', mins: 4200 },
    { name: 'Tue', mins: 3800 },
    { name: 'Wed', mins: 5100 },
    { name: 'Thu', mins: 4700 },
    { name: 'Fri', mins: 6200 },
    { name: 'Sat', mins: 8900 },
    { name: 'Sun', mins: 7400 },
];

function getThumbnail(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
    return '';
}

export default function CoursesManagement() {
    const [activeTab, setActiveTab] = useState<'videos' | 'subscribers' | 'subscriptions' | 'analytics'>('videos');
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>(DEFAULT_SUBSCRIBERS);
    const [tiers, setTiers] = useState<SubscriptionTier[]>(DEFAULT_TIERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<CourseVideo | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteTier, setInviteTier] = useState('Pro');
    const [form, setForm] = useState({
        title: '', description: '', videoUrl: '', category: CATEGORIES[0], isPrivate: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('cutixa_courses');
        if (saved) setVideos(JSON.parse(saved));
        const savedSubs = localStorage.getItem('cutixa_subscribers');
        if (savedSubs) setSubscribers(JSON.parse(savedSubs));
        const savedTiers = localStorage.getItem('cutixa_subscription_tiers');
        if (savedTiers) setTiers(JSON.parse(savedTiers));
    }, []);

    const saveVideos = (newVideos: CourseVideo[]) => {
        setVideos(newVideos);
        localStorage.setItem('cutixa_courses', JSON.stringify(newVideos));
        window.dispatchEvent(new Event('storage'));
    };

    const saveSubscribers = (s: Subscriber[]) => {
        setSubscribers(s);
        localStorage.setItem('cutixa_subscribers', JSON.stringify(s));
    };

    const saveTiers = (t: SubscriptionTier[]) => {
        setTiers(t);
        localStorage.setItem('cutixa_subscription_tiers', JSON.stringify(t));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const video: CourseVideo = {
            id: editingVideo?.id || Math.random().toString(36).substr(2, 9),
            ...form,
            thumbnail: getThumbnail(form.videoUrl),
            addedDate: new Date().toISOString().split('T')[0],
            views: editingVideo?.views || 0,
            watchTimeMins: editingVideo?.watchTimeMins || 0,
        };
        saveVideos(editingVideo ? videos.map(v => v.id === video.id ? video : v) : [video, ...videos]);
        setIsModalOpen(false);
        setEditingVideo(null);
        setForm({ title: '', description: '', videoUrl: '', category: CATEGORIES[0], isPrivate: true });
    };

    const openEdit = (v: CourseVideo) => {
        setEditingVideo(v);
        setForm({ title: v.title, description: v.description, videoUrl: v.videoUrl, category: v.category, isPrivate: v.isPrivate });
        setIsModalOpen(true);
    };

    const handleInvite = () => {
        if (!inviteEmail || !inviteEmail.includes('@')) { alert('Please enter a valid email'); return; }
        const already = subscribers.find(s => s.email === inviteEmail);
        if (already) { alert('This email is already a subscriber!'); return; }
        const newSub: Subscriber = {
            id: Math.random().toString(36).substr(2, 9),
            email: inviteEmail,
            name: inviteEmail.split('@')[0],
            tier: inviteTier,
            status: 'pending',
            joinedDate: new Date().toISOString().split('T')[0],
            expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        saveSubscribers([...subscribers, newSub]);
        setInviteEmail('');
        alert(`✅ Invite sent to ${inviteEmail} for "${inviteTier}" tier!\n\nThey will receive an email with access link.`);
    };

    const revokeAccess = (id: string) => {
        if (!confirm('Revoke access for this subscriber?')) return;
        saveSubscribers(subscribers.filter(s => s.id !== id));
    };

    const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
    const totalWatchTime = videos.reduce((s, v) => s + (v.watchTimeMins || 0), 0);
    const activeSubscribers = subscribers.filter(s => s.status === 'active').length;

    return (
        <div className={styles.coursePanel}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={styles.courseTabRow}>
                    {[
                        { id: 'videos', label: '🎬 Videos', icon: Video },
                        { id: 'subscribers', label: '👥 Subscribers', icon: Users },
                        { id: 'subscriptions', label: '💎 Plans', icon: Crown },
                        { id: 'analytics', label: '📊 Analytics', icon: BarChart2 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.courseTabBtn} ${activeTab === tab.id ? styles.courseTabActive : ''}`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'videos' && (
                    <div className={styles.actions}>
                        <button className={styles.secondaryBtn} onClick={() => window.open('/courses', '_blank')}>
                            <Eye size={16} /> Preview Page
                        </button>
                        <button className={styles.primaryBtn} onClick={() => { setEditingVideo(null); setForm({ title: '', description: '', videoUrl: '', category: CATEGORIES[0], isPrivate: true }); setIsModalOpen(true); }}>
                            <Plus size={18} /> Add Video
                        </button>
                    </div>
                )}
            </div>

            {/* ===== TAB: VIDEOS ===== */}
            {activeTab === 'videos' && (
                <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        {[
                            { label: 'Total Videos', val: videos.length, icon: Video, color: '#c5a059' },
                            { label: 'Private', val: videos.filter(v => v.isPrivate).length, icon: Lock, color: '#ef4444' },
                            { label: 'Public', val: videos.filter(v => !v.isPrivate).length, icon: Globe, color: '#22c55e' },
                            { label: 'Total Views', val: totalViews.toLocaleString(), icon: Eye, color: '#3b82f6' },
                        ].map(s => (
                            <div key={s.label} className={`${styles.inventoryStatCard} glass`} style={{ color: s.color, flex: 1 }}>
                                <div className={styles.invStatLabel}>{s.label}</div>
                                <div className={styles.invStatValue} style={{ color: s.color }}>{s.val}</div>
                            </div>
                        ))}
                    </div>

                    <div className={`${styles.tableContainer} glass`}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Preview</th>
                                    <th>Title & Category</th>
                                    <th>Access</th>
                                    <th>Views</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map(v => (
                                    <tr key={v.id} className={styles.productRow}>
                                        <td>
                                            {v.thumbnail ? (
                                                <img src={v.thumbnail} alt={v.title} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                                            ) : (
                                                <div style={{ width: '80px', height: '45px', background: 'var(--surface)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Video size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{v.title}</div>
                                            <span style={{ background: 'rgba(197,160,89,0.1)', color: 'var(--gold-matte)', padding: '2px 8px', borderRadius: '50px', fontSize: '0.72rem' }}>
                                                {v.category}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {v.isPrivate ? (
                                                    <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Lock size={11} /> Private
                                                    </span>
                                                ) : (
                                                    <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Globe size={11} /> Public
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => saveVideos(videos.map(x => x.id === v.id ? { ...x, isPrivate: !x.isPrivate } : x))}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.72rem' }}
                                                >
                                                    Toggle
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{(v.views || 0).toLocaleString()}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.addedDate}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button className={styles.editBtn} onClick={() => openEdit(v)}><Edit size={16} /></button>
                                                <button className={styles.deleteBtn} onClick={() => {
                                                    if (confirm('Delete this video?')) saveVideos(videos.filter(x => x.id !== v.id));
                                                }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {videos.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                No videos added yet. Click "Add Video" to get started.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ===== TAB: SUBSCRIBERS ===== */}
            {activeTab === 'subscribers' && (
                <>
                    {/* Invite Box */}
                    <div className={`glass`} style={{ borderRadius: 18, padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Mail size={18} /> Invite via Email
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                className={styles.input}
                                style={{ flex: 2, minWidth: 200 }}
                                placeholder="subscriber@email.com"
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                            />
                            <select
                                className={styles.input}
                                style={{ flex: 1, minWidth: 120 }}
                                value={inviteTier}
                                onChange={e => setInviteTier(e.target.value)}
                            >
                                {tiers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                            <button className={styles.primaryBtn} onClick={handleInvite}>
                                <Send size={16} /> Send Invite
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Total Subscribers', val: subscribers.length, color: '#c5a059' },
                            { label: 'Active', val: subscribers.filter(s => s.status === 'active').length, color: '#22c55e' },
                            { label: 'Pending', val: subscribers.filter(s => s.status === 'pending').length, color: '#f59e0b' },
                            { label: 'Monthly Revenue', val: `PKR ${(subscribers.filter(s => s.status === 'active').length * 699).toLocaleString()}`, color: '#3b82f6' },
                        ].map(s => (
                            <div key={s.label} className={`${styles.inventoryStatCard} glass`} style={{ color: s.color, flex: 1 }}>
                                <div className={styles.invStatLabel}>{s.label}</div>
                                <div className={styles.invStatValue} style={{ color: s.color, fontSize: typeof s.val === 'string' && s.val.length > 8 ? '1.3rem' : '2rem' }}>{s.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Subscribers List */}
                    <div className={`glass`} style={{ borderRadius: 18, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                            👥 Subscriber List
                        </div>
                        {subscribers.map(s => (
                            <div key={s.id} className={styles.subscriberRow}>
                                <div className={styles.subscriberAvatar}>{s.name[0].toUpperCase()}</div>
                                <div className={styles.subscriberInfo}>
                                    <div className={styles.subscriberName}>{s.name}</div>
                                    <div className={styles.subscriberEmail}>{s.email}</div>
                                </div>
                                <span className={styles.subscriberTier}>{s.tier}</span>
                                <span className={s.status === 'active' ? styles.inviteActive : styles.invitePending} style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 50, fontWeight: 600 }}>
                                    {s.status}
                                </span>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                    <div>Joined: {s.joinedDate}</div>
                                    <div>Expires: {s.expiresDate}</div>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => revokeAccess(s.id)}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        {subscribers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                No subscribers yet. Invite via email above.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ===== TAB: SUBSCRIPTION PLANS ===== */}
            {activeTab === 'subscriptions' && (
                <>
                    <div className={styles.alertBox} style={{ marginBottom: '1rem' }}>
                        <Crown size={16} />
                        <span>Set up your subscription plans. Subscribers get access to private courses after email invite & payment.</span>
                    </div>
                    <div className={styles.subTierGrid}>
                        {tiers.map(tier => (
                            <div key={tier.id} className={`${styles.subTierCard} glass ${tier.featured ? 'featured' : ''}`}>
                                {tier.featured && <div className={styles.subTierBadge}>⭐ Popular</div>}
                                <div className={styles.subTierName}>{tier.name}</div>
                                <div>
                                    <div className={styles.subTierPrice}>PKR {tier.priceMonthly.toLocaleString()}</div>
                                    <div className={styles.subTierPeriod}>/ month</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                        PKR {tier.priceYearly.toLocaleString()} / year
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {tier.features.map(f => (
                                        <div key={f} className={styles.subTierFeature}>
                                            <Check size={13} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                                    <button
                                        className={styles.secondaryBtn}
                                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', flex: 1 }}
                                        onClick={() => {
                                            const price = prompt(`New monthly price for ${tier.name}:`, String(tier.priceMonthly));
                                            if (price) {
                                                saveTiers(tiers.map(t => t.id === tier.id ? { ...t, priceMonthly: Number(price) } : t));
                                            }
                                        }}
                                    >
                                        <Edit size={12} /> Edit
                                    </button>
                                    <button
                                        className={styles.primaryBtn}
                                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', flex: 1 }}
                                        onClick={() => {
                                            setActiveTab('subscribers');
                                            setInviteTier(tier.name);
                                        }}
                                    >
                                        <Send size={12} /> Invite
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div
                            className={`${styles.subTierCard} glass`}
                            style={{ borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 200 }}
                            onClick={() => {
                                const name = prompt('Plan name:');
                                if (!name) return;
                                const price = prompt('Monthly price (PKR):');
                                if (!price) return;
                                const newTier: SubscriptionTier = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name,
                                    priceMonthly: Number(price),
                                    priceYearly: Number(price) * 10,
                                    features: ['Custom plan'],
                                    featured: false,
                                };
                                saveTiers([...tiers, newTier]);
                            }}
                        >
                            <Plus size={32} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
                            <div style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.85rem' }}>Add New Plan</div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== TAB: ANALYTICS ===== */}
            {activeTab === 'analytics' && (
                <>
                    {/* Summary Stats */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Total Views', val: (totalViews || 7420).toLocaleString(), icon: Eye, color: '#3b82f6' },
                            { label: 'Watch Time', val: `${Math.round((totalWatchTime || 24600) / 60)}h`, icon: Clock, color: '#c5a059' },
                            { label: 'Avg View Duration', val: '8.2 min', icon: TrendingUp, color: '#22c55e' },
                            { label: 'Active Subscribers', val: activeSubscribers, icon: Users, color: '#e879f9' },
                        ].map(s => (
                            <div key={s.label} className={`${styles.inventoryStatCard} glass`} style={{ color: s.color, flex: 1, minWidth: 160 }}>
                                <div className={styles.invStatLabel}>{s.label}</div>
                                <div className={styles.invStatValue} style={{ color: s.color }}>{s.val}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.analyticsGrid}>
                        {/* Weekly Watch Time */}
                        <div className={`${styles.analyticsCard} glass`} style={{ gridColumn: 'span 2' }}>
                            <div className={styles.analyticsCardTitle}>
                                <Clock size={16} /> Weekly Watch Time (minutes)
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={weeklyWatchData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                    <Bar dataKey="mins" fill="#c5a059" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gender Distribution */}
                        <div className={`${styles.analyticsCard} glass`}>
                            <div className={styles.analyticsCardTitle}>
                                <UserCircle size={16} /> Viewer Gender
                            </div>
                            <div className={styles.donutWrapper}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                            {genderData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {genderData.map(g => (
                                    <div key={g.name} className={styles.legendItem}>
                                        <div className={styles.legendDot} style={{ background: g.color }} />
                                        {g.name}
                                        <div className={styles.legendVal}>{g.value}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Age Distribution */}
                        <div className={`${styles.analyticsCard} glass`}>
                            <div className={styles.analyticsCardTitle}>
                                <Users size={16} /> Age Groups
                            </div>
                            <div className={styles.donutWrapper}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={ageData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                                            {ageData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {ageData.map(a => (
                                    <div key={a.name} className={styles.legendItem}>
                                        <div className={styles.legendDot} style={{ background: a.color }} />
                                        {a.name}
                                        <div className={styles.legendVal}>{a.value}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location-wise Views */}
                        <div className={`${styles.analyticsCard} glass`} style={{ gridColumn: 'span 2' }}>
                            <div className={styles.analyticsCardTitle}>
                                <MapPin size={16} /> Views by Location
                            </div>
                            {locationData.map(loc => {
                                const maxViews = Math.max(...locationData.map(l => l.views));
                                const pct = Math.round((loc.views / maxViews) * 100);
                                return (
                                    <div key={loc.name} className={styles.watchHeatRow}>
                                        <div className={styles.watchHeatLabel}>{loc.name}</div>
                                        <div className={styles.watchHeatBar}>
                                            <div className={styles.watchHeatFill} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className={styles.watchHeatVal}>{loc.views.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', minWidth: 80 }}>
                                            {Math.round(loc.watchTime / 60)}h watch time
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Add/Edit Video Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">{editingVideo ? 'Edit Video' : 'Add Video'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                <label>Video Title *</label>
                                <input className={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Skincare Routine for Dry Skin" />
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                <label>Video URL (YouTube, Vimeo, or MP4 link) *</label>
                                <input className={styles.input} value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} required placeholder="https://youtube.com/watch?v=..." />
                                {form.videoUrl && getThumbnail(form.videoUrl) && (
                                    <img src={getThumbnail(form.videoUrl)} alt="thumbnail" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                                )}
                            </div>
                            <div className={styles.formGrid} style={{ marginBottom: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select className={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Access Type</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isPrivate: true })}
                                            style={{
                                                flex: 1, padding: '0.6rem', borderRadius: 10, cursor: 'pointer',
                                                border: `2px solid ${form.isPrivate ? '#ef4444' : 'var(--border)'}`,
                                                background: form.isPrivate ? 'rgba(239,68,68,0.1)' : 'var(--surface)',
                                                color: form.isPrivate ? '#ef4444' : 'var(--text-secondary)',
                                                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                                            }}
                                        >
                                            <Lock size={14} /> Private
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isPrivate: false })}
                                            style={{
                                                flex: 1, padding: '0.6rem', borderRadius: 10, cursor: 'pointer',
                                                border: `2px solid ${!form.isPrivate ? '#22c55e' : 'var(--border)'}`,
                                                background: !form.isPrivate ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                                                color: !form.isPrivate ? '#22c55e' : 'var(--text-secondary)',
                                                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                                            }}
                                        >
                                            <Globe size={14} /> Public
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                <label>Description</label>
                                <textarea className={styles.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description of what viewers will learn..." />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}><Save size={16} /> Save Video</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
