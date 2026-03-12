'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw,
    Search, Filter, Plus, Minus, Download, Printer, Barcode, X, Check, Settings
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface Product {
    id: string;
    name: string;
    sku: string;
    categories: string;
    brand: string;
    regularPrice: number;
    salePrice: number;
    stock: number;
    lowStockLimit: number;
    images: string;
    inStock: boolean;
}

interface StockAdjustment {
    id: string;
    productId: string;
    productName: string;
    type: 'add' | 'remove' | 'set';
    qty: number;
    note: string;
    date: string;
}

interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
}

/* ──────────────────────────────────────────────────
   Barcode Generator Helper
   ────────────────────────────────────────────────── */
function generateBarcode(canvas: HTMLCanvasElement, text: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    const bars: number[] = [];
    for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i);
        bars.push((c & 0x40) ? 3 : 1);
        bars.push((c & 0x20) ? 2 : 1);
        bars.push((c & 0x10) ? 3 : 2);
        bars.push((c & 0x08) ? 1 : 2);
        bars.push((c & 0x04) ? 2 : 1);
        bars.push((c & 0x02) ? 1 : 3);
        bars.push((c & 0x01) ? 3 : 1);
        bars.push(1);
    }
    const total = bars.reduce((a, b) => a + b, 0);
    const unit = (W - 20) / total;
    let x = 10;
    ctx.fillStyle = '#000000';
    bars.forEach((w, i) => {
        if (i % 2 === 0) ctx.fillRect(x, 10, w * unit, H - 30);
        x += w * unit;
    });
    ctx.fillStyle = '#000';
    ctx.font = `bold 10px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, H - 4);
}

function BarcodeCell({ price, name }: { price: number; name: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const numPrice = Number(price) || 0;
    const code = `PKR${numPrice.toFixed(0)}-${name.replace(/\s+/g, '').substring(0, 6).toUpperCase()}`;
    useEffect(() => {
        if (canvasRef.current) generateBarcode(canvasRef.current, code);
    }, [code]);

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><body style="text-align:center;padding:20px;">
                <h3>${name}</h3>
                <p>Price: PKR ${price}</p>
                <img src="${canvas.toDataURL()}" style="max-width:300px;" />
                <p style="font-family:monospace">${code}</p>
            </body></html>`);
            win.document.close();
            win.print();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <canvas ref={canvasRef} width={120} height={40} style={{ border: '1px solid var(--border)', background: 'white', borderRadius: '4px' }} />
            <button className={styles.adjustBtn} onClick={handlePrint} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                <Printer size={10} /> Print
            </button>
        </div>
    );
}

export default function InventoryManagement() {
    const defaultColumns = [
        { id: 'sku', label: 'SKU', visible: true },
        { id: 'name', label: 'Product Name', visible: true },
        { id: 'categories', label: 'Category', visible: true },
        { id: 'stock', label: 'Stock Level', visible: true },
        { id: 'regularPrice', label: 'Unit Price', visible: true },
        { id: 'value', label: 'Stock Value', visible: true },
    ];

    const [products, setProducts] = useState<Product[]>([]);
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out' | 'good'>('all');
    const [editingStock, setEditingStock] = useState<Product | null>(null);
    const [adjustmentReason, setAdjustmentReason] = useState<'add' | 'remove' | 'set'>('add');
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [adjustmentNote, setAdjustmentNote] = useState('');

    const [currency, setCurrency] = useState('PKR');
    const [exchangeRate, setExchangeRate] = useState(278);
    const [hideEmptyCols, setHideEmptyCols] = useState(false);
    const [inventoryColumns, setInventoryColumns] = useState<ColumnConfig[]>(defaultColumns);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cutixa_products');
        if (saved) setProducts(JSON.parse(saved));
        const adj = localStorage.getItem('cutixa_stock_adjustments');
        if (adj) setAdjustments(JSON.parse(adj));
        const savedCols = localStorage.getItem('cutixa_inventory_columns');
        if (savedCols) setInventoryColumns(JSON.parse(savedCols));
    }, []);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await res.json();
                if (data?.rates?.PKR) setExchangeRate(data.rates.PKR);
            } catch (e) { }
        };
        fetchRate();
    }, []);

    const formatPrice = (pkrAmount: number) => {
        if (currency === 'USD') return `$${(pkrAmount / exchangeRate).toFixed(2)}`;
        return `PKR ${pkrAmount.toLocaleString()}`;
    };

    const isColumnEmpty = (colId: string) => {
        return products.every(p => {
            if (colId === 'value') return (p.stock * p.regularPrice) === 0;
            const val = (p as any)[colId];
            return val === undefined || val === null || val === '' || val === 0;
        });
    };

    const visibleColumns = inventoryColumns.filter(col => {
        if (!col.visible) return false;
        if (hideEmptyCols && isColumnEmpty(col.id)) return false;
        return true;
    });

    const handleAdjust = () => {
        if (!editingStock || !adjustmentQty) return;
        const qty = parseInt(adjustmentQty);
        const updated = products.map(p => {
            if (p.id !== editingStock.id) return p;
            let newStock = p.stock;
            if (adjustmentReason === 'add') newStock += qty;
            else if (adjustmentReason === 'remove') newStock = Math.max(0, newStock - qty);
            else newStock = qty;
            return { ...p, stock: newStock, inStock: newStock > 0 };
        });
        setProducts(updated);
        localStorage.setItem('cutixa_products', JSON.stringify(updated));

        const adj: StockAdjustment = {
            id: Math.random().toString(36).substr(2, 9),
            productId: editingStock.id,
            productName: editingStock.name,
            type: adjustmentReason,
            qty,
            note: adjustmentNote,
            date: new Date().toISOString(),
        };
        const newAdjs = [adj, ...adjustments];
        setAdjustments(newAdjs);
        localStorage.setItem('cutixa_stock_adjustments', JSON.stringify(newAdjs));

        setEditingStock(null);
        setAdjustmentQty('');
        setAdjustmentNote('');
    };

    const toggleColumn = (id: string) => {
        const updated = inventoryColumns.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
        setInventoryColumns(updated);
        localStorage.setItem('cutixa_inventory_columns', JSON.stringify(updated));
    };

    const moveColumn = (index: number, direction: 'up' | 'down') => {
        const newCols = [...inventoryColumns];
        const swapWith = direction === 'up' ? index - 1 : index + 1;
        if (swapWith < 0 || swapWith >= newCols.length) return;
        [newCols[index], newCols[swapWith]] = [newCols[swapWith], newCols[index]];
        setInventoryColumns(newCols);
        localStorage.setItem('cutixa_inventory_columns', JSON.stringify(newCols));
    };

    const filteredItems = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;
        if (filterStock === 'out') return p.stock === 0;
        if (filterStock === 'low') return p.stock > 0 && p.stock <= p.lowStockLimit;
        if (filterStock === 'good') return p.stock > p.lowStockLimit;
        return true;
    });

    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const inventoryValue = products.reduce((s, p) => s + (p.regularPrice * p.stock), 0);

    const getStockStatus = (stock: number, lowLimit: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: '#ef4444' };
        if (stock <= lowLimit) return { label: 'Low Stock', color: '#f59e0b' };
        return { label: 'In Stock', color: '#22c55e' };
    };

    return (
        <div className={styles.inventoryPanel}>
            <div className={styles.inventoryGrid}>
                {[
                    { label: 'Total Products', value: products.length, color: '#c5a059', icon: Package },
                    { label: 'Stock Units', value: totalStock.toLocaleString(), color: '#3b82f6', icon: TrendingUp },
                    { label: 'Inventory Value', value: formatPrice(inventoryValue), color: '#22c55e', icon: Package }
                ].map(stat => (
                    <div key={stat.label} className={`${styles.inventoryStatCard} glass`} style={{ color: stat.color }}>
                        <div className={styles.invStatLabel}>{stat.label}</div>
                        <div className={styles.invStatValue}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className={styles.controls} style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input className={styles.input} placeholder="Search..." value={searchTerm || ''} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    <div className={`${styles.glass} ${styles.actionBtn}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' }}>
                        <span style={{ fontSize: '0.8rem' }}>Currency:</span>
                        <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" id="invHide" checked={hideEmptyCols} onChange={e => setHideEmptyCols(e.target.checked)} />
                        <label htmlFor="invHide" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Hide Empty</label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={() => setIsColumnModalOpen(true)}>
                        <Settings size={16} /> Manage Columns
                    </button>
                    <button className={styles.primaryBtn} onClick={() => window.location.reload()}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {visibleColumns.map(col => <th key={col.id}>{col.label}</th>)}
                            <th>Barcode</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const status = getStockStatus(item.stock, item.lowStockLimit);
                            return (
                                <tr key={item.id} className={styles.productRow}>
                                    {visibleColumns.map(col => (
                                        <td key={col.id}>
                                            {col.id === 'stock' ? (
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                        <span>{item.stock} Units</span>
                                                        <span style={{ color: status.color }}>{status.label}</span>
                                                    </div>
                                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: 4 }}>
                                                        <div style={{ height: '100%', width: `${Math.min((item.stock / item.lowStockLimit) * 50, 100)}%`, background: status.color }} />
                                                    </div>
                                                </div>
                                            ) : col.id === 'regularPrice' ? formatPrice(item.regularPrice) :
                                                col.id === 'value' ? formatPrice(item.stock * item.regularPrice) :
                                                    (item as any)[col.id]}
                                        </td>
                                    ))}
                                    <td><BarcodeCell price={item.regularPrice} name={item.name} /></td>
                                    <td>
                                        <button className={styles.adjustBtn} onClick={() => setEditingStock(item)}>Adjust</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Column Management Modal */}
            {isColumnModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '400px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">Manage Columns</h2>
                            <button onClick={() => setIsColumnModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            {inventoryColumns.map((col, idx) => (
                                <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} />
                                    <span style={{ flex: 1 }}>{col.label}</span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className={styles.adjustBtn} onClick={() => moveColumn(idx, 'up')} disabled={idx === 0}>↑</button>
                                        <button className={styles.adjustBtn} onClick={() => moveColumn(idx, 'down')} disabled={idx === inventoryColumns.length - 1}>↓</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Adjustment Modal */}
            {editingStock && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '450px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">Adjust Stock</h2>
                            <button onClick={() => setEditingStock(null)} className={styles.closeBtn}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <p>Product: <strong>{editingStock.name}</strong></p>
                            <p>Current Stock: <strong>{editingStock.stock}</strong></p>

                            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                <label>Action</label>
                                <select className={styles.select} value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value as any)}>
                                    <option value="add">Add (+)</option>
                                    <option value="remove">Remove (-)</option>
                                    <option value="set">Set Exactly (=)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={adjustmentQty || ''}
                                    onChange={e => setAdjustmentQty(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className={styles.modalFooter} style={{ marginTop: '1.5rem' }}>
                                <button className={styles.primaryBtn} onClick={handleAdjust} style={{ width: '100%' }}>
                                    Update Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
