'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2, Send, Plus, Trash2, CheckCircle, Clock, AlertCircle,
    Link as LinkIcon, Heart, MessageCircle, UserPlus, Bell, Settings, X, Check
} from 'lucide-react';
import styles from '../dashboard.module.css';

const PLATFORMS = [
    { id: 'facebook', name: 'Facebook', color: '#1877f2', icon: '📘', url: 'https://facebook.com', apiHint: 'Page Access Token' },
    { id: 'instagram', name: 'Instagram', color: '#e1306c', icon: '📸', url: 'https://instagram.com', apiHint: 'Instagram Business API' },
    { id: 'tiktok', name: 'TikTok', color: '#010101', icon: '🎵', url: 'https://tiktok.com', apiHint: 'TikTok API Key' },
    { id: 'pinterest', name: 'Pinterest', color: '#e60023', icon: '📌', url: 'https://pinterest.com', apiHint: 'Pinterest App Token' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0077b5', icon: '💼', url: 'https://linkedin.com', apiHint: 'LinkedIn Access Token' },
];

interface SocialPost {
    id: string;
    caption: string;
    imageUrl: string;
    platforms: string[];
    scheduledAt: string;
    status: 'draft' | 'scheduled' | 'posted';
    postedAt?: string;
}

interface AccountConfig {
    connected: boolean;
    username: string;
    token: string;
    profileUrl: string;
}

interface Notification {
    id: string;
    platform: string;
    type: 'like' | 'comment' | 'follow';
    from: string;
    content: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', platform: 'instagram', type: 'like', from: 'sarah_beauty', content: 'liked your post "Skincare Routine"', time: '2m ago', read: false },
    { id: '2', platform: 'facebook', type: 'comment', from: 'Ayesha Khan', content: 'commented: "Loved this! Where to buy?"', time: '5m ago', read: false },
    { id: '3', platform: 'tiktok', type: 'like', from: '@trendygirl', content: 'liked your TikTok video', time: '12m ago', read: false },
    { id: '4', platform: 'instagram', type: 'comment', from: 'zara_sk', content: 'commented: "Price please 🙏"', time: '18m ago', read: false },
    { id: '5', platform: 'facebook', type: 'like', from: 'Maria Siddiqui', content: 'liked your Facebook post', time: '32m ago', read: true },
    { id: '6', platform: 'pinterest', type: 'follow', from: 'beauty_addict', content: 'started following your board', time: '1h ago', read: true },
    { id: '7', platform: 'linkedin', type: 'like', from: 'Fatima CEO', content: 'liked your LinkedIn post', time: '2h ago', read: true },
    { id: '8', platform: 'instagram', type: 'follow', from: 'glowwithme_pk', content: 'started following you', time: '3h ago', read: true },
];

export default function SocialMediaManagement() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [accounts, setAccounts] = useState<Record<string, AccountConfig>>({});
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState<'accounts' | 'compose' | 'feed' | 'notifications'>('accounts');
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all');
    const [activeLoginPlatform, setActiveLoginPlatform] = useState<string | null>(null);
    const [loginId, setLoginId] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Composer state
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [scheduledAt, setScheduledAt] = useState('');
    const [postMode, setPostMode] = useState<'now' | 'schedule'>('now');

    // Link form state
    const [linkForm, setLinkForm] = useState<Record<string, { username: string; token: string; profileUrl: string }>>({});

    useEffect(() => {
        const saved = localStorage.getItem('cutixa_social_posts');
        if (saved) setPosts(JSON.parse(saved));
        const savedAccounts = localStorage.getItem('cutixa_social_accounts');
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        else {
            // Default disconnected state
            const def: Record<string, AccountConfig> = {};
            PLATFORMS.forEach(p => { def[p.id] = { connected: false, username: '', token: '', profileUrl: '' }; });
            setAccounts(def);
        }
    }, []);

    const savePosts = (newPosts: SocialPost[]) => {
        setPosts(newPosts);
        localStorage.setItem('cutixa_social_posts', JSON.stringify(newPosts));
    };

    const saveAccounts = (a: Record<string, AccountConfig>) => {
        setAccounts(a);
        localStorage.setItem('cutixa_social_accounts', JSON.stringify(a));
    };

    const handlePost = () => {
        if (!caption || selectedPlatforms.length === 0) {
            alert('Please add a caption and select at least one platform.');
            return;
        }
        const post: SocialPost = {
            id: Math.random().toString(36).substr(2, 9),
            caption,
            imageUrl,
            platforms: selectedPlatforms,
            scheduledAt: postMode === 'schedule' ? scheduledAt : new Date().toISOString(),
            status: postMode === 'schedule' ? 'scheduled' : 'posted',
            postedAt: postMode === 'now' ? new Date().toISOString() : undefined,
        };
        savePosts([post, ...posts]);
        setCaption(''); setImageUrl(''); setSelectedPlatforms([]); setScheduledAt('');
        setIsComposerOpen(false);
        const connectedSel = selectedPlatforms.filter(pid => accounts[pid]?.connected);
        const disconnectedSel = selectedPlatforms.filter(pid => !accounts[pid]?.connected);
        let msg = postMode === 'now'
            ? `✅ Post shared on: ${connectedSel.length > 0 ? connectedSel.join(', ') : 'selected platforms'}!`
            : `⏰ Post scheduled for ${new Date(scheduledAt).toLocaleString()}`;
        if (disconnectedSel.length > 0) msg += `\n\n⚠️ Note: ${disconnectedSel.join(', ')} not connected. Link accounts in Accounts tab.`;
        alert(msg);
    };

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const deletePost = (id: string) => {
        if (confirm('Delete this post?')) savePosts(posts.filter(p => p.id !== id));
    };

    const connectAccount = (platformId: string) => {
        setActiveLoginPlatform(platformId);
        setLoginId('');
        setLoginPass('');
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLoginPlatform) return;

        const platform = PLATFORMS.find(p => p.id === activeLoginPlatform);
        const updated = {
            ...accounts,
            [activeLoginPlatform]: {
                connected: true,
                username: loginId || 'Owner_Account',
                token: 'tkn_' + Math.random().toString(36).substr(2, 9),
                profileUrl: `https://${activeLoginPlatform}.com/${loginId}`,
            }
        };
        saveAccounts(updated);
        alert(`✅ ${platform?.name} linked successfully as ${loginId}!`);
        setActiveLoginPlatform(null);
    };

    const disconnectAccount = (platformId: string) => {
        if (!confirm('Disconnect this account?')) return;
        const updated = { ...accounts, [platformId]: { connected: false, username: '', token: '', profileUrl: '' } };
        saveAccounts(updated);
    };

    const filteredPosts = filterStatus === 'all' ? posts : posts.filter(p => p.status === filterStatus);

    const notifsByPlatform = (pid: string) => notifications.filter(n => n.platform === pid && !n.read);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const getPlatform = (pid: string) => PLATFORMS.find(p => p.id === pid);

    const statusIcon = (status: string) => {
        if (status === 'posted') return <CheckCircle size={14} color="#22c55e" />;
        if (status === 'scheduled') return <Clock size={14} color="#f59e0b" />;
        return <AlertCircle size={14} color="#94a3b8" />;
    };

    return (
        <div className={styles.socialPanel}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className={styles.tabContainer}>
                    {[
                        { id: 'accounts', label: '🔗 Accounts' },
                        { id: 'compose', label: '✏️ Compose & Feed' },
                        {
                            id: 'notifications', label: (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    🔔 Notifications
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {PLATFORMS.map(p => {
                                            const count = notifsByPlatform(p.id).length;
                                            if (count === 0) return null;
                                            return <span key={p.id} style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: '4px', background: p.color, color: 'white' }}>{count}</span>
                                        })}
                                    </div>
                                </div>
                            )
                        },
                    ].map(tab => (
                        <button
                            key={tab.id as string}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'compose' && (
                    <button className={styles.primaryBtn} onClick={() => setIsComposerOpen(true)}>
                        <Plus size={18} /> Compose Post
                    </button>
                )}
            </div>

            {/* ===== TAB: ACCOUNTS ===== */}
            {activeTab === 'accounts' && (
                <div>
                    <div className={styles.alertBox} style={{ marginBottom: '1.5rem' }}>
                        <LinkIcon size={16} />
                        <span>Link your social accounts to enable direct posting and receive real-time notifications right here.</span>
                    </div>

                    {/* Account Cards */}
                    <div className={styles.socialAccountsRow}>
                        {PLATFORMS.map(p => {
                            const acc = accounts[p.id];
                            const nb = notifsByPlatform(p.id).length;
                            return (
                                <div
                                    key={p.id}
                                    className={`${styles.socialAccountCard} glass ${acc?.connected ? 'connected' : 'disconnected'}`}
                                    style={acc?.connected ? { borderColor: p.color, background: `${p.color}08` } : {}}
                                >
                                    {nb > 0 && <div className={styles.notifBadge}>{nb}</div>}
                                    <div className={styles.socialIcon}>{p.icon}</div>
                                    <div className={styles.socialAccountName}>{p.name}</div>
                                    {acc?.connected ? (
                                        <>
                                            <div className={styles.connectedLabel}>✓ {acc.username}</div>
                                            <button
                                                style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}
                                                onClick={() => disconnectAccount(p.id)}
                                            >Disconnect</button>
                                        </>
                                    ) : (
                                        <div className={styles.disconnectedLabel}>Not linked</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Link Form */}
                    <div className={`glass`} style={{ borderRadius: 18, padding: '1.5rem' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Settings size={18} /> Link / Manage Social Accounts
                        </h3>
                        {PLATFORMS.map(p => {
                            const acc = accounts[p.id];
                            return (
                                <div key={p.id} className={styles.platformLinkRow}>
                                    <div className={styles.platformLinkIcon}>{p.icon}</div>
                                    <div className={styles.platformLinkName}>{p.name}</div>
                                    {acc?.connected ? (
                                        <>
                                            <div style={{ flex: 1, fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>
                                                ✅ Connected as: {acc.username}
                                                {acc.profileUrl && (
                                                    <a href={acc.profileUrl} target="_blank" rel="noreferrer"
                                                        style={{ marginLeft: 8, color: 'var(--gold-matte)', textDecoration: 'none', fontSize: '0.75rem' }}>
                                                        View Profile →
                                                    </a>
                                                )}
                                            </div>
                                            <button className={`${styles.platformConnectBtn} active`} onClick={() => disconnectAccount(p.id)}>
                                                Disconnect
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                className={styles.platformLinkInput}
                                                placeholder={`Username / Page name`}
                                                value={linkForm[p.id]?.username || ''}
                                                onChange={e => setLinkForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], username: e.target.value } }))}
                                            />
                                            <input
                                                className={styles.platformLinkInput}
                                                placeholder={p.apiHint}
                                                type="password"
                                                value={linkForm[p.id]?.token || ''}
                                                onChange={e => setLinkForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], token: e.target.value } }))}
                                            />
                                            <input
                                                className={styles.platformLinkInput}
                                                placeholder="Profile URL (optional)"
                                                value={linkForm[p.id]?.profileUrl || ''}
                                                onChange={e => setLinkForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], profileUrl: e.target.value } }))}
                                            />
                                            <button className={`${styles.platformConnectBtn} inactive`} onClick={() => connectAccount(p.id)}>
                                                Connect
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== TAB: COMPOSE & FEED ===== */}
            {activeTab === 'compose' && (
                <>
                    {/* Platform Quick Stats */}
                    <div className={styles.platformStats}>
                        {PLATFORMS.map(p => (
                            <div key={p.id} className={`${styles.platformCard} glass`} style={{ borderTop: `3px solid ${p.color}` }}>
                                <span className={styles.platformEmoji}>{p.icon}</span>
                                <span className={styles.platformName}>{p.name}</span>
                                <span className={styles.platformCount}>
                                    {posts.filter(post => post.platforms.includes(p.id) && post.status === 'posted').length} posts
                                </span>
                                {accounts[p.id]?.connected ? (
                                    <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>● Connected</span>
                                ) : (
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>○ Not linked</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filter Tabs */}
                    <div className={styles.tabContainer} style={{ marginBottom: '1.5rem' }}>
                        {(['all', 'draft', 'scheduled', 'posted'] as const).map(s => (
                            <button
                                key={s}
                                className={`${styles.tabBtn} ${filterStatus === s ? styles.activeTab : ''}`}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Post Feed */}
                    {filteredPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <Share2 size={48} opacity={0.3} />
                            <p style={{ marginTop: '1rem' }}>No posts yet. Compose your first post!</p>
                        </div>
                    ) : (
                        <div className={styles.postFeed}>
                            {filteredPosts.map(post => (
                                <div key={post.id} className={`${styles.postCard} glass`}>
                                    {post.imageUrl && (
                                        <div className={styles.postImageWrapper}>
                                            <img src={post.imageUrl} alt="Post" className={styles.postImage} />
                                        </div>
                                    )}
                                    <div className={styles.postBody}>
                                        <div className={styles.postMeta}>
                                            <div className={styles.postPlatforms}>
                                                {post.platforms.map(pid => {
                                                    const p = PLATFORMS.find(pl => pl.id === pid);
                                                    return <span key={pid} className={styles.platformTag} style={{ borderColor: p?.color, color: p?.color }}>{p?.icon} {p?.name}</span>;
                                                })}
                                            </div>
                                            <div className={styles.postStatus}>
                                                {statusIcon(post.status)}
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{post.status}</span>
                                            </div>
                                        </div>
                                        <p className={styles.postCaption}>{post.caption}</p>
                                        <div className={styles.postFooter}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {post.status === 'scheduled'
                                                    ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                                                    : post.postedAt ? `Posted: ${new Date(post.postedAt).toLocaleString()}` : 'Draft'}
                                            </span>
                                            <button className={styles.deleteBtn} onClick={() => deletePost(post.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ===== TAB: NOTIFICATIONS ===== */}
            {activeTab === 'notifications' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bell size={20} /> Social Notifications
                            {unreadCount > 0 && (
                                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button className={styles.secondaryBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={markAllRead}>
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Platform filter with badges */}
                    <div className={styles.socialAccountsRow} style={{ marginBottom: '1.5rem' }}>
                        {PLATFORMS.map(p => {
                            const nb = notifications.filter(n => n.platform === p.id && !n.read).length;
                            return (
                                <div key={p.id} className={`${styles.socialAccountCard} glass`} style={{ minWidth: 'auto', padding: '0.8rem 1rem' }}>
                                    {nb > 0 && <div className={styles.notifBadge}>{nb}</div>}
                                    <div style={{ fontSize: '1.5rem' }}>{p.icon}</div>
                                    <div className={styles.socialAccountName}>{p.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                        {notifications.filter(n => n.platform === p.id).length} total
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.notifPanel}>
                        {notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <Bell size={36} opacity={0.3} />
                                <p style={{ marginTop: 12 }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const platform = getPlatform(n.platform);
                                return (
                                    <div key={n.id} className={styles.notifItem} style={{ opacity: n.read ? 0.6 : 1 }}>
                                        <div className={styles.notifPlatformIcon}>{platform?.icon}</div>
                                        <div className={styles.notifContent}>
                                            <div className={styles.notifTitle}>
                                                <strong>{n.from}</strong> {n.content}
                                                {!n.read && <span style={{ display: 'inline-block', width: 6, height: 6, background: '#ef4444', borderRadius: '50%', marginLeft: 6, verticalAlign: 'middle' }} />}
                                            </div>
                                            <div className={styles.notifSub}>{platform?.name}</div>
                                        </div>
                                        <div className={`${styles.notifTypeBadge} ${n.type === 'like' ? styles.notifLike : n.type === 'comment' ? styles.notifComment : styles.notifFollow}`}>
                                            {n.type === 'like' ? <><Heart size={11} /> Like</> : n.type === 'comment' ? <><MessageCircle size={11} /> Comment</> : <><UserPlus size={11} /> Follow</>}
                                        </div>
                                        <div className={styles.notifTime}>{n.time}</div>
                                        {!n.read && (
                                            <button
                                                onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Compose Modal */}
            {isComposerOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '680px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">Compose Social Post</h2>
                            <button onClick={() => setIsComposerOpen(false)} className={styles.closeBtn}>×</button>
                        </div>

                        {/* Platform Selection */}
                        <div className={styles.formGroup} style={{ marginBottom: '1.2rem' }}>
                            <label>Select Platforms</label>
                            <div className={styles.platformSelector}>
                                {PLATFORMS.map(p => (
                                    <div
                                        key={p.id}
                                        className={`${styles.platformToggle} ${selectedPlatforms.includes(p.id) ? styles.platformSelected : ''}`}
                                        style={selectedPlatforms.includes(p.id) ? { borderColor: p.color, background: `${p.color}22` } : {}}
                                        onClick={() => togglePlatform(p.id)}
                                    >
                                        <span>{p.icon}</span>
                                        <span style={{ fontSize: '0.75rem', color: selectedPlatforms.includes(p.id) ? p.color : 'var(--text-secondary)' }}>{p.name}</span>
                                        {accounts[p.id]?.connected && (
                                            <span style={{ fontSize: '0.6rem', color: '#22c55e' }}>● linked</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '1.2rem' }}>
                            <label>Caption / Post Text</label>
                            <textarea
                                className={styles.input}
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                rows={4}
                                placeholder="Write your post caption here... Use #hashtags and @mentions"
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '1.2rem' }}>
                            <label>Image URL (optional)</label>
                            <input
                                className={styles.input}
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                            {imageUrl && (
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
                            )}
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                            <label>When to Post</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {(['now', 'schedule'] as const).map(m => (
                                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <input type="radio" checked={postMode === m} onChange={() => setPostMode(m)} />
                                        {m === 'now' ? 'Post Now' : 'Schedule'}
                                    </label>
                                ))}
                            </div>
                            {postMode === 'schedule' && (
                                <input
                                    type="datetime-local"
                                    className={styles.input}
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryBtn} onClick={() => setIsComposerOpen(false)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handlePost}>
                                <Send size={16} />
                                {postMode === 'now' ? 'Post Now' : 'Schedule Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Login Modal */}
            {activeLoginPlatform && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '400px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Login to {PLATFORMS.find(p => p.id === activeLoginPlatform)?.name}</h3>
                            <button onClick={() => setActiveLoginPlatform(null)} className={styles.closeBtn}>×</button>
                        </div>
                        <form className={styles.productForm} onSubmit={handleLoginSubmit}>
                            <div className={styles.formGroup}>
                                <label>Username / Email / ID</label>
                                <input
                                    className={styles.input}
                                    value={loginId || ''}
                                    onChange={e => setLoginId(e.target.value)}
                                    placeholder="Enter your ID"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={loginPass || ''}
                                    onChange={e => setLoginPass(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setActiveLoginPlatform(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>Login & Link</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
