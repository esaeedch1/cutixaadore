'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    CreditCard,
    MapPin,
    LogOut,
    ChevronRight,
    Clock,
    CheckCircle2,
    Truck,
    ShoppingBag
} from 'lucide-react';
import styles from './account.module.css';

interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Paid';
    items: number;
    tracking: string;
}

export default function CustomerAccount() {
    const [user, setUser] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('userAccount');
        if (!savedUser) {
            router.push('/login');
        }
        setUser(savedUser);
    }, [router]);

    const orders: Order[] = [
        { id: 'ORD-7721', date: 'Mar 02, 2026', total: 45, status: 'Shipped', items: 2, tracking: 'CX-9921-881' },
        { id: 'ORD-7605', date: 'Feb 24, 2026', total: 120, status: 'Delivered', items: 1, tracking: 'CX-8812-742' },
        { id: 'ORD-7592', date: 'Feb 15, 2026', total: 60, status: 'Paid', items: 3, tracking: 'CX-7712-901' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('userAccount');
        router.push('/');
    };

    return (
        <div className={styles.accountPage}>
            <header className={`${styles.header} glass`}>
                <div className={styles.container}>
                    <h2 className="brand-name" onClick={() => router.push('/shop')} style={{ cursor: 'pointer' }}>CutiXa Adore</h2>
                    <nav className={styles.nav}>
                        <button onClick={() => router.push('/shop')} className={styles.navLink}>Shop</button>
                        <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={18} /></button>
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.welcomeSection}>
                        <h1>My Account</h1>
                        <p>Welcome back, <strong>{user}</strong></p>
                    </div>

                    <div className={styles.accountGrid}>
                        {/* Sidebar Stats */}
                        <div className={styles.sidebar}>
                            <div className={`${styles.card} glass`}>
                                <div className={styles.statItem}>
                                    <ShoppingBag size={20} className={styles.goldIcon} />
                                    <div>
                                        <h4>Total Orders</h4>
                                        <p>{orders.length}</p>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <CreditCard size={20} className={styles.goldIcon} />
                                    <div>
                                        <h4>Wallet Spent</h4>
                                        <p>PKR 225</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.menuCard} glass`}>
                                <button className={styles.menuItem}>Profile Details <ChevronRight size={16} /></button>
                                <button className={styles.menuItem}>Saved Addresses <ChevronRight size={16} /></button>
                                <button className={styles.menuItem}>Gift Cards <ChevronRight size={16} /></button>
                            </div>
                        </div>

                        {/* Order Records */}
                        <div className={styles.content}>
                            <h3 className={styles.sectionTitle}>Recent Orders & Tracking</h3>
                            <div className={styles.orderList}>
                                {orders.map(order => (
                                    <div key={order.id} className={`${styles.orderCard} glass`}>
                                        <div className={styles.orderHeader}>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderId}>{order.id}</span>
                                                <span className={styles.orderDate}>{order.date}</span>
                                            </div>
                                            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className={styles.orderBody}>
                                            <div className={styles.orderInfo}>
                                                <p>{order.items} Items Purchased</p>
                                                <h4>PKR {order.total}</h4>
                                            </div>

                                            <div className={styles.trackingBox}>
                                                <div className={styles.trackingHeader}>
                                                    <Truck size={16} />
                                                    <span>Track Order: {order.tracking}</span>
                                                </div>
                                                <div className={styles.trackProgress}>
                                                    <div className={styles.progressLine}>
                                                        <div className={styles.progressFill} style={{ width: order.status === 'Delivered' ? '100%' : '60%' }}></div>
                                                    </div>
                                                    <div className={styles.progressSteps}>
                                                        <div className={styles.step} title="Confirmed"><CheckCircle2 size={12} /></div>
                                                        <div className={styles.step} title="Processing"><Clock size={12} /></div>
                                                        <div className={styles.step} title="Shipped"><Truck size={12} /></div>
                                                        <div className={styles.step} title="Delivered"><Package size={12} /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
