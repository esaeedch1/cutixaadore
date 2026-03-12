'use client';

import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    PhoneCall,
    Mail,
    User,
    QrCode,
    CreditCard,
    ArrowUpRight,
    AlertCircle,
    Printer,
    Download,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Awaiting' | 'Confirmed' | 'Failed';
    paymentMethod: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
    transactionId?: string;
    date: string;
    items: string;
    invoiceId: string;
    confirmedByCall: boolean;
    confirmedByEmail: boolean;
}

export default function OrderDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const loadOrders = () => {
            const saved = localStorage.getItem('cutixa_orders');
            if (saved) {
                setOrders(JSON.parse(saved));
            } else {
                const initial: Order[] = [
                    {
                        id: 'ORD-5481',
                        customerName: 'Zeeshan Ahmed',
                        customerEmail: 'zeeshan@example.com',
                        customerPhone: '0300-1234567',
                        totalAmount: 4500,
                        status: 'Pending',
                        paymentStatus: 'Awaiting',
                        paymentMethod: 'JazzCash',
                        date: new Date().toISOString(),
                        items: 'Radiance Serum x 2',
                        invoiceId: 'INV-2026/01',
                        confirmedByCall: false,
                        confirmedByEmail: false
                    }
                ];
                setOrders(initial);
                localStorage.setItem('cutixa_orders', JSON.stringify(initial));
            }
        };
        loadOrders();
        window.addEventListener('storage', loadOrders);
        return () => window.removeEventListener('storage', loadOrders);
    }, []);

    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem('cutixa_orders', JSON.stringify(newOrders));
        window.dispatchEvent(new Event('storage'));
    };

    const handleCreateOrder = () => {
        const id = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const invId = 'INV-' + new Date().getFullYear() + '/' + (orders.length + 1);

        const newOrder: Order = {
            id,
            customerName: 'Guest Customer',
            customerEmail: 'guest@example.com',
            customerPhone: '03xx-xxxxxxx',
            totalAmount: 2500,
            status: 'Pending',
            paymentStatus: 'Awaiting',
            paymentMethod: 'Bank Transfer',
            date: new Date().toISOString(),
            items: 'Sample Product x 1',
            invoiceId: invId,
            confirmedByCall: false,
            confirmedByEmail: false
        };

        const updated = [newOrder, ...orders];
        saveOrders(updated);

        // Auto Generate Invoice in localStorage
        const invoices = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');
        invoices.push({
            id: invId,
            customerName: newOrder.customerName,
            customerEmail: newOrder.customerEmail,
            date: new Date().toISOString().split('T')[0],
            amount: newOrder.totalAmount,
            status: 'Pending'
        });
        localStorage.setItem('cutixa_invoices', JSON.stringify(invoices));

        alert(`New Order ${id} Created! Invoice ${invId} generated automatically.`);
    };

    const updatePayment = (orderId: string, status: 'Confirmed' | 'Failed', transId: string) => {
        const updated = orders.map(o => {
            if (o.id === orderId) {
                // Realtime Inventory Sync Logic
                if (status === 'Confirmed') {
                    const products = JSON.parse(localStorage.getItem('cutixa_products') || '[]');
                    const updatedProducts = products.map((p: any) => {
                        if (o.items.includes(p.name)) {
                            return { ...p, stock: Math.max(0, p.stock - 1) };
                        }
                        return p;
                    });
                    localStorage.setItem('cutixa_products', JSON.stringify(updatedProducts));

                    // Update Invoice Status
                    const invoices = JSON.parse(localStorage.getItem('cutixa_invoices') || '[]');
                    const updatedInvoices = invoices.map((inv: any) =>
                        inv.id === o.invoiceId ? { ...inv, status: 'Paid' } : inv
                    );
                    localStorage.setItem('cutixa_invoices', JSON.stringify(updatedInvoices));
                }

                return {
                    ...o,
                    paymentStatus: status,
                    transactionId: transId,
                    status: status === 'Confirmed' ? 'Processing' : o.status
                };
            }
            return o;
        });
        saveOrders(updated);
        alert(`Payment ${status} for ${orderId}. Stock and Invoice updated in real-time.`);
    };

    const toggleConfirmation = (orderId: string, type: 'call' | 'email') => {
        const updated = orders.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    confirmedByCall: type === 'call' ? !o.confirmedByCall : o.confirmedByCall,
                    confirmedByEmail: type === 'email' ? !o.confirmedByEmail : o.confirmedByEmail
                };
            }
            return o;
        });
        saveOrders(updated);
    };

    const filtered = orders.filter(o =>
        (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || o.status === filterStatus)
    );

    return (
        <div className={styles.orderPanel}>
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} glass`}>
                    <div className={styles.statInfo}>
                        <TrendingUp size={20} className={styles.statIcon} color="#c5a059" />
                        <span>Today's Revenue</span>
                    </div>
                    <h3>PKR {orders.reduce((acc, o) => acc + (o.paymentStatus === 'Confirmed' ? o.totalAmount : 0), 0).toLocaleString()}</h3>
                </div>
                <div className={`${styles.statCard} glass`}>
                    <div className={styles.statInfo}>
                        <ShoppingBag size={20} className={styles.statIcon} color="#3b82f6" />
                        <span>Pending Orders</span>
                    </div>
                    <h3>{orders.filter(o => o.status === 'Pending').length}</h3>
                </div>
                <div className={`${styles.statCard} glass`}>
                    <div className={styles.statInfo}>
                        <CheckCircle2 size={20} className={styles.statIcon} color="#22c55e" />
                        <span>Monthly Conversion</span>
                    </div>
                    <h3>94.2%</h3>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        className={styles.input}
                        placeholder="Search by Order ID or Name..."
                        value={searchTerm || ''}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={() => window.print()}>
                        <Printer size={18} /> Export Report
                    </button>
                    <button className={styles.primaryBtn} onClick={handleCreateOrder}>
                        <Package size={18} /> Simulate Shop Order
                    </button>
                </div>
            </div>

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Confirmation</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id} className={styles.productRow}>
                                <td>
                                    <span className={styles.skuTag}>{order.id}</span>
                                    <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6 }}>{new Date(order.date).toLocaleDateString()}</p>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{order.customerName}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7 }}>{order.customerPhone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--gold-matte)' }}>PKR {order.totalAmount}</p>
                                    <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6 }}>{order.invoiceId}</p>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            background: order.paymentStatus === 'Confirmed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: order.paymentStatus === 'Confirmed' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {order.paymentStatus}
                                        </span>
                                        {order.paymentStatus === 'Awaiting' && (
                                            <button
                                                onClick={() => updatePayment(order.id, 'Confirmed', 'TXN' + Math.random().toString(36).substr(2, 6).toUpperCase())}
                                                style={{ fontSize: '0.65rem', color: 'var(--gold-matte)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Confirm Payment
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => toggleConfirmation(order.id, 'call')}
                                            style={{ color: order.confirmedByCall ? '#22c55e' : 'var(--text-secondary)', opacity: order.confirmedByCall ? 1 : 0.3 }}
                                            title="Call Confirmation"
                                        >
                                            <PhoneCall size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleConfirmation(order.id, 'email')}
                                            style={{ color: order.confirmedByEmail ? '#3b82f6' : 'var(--text-secondary)', opacity: order.confirmedByEmail ? 1 : 0.3 }}
                                            title="Email Confirmation"
                                        >
                                            <Mail size={18} />
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => {
                                            const updated = orders.map(o => o.id === order.id ? { ...o, status: e.target.value as any } : o);
                                            saveOrders(updated);
                                        }}
                                        className={styles.select}
                                        style={{ fontSize: '0.75rem', padding: '4px' }}
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
                                        <button className={styles.editBtn} onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            printWindow?.document.write(`
                                                <html>
                                                    <head><title>Invoice ${order.invoiceId}</title></head>
                                                    <body style="font-family: sans-serif; padding: 40px;">
                                                        <h1 style="color: #c5a059;">CutiXa Adore</h1>
                                                        <hr/>
                                                        <h2>INVOICE: ${order.invoiceId}</h2>
                                                        <p>Customer: ${order.customerName}</p>
                                                        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                                                        <table border="1" style="width: 100%; border-collapse: collapse;">
                                                            <tr><th>Item</th><th>Amount</th></tr>
                                                            <tr><td>${order.items}</td><td>PKR ${order.totalAmount}</td></tr>
                                                        </table>
                                                        <h3>Total: PKR ${order.totalAmount}</h3>
                                                        <p>Payment Status: ${order.paymentStatus}</p>
                                                    </body>
                                                </html>
                                            `);
                                            printWindow?.print();
                                        }} title="Print Invoice">
                                            <Printer size={16} />
                                        </button>
                                        <button className={styles.editBtn} onClick={() => alert('View QR & Transaction Details for ' + order.id)}>
                                            <QrCode size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
