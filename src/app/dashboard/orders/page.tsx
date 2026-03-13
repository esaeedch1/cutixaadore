'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ShoppingBag, Search, Truck, Package, CheckCircle2, Clock,
    PhoneCall, Mail, User, QrCode, CreditCard, AlertCircle,
    Printer, TrendingUp, DollarSign, Bell, RefreshCw, Eye
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Awaiting' | 'Confirmed' | 'Failed';
    paymentMethod: string;
    transactionId?: string;
    date: string;
    items: string;
    invoiceId: string;
    confirmedByCall: boolean;
    confirmedByEmail: boolean;
    isNew?: boolean;
}

// ─── Live indicator dot ────────────────────────────────────────────────────
const LiveDot = () => (
    <span style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: '#22c55e', marginRight: 6,
        boxShadow: '0 0 0 0 rgba(34,197,94,0.4)',
        animation: 'livePulse 2s infinite'
    }} />
);

// ─── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; color: string }> = {
        Pending: { bg: 'rgba(234,179,8,0.12)', color: '#eab308' },
        Processing: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
        Shipped: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
        Delivered: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
        Cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
        Awaiting: { bg: 'rgba(234,179,8,0.12)', color: '#eab308' },
        Confirmed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
        Failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    };
    const c = colors[status] || { bg: 'rgba(100,100,100,0.1)', color: 'var(--text-secondary)' };
    return (
        <span style={{
            fontSize: '0.72rem', padding: '3px 10px', borderRadius: '50px',
            background: c.bg, color: c.color, fontWeight: 700, display: 'inline-block',
            border: `1px solid ${c.color}22`
        }}>
            {status}
        </span>
    );
};

// ─── broadcast helper (same-tab + cross-tab) ───────────────────────────────
const broadcastEvent = (key: string, data: any) => {
    localStorage.setItem(key + '_event', JSON.stringify({ data, ts: Date.now() }));
    window.dispatchEvent(new CustomEvent(key, { detail: data }));
    window.dispatchEvent(new Event('storage'));
};

export default function OrderDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [newOrderFlash, setNewOrderFlash] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);

    const loadOrders = useCallback(() => {
        const saved = localStorage.getItem('cutixa_orders');
        if (saved) {
            setOrders(JSON.parse(saved));
        } else {
            const initial: Order[] = [{
                id: 'ORD-5481', customerName: 'Zeeshan Ahmed',
                customerEmail: 'zeeshan@example.com', customerPhone: '0300-1234567',
                totalAmount: 4500, status: 'Pending', paymentStatus: 'Awaiting',
                paymentMethod: 'JazzCash', date: new Date().toISOString(),
                items: 'Radiance Serum x 2', invoiceId: 'INV-2026/01',
                confirmedByCall: false, confirmedByEmail: false
            }];
            setOrders(initial);
            localStorage.setItem('cutixa_orders', JSON.stringify(initial));
        }
        setLastRefreshed(new Date());
    }, []);

    useEffect(() => {
        loadOrders();

        // Listen for new orders from checkout
        const handleNewOrder = (e: CustomEvent) => {
            const { order } = e.detail || {};
            if (order) {
                setOrders(prev => {
                    const exists = prev.find(o => o.id === order.id);
                    if (exists) return prev;
                    const withNew = [{ ...order, isNew: true }, ...prev];
                    localStorage.setItem('cutixa_orders', JSON.stringify(withNew));
                    return withNew;
                });
                setNewOrderFlash(true);
                setTimeout(() => setNewOrderFlash(false), 4000);
                setLastRefreshed(new Date());
            }
        };

        const handleStorageChange = () => loadOrders();

        window.addEventListener('cutixa_new_order', handleNewOrder as EventListener);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('cutixa_new_order', handleNewOrder as EventListener);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadOrders]);

    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem('cutixa_orders', JSON.stringify(newOrders));
        window.dispatchEvent(new Event('storage'));
    };

    const updatePayment = (orderId: string, status: 'Confirmed' | 'Failed', transId: string) => {
        const updated = orders.map(o => {
            if (o.id !== orderId) return o;

            if (status === 'Confirmed') {
                // Sync inventory: decrement stock for ordered products
                const products = JSON.parse(localStorage.getItem('cutixa_products') || '[]');
                const updatedProducts = products.map((p: any) => {
                    if (o.items.toLowerCase().includes(p.name.toLowerCase())) {
                        const qty = parseInt(o.items.match(/x\s*(\d+)/)?.[1] || '1');
                        return { ...p, stock: Math.max(0, p.stock - qty) };
                    }
                    return p;
                });
                localStorage.setItem('cutixa_products', JSON.stringify(updatedProducts));

                // Sync invoice status → Paid
                const invoices = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');
                const updatedInvoices = invoices.map((inv: any) =>
                    inv.id === o.invoiceId ? { ...inv, status: 'Paid' } : inv
                );
                localStorage.setItem('cutixa_invoices', JSON.stringify(updatedInvoices));

                // Broadcast payment confirmed event for dashboard notifications
                broadcastEvent('cutixa_payment_confirmed', {
                    order: { ...o, paymentStatus: status, transactionId: transId },
                });
            }

            return {
                ...o, paymentStatus: status, transactionId: transId, isNew: false,
                status: status === 'Confirmed' ? 'Processing' as const : o.status
            };
        });

        saveOrders(updated);

        // Toast-style confirmation (without alert blocking)
        broadcastEvent('cutixa_payment_confirmed', {
            order: updated.find(o => o.id === orderId)
        });
    };

    const toggleConfirmation = (orderId: string, type: 'call' | 'email') => {
        const updated = orders.map(o => o.id === orderId ? {
            ...o,
            confirmedByCall: type === 'call' ? !o.confirmedByCall : o.confirmedByCall,
            confirmedByEmail: type === 'email' ? !o.confirmedByEmail : o.confirmedByEmail,
        } : o);
        saveOrders(updated);
    };

    const filtered = orders.filter(o =>
        (o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || o.status === filterStatus || o.paymentStatus === filterStatus)
    );

    // ─── Stats computed from real data ─────────────────────────────────────
    const confirmedRevenue = orders.filter(o => o.paymentStatus === 'Confirmed').reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const awaitingPayment = orders.filter(o => o.paymentStatus === 'Awaiting').length;
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());

    return (
        <div className={styles.orderPanel}>
            {/* ─── Live new-order banner ─── */}
            {newOrderFlash && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '12px', padding: '12px 20px', marginBottom: '1.5rem',
                    animation: 'slideDown 0.4s ease'
                }}>
                    <Bell size={18} color="#22c55e" />
                    <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem' }}>
                        🛍️ New order received in real-time!
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Invoice auto-generated · Inventory synced</span>
                </div>
            )}

            {/* ─── Stats ─── */}
            <div className={styles.statsGrid}>
                {[
                    { label: "Today's Revenue", value: `PKR ${confirmedRevenue.toLocaleString()}`, icon: TrendingUp, color: '#c5a059' },
                    { label: "Pending Orders", value: pendingOrders, icon: ShoppingBag, color: '#3b82f6' },
                    { label: "Awaiting Payment", value: awaitingPayment, icon: CreditCard, color: '#f59e0b' },
                    { label: "Total Orders", value: orders.length, icon: Package, color: '#22c55e' },
                ].map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className={`${styles.statCard} glass`}>
                            <div className={styles.statInfo}>
                                <Icon size={20} color={stat.color} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.label}</span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* ─── Controls ─── */}
            <div className={styles.controls} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            className={styles.input}
                            placeholder="Search by Order ID, Name or Item..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.select}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ minWidth: '130px' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Awaiting">Awaiting Payment</option>
                        <option value="Confirmed">Payment Confirmed</option>
                    </select>
                </div>
                <div className={styles.actions}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <LiveDot />
                        Live · Refreshed {lastRefreshed.toLocaleTimeString()}
                    </div>
                    <button className={styles.secondaryBtn} onClick={loadOrders}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => window.print()}>
                        <Printer size={16} /> Export
                    </button>
                </div>
            </div>

            {/* ─── Table ─── */}
            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID / Date</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Confirm</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                                No orders found
                            </td></tr>
                        ) : filtered.map(order => (
                            <tr key={order.id} className={styles.productRow}
                                style={{
                                    background: order.isNew ? 'rgba(34,197,94,0.04)' : undefined,
                                    borderLeft: order.isNew ? '3px solid #22c55e' : undefined
                                }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {order.isNew && <LiveDot />}
                                        <span className={styles.skuTag}>{order.id}</span>
                                    </div>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.68rem', opacity: 0.6 }}>
                                        {new Date(order.date).toLocaleString()}
                                    </p>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{order.customerName}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6 }}>{order.customerPhone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p style={{ margin: 0, fontSize: '0.8rem', maxWidth: '160px' }}>{order.items}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.68rem', opacity: 0.5 }}>{order.paymentMethod}</p>
                                </td>
                                <td>
                                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--gold-matte)' }}>
                                        PKR {order.totalAmount.toLocaleString()}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.68rem', opacity: 0.6 }}>{order.invoiceId}</p>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <StatusBadge status={order.paymentStatus} />
                                        {order.paymentStatus === 'Awaiting' && (
                                            <button
                                                onClick={() => updatePayment(order.id, 'Confirmed',
                                                    'TXN' + Math.random().toString(36).substr(2, 6).toUpperCase())}
                                                style={{
                                                    fontSize: '0.7rem', color: '#22c55e',
                                                    textDecoration: 'underline', background: 'none',
                                                    border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0
                                                }}
                                            >
                                                ✅ Confirm Payment
                                            </button>
                                        )}
                                        {order.transactionId && (
                                            <p style={{ margin: 0, fontSize: '0.65rem', fontFamily: 'monospace', opacity: 0.6 }}>
                                                {order.transactionId}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => toggleConfirmation(order.id, 'call')}
                                            title="Call Confirmation"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: order.confirmedByCall ? '#22c55e' : 'var(--text-secondary)',
                                                opacity: order.confirmedByCall ? 1 : 0.3,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <PhoneCall size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleConfirmation(order.id, 'email')}
                                            title="Email Confirmation"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: order.confirmedByEmail ? '#3b82f6' : 'var(--text-secondary)',
                                                opacity: order.confirmedByEmail ? 1 : 0.3,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Mail size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => {
                                            const updated = orders.map(o =>
                                                o.id === order.id ? { ...o, status: e.target.value as any } : o
                                            );
                                            saveOrders(updated);
                                        }}
                                        className={styles.select}
                                        style={{ fontSize: '0.75rem', padding: '4px 8px', minWidth: '110px' }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button className={styles.editBtn} title="View Details"
                                            onClick={() => setDetailOrder(order)}>
                                            <Eye size={16} />
                                        </button>
                                        <button className={styles.editBtn} title="Print Invoice"
                                            onClick={() => {
                                                const w = window.open('', '_blank');
                                                w?.document.write(`<html><head><title>Invoice ${order.invoiceId}</title><style>
                                                    body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto}
                                                    h1{color:#c5a059;font-family:serif}
                                                    table{width:100%;border-collapse:collapse;margin-top:20px}
                                                    th,td{border:1px solid #ddd;padding:10px;text-align:left}
                                                    th{background:#f9f6ee}
                                                    .total{font-size:1.2rem;font-weight:bold;color:#c5a059}
                                                </style></head><body>
                                                    <h1>CutiXa Adore</h1><hr/>
                                                    <h2>INVOICE: ${order.invoiceId}</h2>
                                                    <p><strong>Order ID:</strong> ${order.id}</p>
                                                    <p><strong>Customer:</strong> ${order.customerName}</p>
                                                    <p><strong>Phone:</strong> ${order.customerPhone}</p>
                                                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                                                    <table><tr><th>Item</th><th>Amount</th></tr>
                                                    <tr><td>${order.items}</td><td>PKR ${order.totalAmount}</td></tr>
                                                    </table>
                                                    <p class="total">Total: PKR ${order.totalAmount}</p>
                                                    <p><strong>Payment:</strong> ${order.paymentStatus} via ${order.paymentMethod}</p>
                                                    ${order.transactionId ? `<p><strong>Transaction:</strong> ${order.transactionId}</p>` : ''}
                                                </body></html>`);
                                                w?.document.close();
                                                w?.print();
                                            }}>
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ─── Order Detail Modal ─── */}
            {detailOrder && (
                <div className={styles.modalOverlay} onClick={() => setDetailOrder(null)}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">Order Details</h2>
                            <button onClick={() => setDetailOrder(null)} className={styles.closeBtn}>×</button>
                        </div>
                        <div style={{ padding: '0 0.5rem' }}>
                            {[
                                ['Order ID', detailOrder.id],
                                ['Invoice', detailOrder.invoiceId],
                                ['Customer', detailOrder.customerName],
                                ['Email', detailOrder.customerEmail || '—'],
                                ['Phone', detailOrder.customerPhone],
                                ['Address', detailOrder.customerAddress || '—'],
                                ['Items', detailOrder.items],
                                ['Total', `PKR ${detailOrder.totalAmount.toLocaleString()}`],
                                ['Payment Method', detailOrder.paymentMethod],
                                ['Payment Status', detailOrder.paymentStatus],
                                ['Order Status', detailOrder.status],
                                ['Transaction ID', detailOrder.transactionId || '—'],
                                ['Date', new Date(detailOrder.date).toLocaleString()],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                    <span style={{ opacity: 0.6 }}>{k}</span>
                                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '240px' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes livePulse {
                    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
