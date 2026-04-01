'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Package, ShoppingBag, TrendingUp, Clock,
    CheckCircle2, Filter, Bell, RefreshCw, AlertTriangle, DollarSign
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './dashboard.module.css';

const mockData = {
    day: [
        { name: '00:00', sales: 400, profit: 240 }, { name: '04:00', sales: 300, profit: 139 },
        { name: '08:00', sales: 200, profit: 980 }, { name: '12:00', sales: 278, profit: 390 },
        { name: '16:00', sales: 189, profit: 480 }, { name: '20:00', sales: 239, profit: 380 },
        { name: '23:59', sales: 349, profit: 430 },
    ],
    week: [
        { name: 'Mon', sales: 2400, profit: 1400 }, { name: 'Tue', sales: 1398, profit: 900 },
        { name: 'Wed', sales: 9800, profit: 4500 }, { name: 'Thu', sales: 3908, profit: 2100 },
        { name: 'Fri', sales: 4800, profit: 2800 }, { name: 'Sat', sales: 3800, profit: 1900 },
        { name: 'Sun', sales: 4300, profit: 2300 },
    ],
    month: [
        { name: 'Week 1', sales: 15000, profit: 8000 }, { name: 'Week 2', sales: 22000, profit: 12000 },
        { name: 'Week 3', sales: 18000, profit: 9500 }, { name: 'Week 4', sales: 31000, profit: 17000 },
    ],
    year: [
        { name: 'Jan', sales: 45000, profit: 21000 }, { name: 'Feb', sales: 52000, profit: 26000 },
        { name: 'Mar', sales: 48000, profit: 24000 }, { name: 'Apr', sales: 61000, profit: 32000 },
        { name: 'May', sales: 55000, profit: 28000 }, { name: 'Jun', sales: 67000, profit: 35000 },
        { name: 'Jul', sales: 72000, profit: 38000 }, { name: 'Aug', sales: 69000, profit: 34000 },
        { name: 'Sep', sales: 58000, profit: 29000 }, { name: 'Oct', sales: 64000, profit: 33000 },
        { name: 'Nov', sales: 78000, profit: 42000 }, { name: 'Dec', sales: 95000, profit: 54000 },
    ]
};

interface Activity {
    id: string;
    content: string;
    time: string;
    type: 'order' | 'payment' | 'stock' | 'system';
}

const typeColors: Record<string, string> = {
    order: '#c5a059',
    payment: '#22c55e',
    stock: '#3b82f6',
    system: 'var(--text-secondary)',
};

export default function DashboardOverview() {
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [stats, setStats] = useState([
        { name: 'Total Products', value: '0', icon: Package, change: '0%', color: '#c5a059' },
        { name: 'Inventory Value', value: 'PKR 0', icon: ShoppingBag, change: 'Live', color: '#3b82f6' },
        { name: 'Confirmed Sales', value: 'PKR 0', icon: TrendingUp, change: '0 Orders', color: '#22c55e' },
        { name: 'Stock Status', value: 'Good', icon: CheckCircle2, change: 'Verified', color: '#c5a059' },
    ]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

    const addActivity = useCallback((act: Omit<Activity, 'id' | 'time'>) => {
        setActivities(prev => [{
            ...act,
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 19)]);
    }, []);

    const loadStats = useCallback(async () => {
        let products = [];
        let orders = [];
        let invoices = [];

        try {
            // Priority: Real API for Hostinger/Production Sync
            const [pRes, oRes, iRes] = await Promise.all([
                fetch('/api/products').then(r => r.json()),
                fetch('/api/orders').then(r => r.json()),
                fetch('/api/invoices').then(r => r.json())
            ]);

            if (!pRes.error) products = pRes;
            if (!oRes.error) orders = oRes;
            if (!iRes.error) invoices = iRes;
        } catch (e) {
            console.warn('API fetch failed, falling back to localStorage');
        }

        // Fallback for local development if API is not yet set up
        if (products.length === 0) products = JSON.parse(localStorage.getItem('cutixa_products') || '[]');
        if (orders.length === 0) orders = JSON.parse(localStorage.getItem('cutixa_orders') || '[]');
        if (invoices.length === 0) invoices = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');

        const inventoryValue = products.reduce((acc: number, p: any) => acc + (p.regularPrice * p.stock), 0);
        const lowStock = products.filter((p: any) => p.stock <= p.lowStockLimit && p.stock > 0);
        const outOfStock = products.filter((p: any) => p.stock === 0);
        const confirmedOrders = orders.filter((o: any) => o.paymentStatus === 'Confirmed');
        const totalSales = confirmedOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
        const pendingInvoices = invoices.filter((inv: any) => inv.status === 'Pending').length;

        setLowStockAlerts([...lowStock.slice(0, 3), ...outOfStock.slice(0, 2)]);

        setStats([
            { name: 'Total Products', value: products.length.toString(), icon: Package, change: `${lowStock.length} Low Stock`, color: '#c5a059' },
            { name: 'Inventory Value', value: `PKR ${(inventoryValue / 1000).toFixed(1)}k`, icon: ShoppingBag, change: 'Live Sync', color: '#3b82f6' },
            { name: 'Confirmed Sales', value: `PKR ${(totalSales / 1000).toFixed(1)}k`, icon: TrendingUp, change: `+${confirmedOrders.length} Orders`, color: '#22c55e' },
            { name: 'Pending Invoices', value: pendingInvoices.toString(), icon: DollarSign, change: `${orders.filter((o: any) => o.status === 'Pending').length} Orders`, color: '#f59e0b' },
        ]);
    }, []);

    useEffect(() => {
        loadStats();

        // Build initial activity from existing data
        const orders = JSON.parse(localStorage.getItem('cutixa_orders') || '[]');
        const recentOrders = orders.slice(0, 5);
        const initial: Activity[] = recentOrders.map((o: any, i: number) => ({
            id: `init-${i}`,
            content: `Order ${o.id} by ${o.customerName} — PKR ${o.totalAmount.toLocaleString()}`,
            time: new Date(o.date).toLocaleTimeString(),
            type: o.paymentStatus === 'Confirmed' ? 'payment' : 'order'
        }));
        if (initial.length === 0) {
            initial.push({ id: 'sys-1', content: 'Dashboard initialized — waiting for activity', time: new Date().toLocaleTimeString(), type: 'system' });
        }
        setActivities(initial);
    }, [loadStats]);

    useEffect(() => {
        // Real-time event listeners
        const handleNewOrder = (e: CustomEvent) => {
            const { order } = e.detail || {};
            if (order) {
                addActivity({
                    content: `🛍️ New order ${order.id} from ${order.customerName} · PKR ${(order.totalAmount || 0).toLocaleString()}`,
                    type: 'order'
                });
                loadStats();
            }
        };

        const handlePaymentConfirmed = (e: CustomEvent) => {
            const { order } = e.detail || {};
            if (order) {
                addActivity({
                    content: `✅ Payment confirmed for ${order.id} · PKR ${(order.totalAmount || 0).toLocaleString()}`,
                    type: 'payment'
                });
                loadStats();
            }
        };

        const handleStorage = () => loadStats();

        window.addEventListener('cutixa_new_order', handleNewOrder as EventListener);
        window.addEventListener('cutixa_payment_confirmed', handlePaymentConfirmed as EventListener);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('cutixa_new_order', handleNewOrder as EventListener);
            window.removeEventListener('cutixa_payment_confirmed', handlePaymentConfirmed as EventListener);
            window.removeEventListener('storage', handleStorage);
        };
    }, [addActivity, loadStats]);

    return (
        <div className={styles.overview}>
            {/* ─── Stats Grid ─── */}
            <div className={styles.controls}>
                <div className={styles.headerTitle}>
                    <p className={styles.label}>Financial Insights</p>
                </div>
                <div className={styles.timeFilter}>
                    <Filter size={16} />
                    {(['day', 'week', 'month', 'year'] as const).map((t) => (
                        <button
                            key={t} onClick={() => setTimeframe(t)}
                            className={`${styles.timeBtn} ${timeframe === t ? styles.activeTime : ''}`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => { loadStats(); addActivity({ content: '🔄 Dashboard stats refreshed manually', type: 'system' }); }}
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className={`${styles.statCard} glass`} style={{ borderLeft: `3px solid ${stat.color}30` }}>
                            <div className={styles.statHeader}>
                                <Icon size={22} color={stat.color} />
                                <span className={styles.statChange}>{stat.change}</span>
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statName} style={{ color: 'var(--text-secondary)' }}>{stat.name}</p>
                                <h3 className={styles.statValue} style={{ color: stat.color }}>{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── Low Stock Alerts ─── */}
            {lowStockAlerts.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
                    borderRadius: '12px', padding: '12px 20px'
                }}>
                    <AlertTriangle size={18} color="#eab308" />
                    <span style={{ fontWeight: 700, color: '#eab308', fontSize: '0.85rem' }}>Stock Alerts:</span>
                    {lowStockAlerts.map((p: any) => (
                        <span key={p.id} style={{
                            fontSize: '0.78rem', padding: '3px 10px', borderRadius: '20px',
                            background: p.stock === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                            color: p.stock === 0 ? '#ef4444' : '#eab308', fontWeight: 600
                        }}>
                            {p.name} ({p.stock === 0 ? 'OUT' : `${p.stock} left`})
                        </span>
                    ))}
                </div>
            )}

            {/* ─── Charts ─── */}
            <div className={styles.chartSection}>
                <div className={styles.chartGrid}>
                    <div className={`${styles.mainChart} glass`}>
                        <div className={styles.cardHeader}>
                            <h3>Sales vs Profits ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})</h3>
                            <TrendingUp size={18} />
                        </div>
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={mockData[timeframe]}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} itemStyle={{ color: 'var(--gold-matte)' }} />
                                    <Area type="monotone" dataKey="sales" stroke="#c5a059" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`${styles.mainChart} glass`}>
                        <div className={styles.cardHeader}>
                            <h3>Inventory & Courses Analytics</h3>
                            <Users size={18} />
                        </div>
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={[
                                    { name: 'Stock', val: 80, fill: '#c5a059' },
                                    { name: 'Orders', val: 45, fill: '#22c55e' },
                                    { name: 'Invoices', val: 65, fill: '#3b82f6' },
                                    { name: 'Customers', val: 90, fill: '#8b5cf6' }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                    <Bar dataKey="val" radius={[6, 6, 0, 0]} fill="#c5a059" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Activity Feed (Real-time, Event-driven) ─── */}
            <div className={styles.dashboardGrid}>
                <div className={`${styles.activityCard} glass`}>
                    <div className={styles.cardHeader}>
                        <h3>Live Activity Feed</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#22c55e' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
                            LIVE
                        </div>
                    </div>
                    <div className={styles.activityList}>
                        {activities.slice(0, 8).map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div className={styles.activityIndicator}>
                                    <CheckCircle2 size={16} color={typeColors[activity.type]} />
                                </div>
                                <div className={styles.activityContent}>
                                    <p>{activity.content}</p>
                                    <span>{activity.time}</span>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <p style={{ opacity: 0.4, fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                                Activity will appear here as orders & payments come in...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes livePulse {
                    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
            `}</style>
        </div>
    );
}
