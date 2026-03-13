'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Download, FileText, ExternalLink, CheckCircle,
    Clock, User, RefreshCw, TrendingUp, AlertTriangle, Printer
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface Invoice {
    id: string;
    orderId?: string;
    customerName: string;
    customerEmail: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    paymentMethod?: string;
    items?: any[];
}

export default function InvoiceManagement() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [idFormat] = useState('DDMMYYYY/HH:mm/count');

    const loadInvoices = useCallback(() => {
        const saved = localStorage.getItem('cutixa_invoices');
        if (saved) {
            setInvoices(JSON.parse(saved));
        } else {
            const initial: Invoice[] = [
                { id: '11032026/12:10/001', customerName: 'Ali Khan', customerEmail: 'ali@example.com', date: '2026-03-11', amount: 4500, status: 'Paid', paymentMethod: 'JazzCash' },
                { id: '09032026/15:20/002', customerName: 'Sara Ahmed', customerEmail: 'sara@example.com', date: '2026-03-09', amount: 1200, status: 'Pending', paymentMethod: 'Bank Transfer' },
            ];
            setInvoices(initial);
            localStorage.setItem('cutixa_invoices', JSON.stringify(initial));
        }
    }, []);

    useEffect(() => {
        loadInvoices();
        const onStorage = () => loadInvoices();
        window.addEventListener('storage', onStorage);
        window.addEventListener('cutixa_new_order', onStorage);
        window.addEventListener('cutixa_payment_confirmed', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('cutixa_new_order', onStorage);
            window.removeEventListener('cutixa_payment_confirmed', onStorage);
        };
    }, [loadInvoices]);

    const generateID = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const count = String(invoices.length + 1).padStart(3, '0');
        return `${dd}${mm}${yyyy}/${hh}:${min}/${count}`;
    };

    const handleCreateInvoice = () => {
        const newInv: Invoice = {
            id: generateID(),
            customerName: 'New Customer',
            customerEmail: 'customer@example.com',
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            status: 'Pending',
        };
        const updated = [newInv, ...invoices];
        setInvoices(updated);
        localStorage.setItem('cutixa_invoices', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const updateStatus = (id: string, status: Invoice['status']) => {
        const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
        setInvoices(updated);
        localStorage.setItem('cutixa_invoices', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const printInvoice = (inv: Invoice) => {
        const w = window.open('', '_blank');
        w?.document.write(`<html><head><title>Invoice ${inv.id}</title><style>
            body{font-family:'Georgia',serif;padding:50px;max-width:650px;margin:0 auto;color:#1a1a1a}
            h1{color:#c5a059;font-size:2.5rem;margin:0}
            .brand{border-bottom:2px solid #c5a059;padding-bottom:1rem;margin-bottom:2rem}
            .info{display:flex;justify-content:space-between;margin-bottom:2rem}
            table{width:100%;border-collapse:collapse;margin:1.5rem 0}
            th{background:#f9f6ee;padding:12px;text-align:left;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em}
            td{padding:12px;border-bottom:1px solid #eee}
            .total{text-align:right;font-size:1.3rem;font-weight:bold;color:#c5a059;margin-top:1rem}
            .status{display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:600;
                background:${inv.status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)'};
                color:${inv.status === 'Paid' ? '#16a34a' : '#b45309'}}
            .footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.8rem;color:#666;text-align:center}
        </style></head><body>
            <div class="brand"><h1>CutiXa Adore</h1><p style="color:#888;margin:4px 0 0">Love Your Skin</p></div>
            <div class="info">
                <div><h3 style="margin:0 0 0.5rem">INVOICE</h3>
                    <p style="margin:0;font-family:monospace;color:#c5a059">${inv.id}</p>
                    ${inv.orderId ? `<p style="margin:4px 0 0;font-size:0.85rem;color:#888">Order: ${inv.orderId}</p>` : ''}
                </div>
                <div style="text-align:right">
                    <p style="margin:0"><strong>${inv.customerName}</strong></p>
                    <p style="margin:4px 0;color:#888;font-size:0.9rem">${inv.customerEmail}</p>
                    <p style="margin:4px 0;color:#888;font-size:0.9rem">Date: ${inv.date}</p>
                </div>
            </div>
            <table><tr><th>Description</th><th>Amount</th></tr>
            ${inv.items && inv.items.length > 0
                ? inv.items.map((item: any) =>
                    `<tr><td>${item.name} × ${item.qty || 1}</td><td>PKR ${((item.price || 0) * (item.qty || 1)).toLocaleString()}</td></tr>`
                ).join('')
                : `<tr><td>Services / Products</td><td>PKR ${inv.amount.toLocaleString()}</td></tr>`
            }
            </table>
            <p class="total">Total: PKR ${inv.amount.toLocaleString()}</p>
            <p>Status: <span class="status">${inv.status}</span></p>
            ${inv.paymentMethod ? `<p>Payment Method: ${inv.paymentMethod}</p>` : ''}
            <div class="footer">CutiXa Adore · Thank you for your business!</div>
        </body></html>`);
        w?.document.close();
        w?.print();
    };

    const filtered = invoices.filter(inv =>
        (inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.orderId || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || inv.status === filterStatus)
    );

    // ─── Computed real summary numbers ─────────────────────────────────────
    const totalInvoiced = invoices.reduce((s, inv) => s + inv.amount, 0);
    const totalCollected = invoices.filter(inv => inv.status === 'Paid').reduce((s, inv) => s + inv.amount, 0);
    const outstanding = invoices.filter(inv => inv.status !== 'Paid').reduce((s, inv) => s + inv.amount, 0);
    const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

    return (
        <div className={styles.productPanel}>

            {/* ─── Summary Cards ─── */}
            <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Invoiced', value: `PKR ${totalInvoiced.toLocaleString()}`, color: 'var(--gold-matte)', icon: FileText },
                    { label: 'Collected', value: `PKR ${totalCollected.toLocaleString()}`, color: '#22c55e', icon: CheckCircle },
                    { label: 'Outstanding', value: `PKR ${outstanding.toLocaleString()}`, color: '#eab308', icon: Clock },
                    { label: 'Overdue', value: overdueCount, color: '#ef4444', icon: AlertTriangle },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`${styles.statCard} glass`}>
                            <div className={styles.statInfo}>
                                <Icon size={18} color={s.color} />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, marginTop: '0.5rem' }}>{s.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* ─── Controls ─── */}
            <div className={styles.controls} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by Invoice ID, Customer, or Order..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <select
                        className={styles.select}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ minWidth: '130px' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={loadInvoices}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className={styles.primaryBtn} onClick={handleCreateInvoice}>
                        <FileText size={16} /> New Invoice
                    </button>
                </div>
            </div>

            {/* ─── Table ─── */}
            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                                No invoices found
                            </td></tr>
                        ) : filtered.map((inv) => (
                            <tr key={inv.id} className={styles.productRow}>
                                <td><span className={styles.skuTag}>{inv.id}</span></td>
                                <td>
                                    {inv.orderId
                                        ? <span className={styles.skuTag} style={{ opacity: 0.8 }}>{inv.orderId}</span>
                                        : <span style={{ opacity: 0.3 }}>—</span>
                                    }
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 30, height: 30, background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.85rem' }}>{inv.customerName}</p>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{inv.customerEmail}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>{inv.date}</td>
                                <td style={{ fontWeight: 700, color: 'var(--gold-matte)' }}>
                                    PKR {inv.amount.toLocaleString()}
                                </td>
                                <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {inv.paymentMethod || '—'}
                                </td>
                                <td>
                                    <select
                                        value={inv.status}
                                        onChange={e => updateStatus(inv.id, e.target.value as Invoice['status'])}
                                        style={{
                                            fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px',
                                            border: '1px solid var(--border)', background: inv.status === 'Paid'
                                                ? 'rgba(34,197,94,0.1)' : inv.status === 'Overdue'
                                                    ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                                            color: inv.status === 'Paid' ? '#22c55e' : inv.status === 'Overdue' ? '#ef4444' : '#eab308',
                                            fontWeight: 700, cursor: 'pointer', outline: 'none'
                                        }}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </td>
                                <td>
                                    <div className={styles.rowActions}>
                                        <button className={styles.editBtn} title="Print Invoice" onClick={() => printInvoice(inv)}>
                                            <Printer size={16} />
                                        </button>
                                        <button className={styles.editBtn} title="Download">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ─── Legend ─── */}
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>📊 Invoice ID format: <code style={{ color: 'var(--gold-matte)' }}>{idFormat}</code></span>
                <span>🔄 Invoices auto-generated on checkout · Synced with Orders in real-time</span>
            </div>
        </div>
    );
}
