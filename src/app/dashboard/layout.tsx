'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    FileText,
    Share2,
    Video,
    Warehouse,
    ShoppingBag,
    Bell,
    CheckCircle2,
    TrendingUp
} from 'lucide-react';
import styles from './dashboard.module.css';

// ─── Notification Toast ────────────────────────────────────────────────────
interface Toast {
    id: string;
    type: 'order' | 'payment' | 'stock';
    message: string;
    subtext?: string;
    time: string;
}

function NotificationToast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 6000);
        return () => clearTimeout(t);
    }, [onClose]);

    const icons: Record<string, React.ReactNode> = {
        order: <ShoppingBag size={18} color="#c5a059" />,
        payment: <CheckCircle2 size={18} color="#22c55e" />,
        stock: <TrendingUp size={18} color="#3b82f6" />,
    };
    const colors: Record<string, string> = {
        order: 'rgba(197,160,89,0.15)',
        payment: 'rgba(34,197,94,0.12)',
        stock: 'rgba(59,130,246,0.12)',
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            background: colors[toast.type], backdropFilter: 'blur(12px)',
            border: `1px solid ${toast.type === 'order' ? 'rgba(197,160,89,0.3)' : toast.type === 'payment' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
            borderRadius: '14px', padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            minWidth: '300px', maxWidth: '360px',
            animation: 'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative'
        }}>
            <div style={{ marginTop: '2px' }}>{icons[toast.type]}</div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{toast.message}</p>
                {toast.subtext && <p style={{ margin: '2px 0 0', fontSize: '0.76rem', opacity: 0.7 }}>{toast.subtext}</p>}
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', opacity: 0.5 }}>{toast.time}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '2px', lineHeight: 1 }}>
                <X size={14} />
            </button>
        </div>
    );
}

// ─── Notification Bell ─────────────────────────────────────────────────────
function NotificationBell({ count, onClick }: { count: number; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: '8px', borderRadius: '10px',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center'
            }}
            title="Notifications"
        >
            <Bell size={20} style={{ animation: count > 0 ? 'bellRing 0.8s ease 0.2s' : 'none' }} />
            {count > 0 && (
                <span style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: '#ef4444', color: 'white', borderRadius: '50%',
                    width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'scaleIn 0.3s ease'
                }}>
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </button>
    );
}

// ─── Live Badge for Sidebar ────────────────────────────────────────────────
function LiveBadge() {
    return (
        <span style={{
            fontSize: '0.55rem', fontWeight: 700, background: '#22c55e',
            color: 'white', padding: '2px 6px', borderRadius: '4px',
            letterSpacing: '0.05em', animation: 'pulse 2s infinite'
        }}>LIVE</span>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [notifications, setNotifications] = useState<Toast[]>([]);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        const savedName = localStorage.getItem('userName');
        if (!savedRole && !pathname.includes('/login')) {
            router.push('/dashboard/login');
        }
        setRole(savedRole);
        setUserName(savedName);
    }, [pathname, router]);

    // ─── Real-time order/payment event listeners ───────────────────────────
    useEffect(() => {
        const addToast = (toast: Toast) => {
            setToasts(prev => [...prev, toast]);
            setNotifications(prev => [toast, ...prev.slice(0, 49)]);
            setUnreadCount(c => c + 1);
        };

        const handleNewOrder = (e: CustomEvent) => {
            const { order } = e.detail || {};
            if (!order) return;
            setNewOrderCount(c => c + 1);
            addToast({
                id: Math.random().toString(36).substr(2, 9),
                type: 'order',
                message: `🛍️ New Order: ${order.id}`,
                subtext: `${order.customerName} · PKR ${(order.totalAmount || 0).toLocaleString()}`,
                time: new Date().toLocaleTimeString()
            });
        };

        const handlePaymentConfirmed = (e: CustomEvent) => {
            const { order } = e.detail || {};
            addToast({
                id: Math.random().toString(36).substr(2, 9),
                type: 'payment',
                message: `✅ Payment Confirmed: ${order?.id || ''}`,
                subtext: `PKR ${(order?.totalAmount || 0).toLocaleString()} received`,
                time: new Date().toLocaleTimeString()
            });
        };

        const handleStorageChange = () => {
            // Check for new orders via storage event (cross-tab)
            const eventRaw = localStorage.getItem('cutixa_new_order_event');
            if (eventRaw) {
                try {
                    const { data, ts } = JSON.parse(eventRaw);
                    if (Date.now() - ts < 3000) { // Only if recent (<3s ago)
                        handleNewOrder({ detail: data } as CustomEvent);
                        localStorage.removeItem('cutixa_new_order_event');
                    }
                } catch { }
            }
            const payEventRaw = localStorage.getItem('cutixa_payment_confirmed_event');
            if (payEventRaw) {
                try {
                    const { data, ts } = JSON.parse(payEventRaw);
                    if (Date.now() - ts < 3000) {
                        handlePaymentConfirmed({ detail: data } as CustomEvent);
                        localStorage.removeItem('cutixa_payment_confirmed_event');
                    }
                } catch { }
            }
        };

        window.addEventListener('cutixa_new_order', handleNewOrder as EventListener);
        window.addEventListener('cutixa_payment_confirmed', handlePaymentConfirmed as EventListener);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('cutixa_new_order', handleNewOrder as EventListener);
            window.removeEventListener('cutixa_payment_confirmed', handlePaymentConfirmed as EventListener);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO', 'Salesman'] },
        { name: 'Products', href: '/dashboard/products', icon: Package, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO'] },
        { name: 'Inventory', href: '/dashboard/inventory', icon: Warehouse, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO'] },
        { name: 'Role Management', href: '/dashboard/roles', icon: Users, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO', 'Salesman'], live: true },
        { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'Salesman'] },
        { name: 'Page Config', href: '/dashboard/pages', icon: Settings, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Courses', href: '/dashboard/courses', icon: Video, roles: ['Developer', 'Owner', 'Admin', 'Manager'] },
        { name: 'Social Media', href: '/dashboard/social', icon: Share2, roles: ['Developer', 'Owner', 'Admin', 'Manager'] },
    ];

    const filteredNav = navItems.filter(item => role && item.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        router.push('/');
    };

    if (pathname === '/dashboard/login') return <>{children}</>;

    return (
        <div className={styles.dashboardWrapper}>
            {/* ─── Toast Notifications ─── */}
            <div style={{
                position: 'fixed', bottom: '24px', right: '24px',
                zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'all' }}>
                        <NotificationToast toast={toast} onClose={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>

            {/* ─── Notification Slide Panel ─── */}
            {showNotifPanel && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px',
                    background: 'var(--surface)', borderLeft: '1px solid var(--border)',
                    zIndex: 9999, padding: '1.5rem', overflowY: 'auto',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Notifications</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => setUnreadCount(0)}
                                    style={{ fontSize: '0.75rem', color: 'var(--gold-matte)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => setShowNotifPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', opacity: 0.4, marginTop: '3rem' }}>
                            <Bell size={32} style={{ marginBottom: '1rem' }} />
                            <p>No notifications yet</p>
                            <p style={{ fontSize: '0.8rem' }}>New orders & payments will appear here in real-time</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} style={{
                                padding: '12px', borderRadius: '10px', marginBottom: '8px',
                                background: 'var(--background)', border: '1px solid var(--border)'
                            }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{n.message}</p>
                                {n.subtext && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.7 }}>{n.subtext}</p>}
                                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', opacity: 0.4 }}>{n.time}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ─── Sidebar ─── */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed} glass`}>
                <div className={styles.sidebarHeader}>
                    <h2 className="brand-name">CutiXa Adore</h2>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={styles.toggleBtn}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isOrders = item.href === '/dashboard/orders' && newOrderCount > 0;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                                onClick={() => { if (isOrders) setNewOrderCount(0); }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <Icon size={20} />
                                    {isOrders && (
                                        <span style={{
                                            position: 'absolute', top: '-4px', right: '-6px',
                                            background: '#ef4444', color: 'white', borderRadius: '50%',
                                            width: '14px', height: '14px', fontSize: '0.55rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700
                                        }}>
                                            {newOrderCount}
                                        </span>
                                    )}
                                </div>
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isSidebarOpen && (item as any).live && <LiveBadge />}
                                {isActive && isSidebarOpen && <ChevronRight size={16} className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        {isSidebarOpen && (
                            <div className={styles.userText}>
                                <p className={styles.userName}>{userName || 'Executive Portal'}</p>
                                <p className={styles.userRole}>{role}</p>
                            </div>
                        )}
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main className={styles.mainContent}>
                <header className={`${styles.topHeader} glass`}>
                    <div className={styles.headerLeft}>
                        <h1>{navItems.find(n => n.href === pathname)?.name || 'Dashboard'}</h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.statusBadge}>{role} Access</div>
                        <NotificationBell
                            count={unreadCount}
                            onClick={() => { setShowNotifPanel(p => !p); setUnreadCount(0); }}
                        />
                    </div>
                </header>
                <div className={styles.scrollArea}>
                    {children}
                </div>
            </main>

            {/* ─── Global animation styles ─── */}
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes bellRing {
                    0%,100% { transform: rotate(0deg); }
                    20% { transform: rotate(-15deg); }
                    40% { transform: rotate(15deg); }
                    60% { transform: rotate(-10deg); }
                    80% { transform: rotate(10deg); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }
                @keyframes pulse {
                    0%,100% { opacity:1; }
                    50% { opacity:0.5; }
                }
            `}</style>
        </div>
    );
}
