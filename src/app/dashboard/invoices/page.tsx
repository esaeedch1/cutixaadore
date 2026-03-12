'use client';

import React, { useState } from 'react';
import {
    Search,
    Download,
    Filter,
    FileText,
    ExternalLink,
    CheckCircle,
    Clock,
    User
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface Invoice {
    id: string;
    customerName: string;
    customerEmail: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
}

export default function InvoiceManagement() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [idFormat, setIdFormat] = useState('DDMMYYYY/HH:mm/001');

    React.useEffect(() => {
        const loadInvoices = () => {
            const saved = localStorage.getItem('cutixa_invoices');
            const savedFormat = localStorage.getItem('cutixa_invoice_format');
            if (savedFormat) setIdFormat(savedFormat);

            if (saved) {
                setInvoices(JSON.parse(saved));
            } else {
                const initial = [
                    { id: '11032026/03:10/001', customerName: 'Ali Khan', customerEmail: 'ali@example.com', date: '2026-03-10', amount: 45, status: 'Paid' },
                    { id: '09032026/15:20/002', customerName: 'Sara Ahmed', customerEmail: 'sara@example.com', date: '2026-03-09', amount: 120, status: 'Paid' },
                ];
                setInvoices(initial as Invoice[]);
                localStorage.setItem('cutixa_invoices', JSON.stringify(initial));
            }
        };

        loadInvoices();
        window.addEventListener('storage', loadInvoices);
        return () => window.removeEventListener('storage', loadInvoices);
    }, []);

    const generateCustomID = () => {
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
            id: generateCustomID(),
            customerName: 'New Customer',
            customerEmail: 'customer@example.com',
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            status: 'Pending'
        };
        const updated = [...invoices, newInv];
        setInvoices(updated);
        localStorage.setItem('cutixa_invoices', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        alert('New Invoice Generated with ID: ' + newInv.id);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = invoices.filter(inv =>
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.productPanel}>
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search invoices by ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--surface)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.75rem' }}>ID Format:</span>
                        <input
                            value={idFormat}
                            onChange={(e) => {
                                setIdFormat(e.target.value);
                                localStorage.setItem('cutixa_invoice_format', e.target.value);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--gold-matte)', fontSize: '0.75rem', width: '130px' }}
                        />
                    </div>
                    <button className={styles.primaryBtn} onClick={handleCreateInvoice}>
                        <FileText size={18} /> New Invoice
                    </button>
                </div>
            </div>

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className={styles.productRow}>
                                <td><span className={styles.skuTag}>{inv.id}</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500 }}>{inv.customerName}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inv.customerEmail}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{inv.date}</td>
                                <td>PKR {inv.amount}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        background: inv.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: inv.status === 'Paid' ? '#22c55e' : '#eab308',
                                        border: `1px solid ${inv.status === 'Paid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.rowActions}>
                                        <button className={styles.editBtn} title="Download PDF" onClick={() => alert('Generating Invoice PDF...')}>
                                            <Download size={16} />
                                        </button>
                                        <button className={styles.editBtn} title="View Details">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.grid2} style={{ marginTop: '2rem' }}>
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <CheckCircle size={20} className={styles.statIcon} style={{ color: '#22c55e' }} />
                            <h3>Invoice Summary</h3>
                        </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Total Invoiced</span>
                            <span style={{ fontWeight: 600 }}>PKR 225</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Total Collected</span>
                            <span style={{ fontWeight: 600, color: '#22c55e' }}>PKR 165</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Outstanding</span>
                            <span style={{ fontWeight: 600, color: '#eab308' }}>PKR 60</span>
                        </div>
                    </div>
                </div>

                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Clock size={20} className={styles.statIcon} style={{ color: '#eab308' }} />
                            <h3>Recent Activity</h3>
                        </div>
                    </div>
                    <div className={styles.configList} style={{ padding: '1rem' }}>
                        <p style={{ fontSize: '0.85rem' }}>• {generateCustomID()} was generated for Zainab Bibi</p>
                        <p style={{ fontSize: '0.85rem' }}>• Payment received for {generateCustomID()}</p>
                        <p style={{ fontSize: '0.85rem' }}>• Ali Khan downloaded invoice {generateCustomID()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
