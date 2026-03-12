'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Package,
    ShoppingBag,
    TrendingUp,
    Clock,
    CheckCircle2,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import styles from './dashboard.module.css';

const mockData = {
    day: [
        { name: '00:00', sales: 400, profit: 240 },
        { name: '04:00', sales: 300, profit: 139 },
        { name: '08:00', sales: 200, profit: 980 },
        { name: '12:00', sales: 278, profit: 390 },
        { name: '16:00', sales: 189, profit: 480 },
        { name: '20:00', sales: 239, profit: 380 },
        { name: '23:59', sales: 349, profit: 430 },
    ],
    week: [
        { name: 'Mon', sales: 2400, profit: 1400 },
        { name: 'Tue', sales: 1398, profit: 900 },
        { name: 'Wed', sales: 9800, profit: 4500 },
        { name: 'Thu', sales: 3908, profit: 2100 },
        { name: 'Fri', sales: 4800, profit: 2800 },
        { name: 'Sat', sales: 3800, profit: 1900 },
        { name: 'Sun', sales: 4300, profit: 2300 },
    ],
    month: [
        { name: 'Week 1', sales: 15000, profit: 8000 },
        { name: 'Week 2', sales: 22000, profit: 12000 },
        { name: 'Week 3', sales: 18000, profit: 9500 },
        { name: 'Week 4', sales: 31000, profit: 17000 },
    ],
    year: [
        { name: 'Jan', sales: 45000, profit: 21000 },
        { name: 'Feb', sales: 52000, profit: 26000 },
        { name: 'Mar', sales: 48000, profit: 24000 },
        { name: 'Apr', sales: 61000, profit: 32000 },
        { name: 'May', sales: 55000, profit: 28000 },
        { name: 'Jun', sales: 67000, profit: 35000 },
        { name: 'Jul', sales: 72000, profit: 38000 },
        { name: 'Aug', sales: 69000, profit: 34000 },
        { name: 'Sep', sales: 58000, profit: 29000 },
        { name: 'Oct', sales: 64000, profit: 33000 },
        { name: 'Nov', sales: 78000, profit: 42000 },
        { name: 'Dec', sales: 95000, profit: 54000 },
    ]
};

export default function DashboardOverview() {
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [stats, setStats] = useState([
        { name: 'Total Products', value: '0', icon: Package, change: '0%' },
        { name: 'Inventory Value', value: 'PKR 0', icon: ShoppingBag, change: 'Stable' },
        { name: 'Course Students', value: '0', icon: Users, change: 'New' },
        { name: 'Stock Status', value: 'Good', icon: CheckCircle2, change: 'Verified' },
    ]);

    useEffect(() => {
        // Aggregate Data from LocalStorage
        const products = JSON.parse(localStorage.getItem('cutixa_products') || '[]');
        const courses = JSON.parse(localStorage.getItem('cutixa_courses') || '[]');
        const orders = JSON.parse(localStorage.getItem('cutixa_orders') || '[]');

        const inventoryValue = products.reduce((acc: number, p: any) => acc + (p.regularPrice * p.stock), 0);
        const lowStockCount = products.filter((p: any) => p.stock <= p.lowStockLimit).length;
        const totalSales = orders.filter((o: any) => o.paymentStatus === 'Confirmed').reduce((acc: number, o: any) => acc + o.totalAmount, 0);

        setStats([
            { name: 'Total Products', value: products.length.toString(), icon: Package, change: `+${Math.floor(Math.random() * 10)}%` },
            { name: 'Inventory Value', value: `PKR ${(inventoryValue / 1000).toFixed(1)}k`, icon: ShoppingBag, change: 'Live' },
            { name: 'Confirmed Sales', value: `PKR ${(totalSales / 1000).toFixed(1)}k`, icon: TrendingUp, change: `+${orders.length} Orders` },
            { name: 'Stock Status', value: lowStockCount > 0 ? `${lowStockCount} Low` : 'Optimal', icon: CheckCircle2, change: lowStockCount > 0 ? 'Urgent' : 'Good' },
        ]);
    }, [timeframe]);

    return (
        <div className={styles.overview}>
            <div className={styles.controls}>
                <div className={styles.headerTitle}>
                    <p className={styles.label}>Financial Insights</p>
                </div>
                <div className={styles.timeFilter}>
                    <Filter size={16} />
                    {(['day', 'week', 'month', 'year'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`${styles.timeBtn} ${timeframe === t ? styles.activeTime : ''}`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className={`${styles.statCard} glass`}>
                            <div className={styles.statHeader}>
                                <Icon size={24} className={stat.name === 'Total Sales' ? styles.goldIcon : styles.statIcon} />
                                <span className={styles.statChange}>{stat.change}</span>
                            </div>
                            <div className={styles.statInfo}>
                                <p className={stat.name === 'Total Sales' ? styles.goldText : styles.statName}>{stat.name}</p>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.chartSection}>
                <div className={styles.chartGrid}>
                    <div className={`${styles.mainChart} glass`}>
                        <div className={styles.cardHeader}>
                            <h3>Sales vs Profits ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})</h3>
                            <TrendingUp size={18} />
                        </div>
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={mockData[timeframe]}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--gold-matte)' }}
                                    />
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
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: 'Stock Value', val: 80, fill: '#c5a059' },
                                    { name: 'Course Views', val: 65, fill: '#3b82f6' },
                                    { name: 'Orders', val: 45, fill: '#22c55e' },
                                    { name: 'Engagement', val: 90, fill: '#ef4444' }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="val" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                <div className={`${styles.activityCard} glass`}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Activity</h3>
                        <Clock size={18} />
                    </div>
                    <div className={styles.activityList}>
                        {[
                            { id: 1, content: 'New inventory update for Radiance Serum', time: 'Just now' },
                            { id: 2, content: 'New student enrolled in Skincare Course', time: '1 hour ago' },
                            { id: 3, content: 'System backup completed successfully', time: '3 hours ago' },
                            { id: 4, content: 'Urdu Font (Jameel Noori) updated across system', time: '5 hours ago' },
                        ].map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div className={styles.activityIndicator}><CheckCircle2 size={16} /></div>
                                <div className={styles.activityContent}>
                                    <p className={activity.content.includes('Urdu') ? 'urdu-text' : ''}>{activity.content}</p>
                                    <span>{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
