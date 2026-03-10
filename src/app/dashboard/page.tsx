'use client';

import React, { useState } from 'react';
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

    const stats = [
        { name: 'Total Products', value: '48', icon: Package, change: '+5%' },
        { name: 'Total Sales', value: timeframe === 'week' ? 'PKR 29.8k' : 'PKR 124k', icon: ShoppingBag, change: '+12%' },
        { name: 'Active Users', value: '840', icon: Users, change: '+18%' },
        { name: 'Conversion Rate', value: '3.2%', icon: TrendingUp, change: '+2%' },
    ];

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
                <div className={`${styles.mainChart} glass`}>
                    <div className={styles.cardHeader}>
                        <h3>Sales vs Profits ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})</h3>
                        <TrendingUp size={18} />
                    </div>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={350}>
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
            </div>

            <div className={styles.dashboardGrid}>
                <div className={`${styles.activityCard} glass`}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Activity</h3>
                        <Clock size={18} />
                    </div>
                    <div className={styles.activityList}>
                        {[
                            { id: 1, content: 'New order from Karachi (PKR 4,500)', time: '2 mins ago' },
                            { id: 2, content: 'Product "Radiance Serum" updated', time: '1 hour ago' },
                            { id: 3, content: 'New User Registered through Google', time: '3 hours ago' },
                            { id: 4, content: 'Payment received via JazzCash', time: '5 hours ago' },
                        ].map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div className={styles.activityIndicator}><CheckCircle2 size={16} /></div>
                                <div className={styles.activityContent}>
                                    <p>{activity.content}</p>
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
