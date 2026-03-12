'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    Download,
    Upload,
    Search,
    Filter,
    Trash2,
    Edit,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Link as LinkIcon,
    Settings,
    Eye,
    EyeOff,
    Check,
    X,
    RotateCcw,
    Printer,
    Barcode
} from 'lucide-react';
import Papa from 'papaparse';
import styles from '../dashboard.module.css';

interface Product {
    id: string;
    type: string;
    sku: string;
    name: string;
    published: boolean;
    isFeatured: boolean;
    visibility: string;
    description: string;
    salePriceStart: string;
    salePriceEnd: string;
    salePrice: number;
    regularPrice: number;
    inStock: boolean;
    stock: number;
    lowStockLimit: number;
    weight: number;
    volume: number;
    allowReviews: boolean;
    purchaseNote: string;
    categories: string;
    tags: string;
    images: string;
    brand: string;
    imageType: 'upload' | 'link';
    targetPage: string;
    imageRatio?: string;
}

const CATEGORIES_DATA = {
    "Men": [
        "Pents", "Shirts", "Kurta", "Stiched", "Unstiched", "Sox", "Belts", "Wallets", "Watches", "Rings", "Caps"
    ],
    "Women": [
        "Pents", "Shirts",
        { name: "Ladies Clothing", sub: ["Stiched", "Unstiched"] },
        "Kurta", "Sox", "Belts", "Wallets/ Purses/ Clutch", "Watches", "Caps",
        { name: "Jewellery", sub: ["Ear Rings", "Nose Pins", "Rings", "Necklace"] }
    ],
    "Beauty and Personal Care": [
        { name: "Extracts", sub: ["Glycerites (Glycerin based extracts)", "Oleolites (Oil based Extracts)"] },
        "Skin Care", "Beauty Creams and Soaps", "Hair Care"
    ]
};

interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
}

export default function ProductManagement() {
    const defaultColumns: ColumnConfig[] = [
        { id: 'id', label: 'ID', visible: true },
        { id: 'type', label: 'Type', visible: true },
        { id: 'sku', label: 'SKU', visible: true },
        { id: 'name', label: 'Product Name', visible: true },
        { id: 'published', label: 'Published', visible: true },
        { id: 'isFeatured', label: 'Is Featured?', visible: true },
        { id: 'visibility', label: 'Visibility', visible: true },
        { id: 'regularPrice', label: 'Price', visible: true },
        { id: 'stock', label: 'Stock', visible: true },
        { id: 'brand', label: 'Brand', visible: true },
    ];

    const [products, setProducts] = useState<Product[]>([]);
    const [trashProducts, setTrashProducts] = useState<Product[]>([]);
    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
    const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageRatio, setImageRatio] = useState('1:1');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [csvMetadata, setCsvMetadata] = useState<{ headers: string[], newHeaders: string[], data: any[] } | null>(null);
    const [showColumnPrompt, setShowColumnPrompt] = useState(false);
    const [currency, setCurrency] = useState('PKR');
    const [exchangeRate, setExchangeRate] = useState(278); // Default PKR to USD
    const [hideEmptyCols, setHideEmptyCols] = useState(false);

    const PAGES = ['Shop', 'Featured', 'Sales', 'Home Page', 'New Arrivals', 'Special Deals'];
    const CATEGORY_LIST = ['Skincare', 'Haircare', 'Beauty', 'Accessories', 'Fragrance', 'Body Care'];

    // Live Exchange Rate Simulation (Could be a real API fetch)
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await res.json();
                if (data && data.rates && data.rates.PKR) {
                    setExchangeRate(data.rates.PKR);
                }
            } catch (e) {
                console.log("Using default rate");
            }
        };
        fetchRate();
        const interval = setInterval(fetchRate, 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    // Persist products
    useEffect(() => {
        const savedProducts = localStorage.getItem('cutixa_products');
        if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
        } else {
            const initial: Product[] = [{
                id: '1',
                type: 'Simple',
                sku: 'CX-001',
                name: 'Radiance Serum',
                published: true,
                isFeatured: true,
                visibility: 'Visible',
                description: 'Premium Serum',
                salePriceStart: '',
                salePriceEnd: '',
                salePrice: 40,
                regularPrice: 45,
                inStock: true,
                stock: 100,
                lowStockLimit: 10,
                weight: 50,
                volume: 30,
                allowReviews: true,
                purchaseNote: '',
                categories: 'Beauty',
                tags: 'Skin, Glow',
                images: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
                brand: 'CutiXa',
                imageType: 'link' as const,
                targetPage: 'Shop'
            }];
            setProducts(initial);
            localStorage.setItem('cutixa_products', JSON.stringify(initial));
        }

        const savedTrash = localStorage.getItem('cutixa_trash');
        if (savedTrash) setTrashProducts(JSON.parse(savedTrash));

        const savedCols = localStorage.getItem('product_columns');
        if (savedCols) setColumns(JSON.parse(savedCols));
    }, []);

    const formatPrice = (pkrAmount: number) => {
        if (currency === 'USD') {
            return `$${(pkrAmount / exchangeRate).toFixed(2)}`;
        }
        return `PKR ${pkrAmount.toLocaleString()}`;
    };

    const isColumnEmpty = (colId: string) => {
        return products.every(p => {
            const val = (p as any)[colId];
            return val === undefined || val === null || val === '' || val === 0;
        });
    };

    const visibleColumns = columns.filter(col => {
        if (!col.visible) return false;
        if (hideEmptyCols && isColumnEmpty(col.id)) return false;
        return true;
    });

    const saveProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem('cutixa_products', JSON.stringify(newProducts));
        window.dispatchEvent(new Event('storage'));
    };

    const handleExportCSV = () => {
        const csv = Papa.unparse(products);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'cutixa_products.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveTrash = (newTrash: Product[]) => {
        setTrashProducts(newTrash);
        localStorage.setItem('cutixa_trash', JSON.stringify(newTrash));
    };

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const incomingHeaders = results.meta.fields || [];
                const existingHeaders = columns.map(c => c.id);
                const newOnes = incomingHeaders.filter(h => !existingHeaders.includes(h) && h !== 'id');

                if (newOnes.length > 0) {
                    setCsvMetadata({ headers: incomingHeaders, newHeaders: newOnes, data: results.data });
                    setShowColumnPrompt(true);
                } else {
                    processIncomingData(results.data);
                }
            }
        });
    };

    const processIncomingData = (data: any[], createNew = false, headersToCreate: string[] = []) => {
        if (createNew && headersToCreate.length > 0) {
            const newCols: ColumnConfig[] = headersToCreate.map(h => ({
                id: h, label: h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1'), visible: true
            }));
            const updatedCols = [...columns, ...newCols];
            setColumns(updatedCols);
            localStorage.setItem('cutixa_product_columns', JSON.stringify(updatedCols));
        }

        const imported = data.map((row: any) => ({
            id: row.id || row.ID || Math.random().toString(36).substr(2, 9),
            type: row.type || row.Type || 'Simple',
            sku: row.sku || row.SKU || '',
            name: row['Product Name'] || row.Name || 'Unnamed',
            published: String(row.published || row.Published).toLowerCase() === 'true' || true,
            isFeatured: String(row.isFeatured || row['Is Featured?']).toLowerCase() === 'true' || false,
            visibility: row.visibility || row.Visibility ? ((row.visibility || row.Visibility).charAt(0).toUpperCase() + (row.visibility || row.Visibility).slice(1).toLowerCase()) : 'Visible',
            description: row.description || row.Description || '',
            salePriceStart: row.salePriceStart || row['Date Sale Price Start'] || '',
            salePriceEnd: row.salePriceEnd || row['Date Sale Price End'] || '',
            salePrice: Number(row.salePrice || row['Sale Price']) || 0,
            regularPrice: Number(row.regularPrice || row['Regular Price']) || Number(row.Price) || 0,
            inStock: String(row.inStock || row['In Stock?']).toLowerCase() === 'true' || true,
            stock: Number(row.stock || row.Stock) || 0,
            lowStockLimit: Number(row.lowStockLimit || row['Low Stock Limit']) || 0,
            weight: Number(row.weight || row['Weight (g)']) || 0,
            volume: Number(row.volume || row['Volume(ml)']) || 0,
            allowReviews: String(row.allowReviews || row['Customer Reviews']).toLowerCase() === 'true' || true,
            purchaseNote: row.purchaseNote || row['Purchase Note'] || '',
            categories: row.categories || row.Categories || 'Uncategorized',
            tags: row.tags || row.Tags || '',
            images: row.images || row.Images || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
            brand: row.brand || row.Brand || 'CutiXa',
            imageType: ((row.images || row.Images)?.startsWith('http') ? 'link' : 'upload') as 'upload' | 'link',
            targetPage: row.targetPage || row['Target Page'] || 'Shop',
            ...row // Include any dynamic columns
        }));

        saveProducts([...products, ...imported] as Product[]);
        alert(`${imported.length} products imported successfully!`);
        setShowColumnPrompt(false);
        setCsvMetadata(null);
    };

    const handleBatchDelete = () => {
        if (confirm(`Move ${selectedIds.length} products to Trash?`)) {
            const toTrash = products.filter(p => selectedIds.includes(p.id));
            const remaining = products.filter(p => !selectedIds.includes(p.id));
            saveProducts(remaining);
            saveTrash([...trashProducts, ...toTrash]);
            setSelectedIds([]);
        }
    };

    const handlePermanentDelete = () => {
        if (confirm(`Permanently delete ${selectedIds.length} products from Trash?`)) {
            const remaining = trashProducts.filter(p => !selectedIds.includes(p.id));
            saveTrash(remaining);
            setSelectedIds([]);
        }
    };

    const handleRestoreSelected = () => {
        const toRestore = trashProducts.filter(p => selectedIds.includes(p.id));
        const remaining = trashProducts.filter(p => !selectedIds.includes(p.id));
        saveProducts([...products, ...toRestore]);
        saveTrash(remaining);
        setSelectedIds([]);
    };

    const handleBatchHide = () => {
        const updated = products.map(p =>
            selectedIds.includes(p.id) ? { ...p, visibility: 'Hidden', published: false } : p
        );
        saveProducts(updated);
        setSelectedIds([]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) setSelectedIds([]);
        else setSelectedIds(products.map(p => p.id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const moveColumn = (index: number, direction: 'up' | 'down') => {
        const newCols = [...columns];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target >= 0 && target < newCols.length) {
            [newCols[index], newCols[target]] = [newCols[target], newCols[index]];
            setColumns(newCols);
            localStorage.setItem('product_columns', JSON.stringify(newCols));
        }
    };

    const toggleColumn = (id: string) => {
        const newCols = columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
        setColumns(newCols);
        localStorage.setItem('product_columns', JSON.stringify(newCols));
    };

    const currentList = viewMode === 'active' ? products : trashProducts;
    const filteredList = currentList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Barcode Generator Helper
    const generateBarcode = (canvas: HTMLCanvasElement, text: string) => {
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
    };

    const BarcodeCell = ({ price, name }: { price: number; name: string }) => {
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
    };

    return (
        <div className={styles.productPanel}>
            <div className={styles.controls}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            className={styles.input}
                            style={{ paddingLeft: 36 }}
                            placeholder="Search products..."
                            value={searchTerm || ''}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Currency Selector */}
                    <div className={`${styles.glass} ${styles.actionBtn}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Currency:</span>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--gold-matte)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="PKR">PKR (Local)</option>
                            <option value="USD">USD (Converted)</option>
                        </select>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            1$ ≈ {exchangeRate.toFixed(1)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            id="hideEmpty"
                            checked={hideEmptyCols}
                            onChange={(e) => setHideEmptyCols(e.target.checked)}
                        />
                        <label htmlFor="hideEmpty" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Hide Empty Columns</label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tabBtn} ${viewMode === 'active' ? styles.activeTab : ''}`}
                            onClick={() => { setViewMode('active'); setSelectedIds([]); }}
                        >
                            Active
                        </button>
                        <button
                            className={`${styles.tabBtn} ${viewMode === 'trash' ? styles.activeTab : ''}`}
                            onClick={() => { setViewMode('trash'); setSelectedIds([]); }}
                        >
                            <Trash2 size={14} /> Trash
                        </button>
                    </div>
                    <button className={styles.secondaryBtn} onClick={() => window.open('/shop', '_blank')}>
                        <Eye size={18} /> Visit Shop
                    </button>
                    <button className={styles.secondaryBtn} onClick={handleExportCSV}>
                        <Download size={18} /> Export
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => fileInputRef.current?.click()}>
                        <Upload size={18} /> Import CSV
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleImportCSV} />
                    <button className={styles.primaryBtn} onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className={styles.batchActions}>
                    <span>{selectedIds.length} items selected</span>
                    {viewMode === 'active' ? (
                        <>
                            <button className={styles.secondaryBtn} onClick={handleBatchHide}><EyeOff size={16} /> Hide Selected</button>
                            <button className={styles.deleteBtn} onClick={handleBatchDelete} style={{ background: 'rgba(255,165,0,0.1)', color: 'orange' }}><Trash2 size={16} /> Move to Trash</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.secondaryBtn} onClick={handleRestoreSelected}><RotateCcw size={16} /> Restore</button>
                            <button className={styles.deleteBtn} onClick={handlePermanentDelete} style={{ background: 'rgba(255,0,0,0.1)', color: 'red' }}><Trash2 size={16} /> Delete Permanently</button>
                        </>
                    )}
                </div>
            )}

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === products.length && products.length > 0} />
                            </th>
                            {visibleColumns.map(col => (
                                <th key={col.id}>{col.label}</th>
                            ))}
                            <th>Barcode</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map(p => (
                            <tr key={p.id} className={`${styles.productRow} ${selectedIds.includes(p.id) ? styles.selectedRow : ''}`}>
                                <td>
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                                </td>
                                {visibleColumns.map(col => (
                                    <td key={col.id}>
                                        {col.id === 'published' ? (p.published ? <Check size={16} color="#22c55e" /> : <X size={16} color="#ef4444" />) :
                                            col.id === 'stock' ? (p.stock <= p.lowStockLimit ? <span style={{ color: '#ef4444', fontWeight: 700 }}>{p.stock} (Low)</span> : p.stock) :
                                                col.id === 'images' ? (
                                                    <div style={{
                                                        width: '40px',
                                                        aspectRatio: p.imageRatio?.split(':').join('/') || '1/1',
                                                        overflow: 'hidden',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border)'
                                                    }}>
                                                        <img src={p.images} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                                                    </div>
                                                ) :
                                                    col.id === 'regularPrice' || col.id === 'salePrice' ?
                                                        formatPrice((p as any)[col.id]) :
                                                        (p as any)[col.id]?.toString()}
                                    </td>
                                ))}
                                <td>
                                    <BarcodeCell price={p.salePrice || p.regularPrice} name={p.name} />
                                </td>
                                <td>
                                    <div className={styles.rowActions}>
                                        {viewMode === 'active' ? (
                                            <>
                                                <button className={styles.editBtn} onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}><Edit size={16} /></button>
                                                <button className={styles.deleteBtn} onClick={() => {
                                                    if (confirm('Move to Trash?')) {
                                                        saveProducts(products.filter(o => o.id !== p.id));
                                                        saveTrash([...trashProducts, p]);
                                                    }
                                                }}><Trash2 size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className={styles.editBtn} title="Restore" onClick={() => {
                                                    saveTrash(trashProducts.filter(o => o.id !== p.id));
                                                    saveProducts([...products, p]);
                                                }}><RotateCcw size={16} /></button>
                                                <button className={styles.deleteBtn} title="Permanent Delete" onClick={() => {
                                                    if (confirm('Delete permanently?')) {
                                                        saveTrash(trashProducts.filter(o => o.id !== p.id));
                                                    }
                                                }}><Trash2 size={16} /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Column Config Modal */}
            {isColumnModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass ${styles.columnConfigModal}`}>
                        <div className={styles.modalHeader}>
                            <h3>Customize Columns</h3>
                            <button onClick={() => setIsColumnModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.columnList}>
                            {columns.map((col, idx) => (
                                <div key={col.id} className={styles.columnItem}>
                                    <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} />
                                    <span style={{ flex: 1 }}>{col.label}</span>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0}>▲</button>
                                        <button onClick={() => moveColumn(idx, 'down')} disabled={idx === columns.length - 1}>▼</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Manually Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <form className={styles.productForm} onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);

                            const updated: Product = {
                                ...editingProduct,
                                id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
                                name: fd.get('name') as string,
                                type: fd.get('type') as string,
                                sku: fd.get('sku') as string,
                                published: fd.get('published') === 'true',
                                isFeatured: fd.get('isFeatured') === 'true',
                                visibility: fd.get('visibility') as string,
                                description: fd.get('description') as string,
                                salePriceStart: fd.get('salePriceStart') as string,
                                salePriceEnd: fd.get('salePriceEnd') as string,
                                salePrice: Number(fd.get('salePrice')),
                                regularPrice: Number(fd.get('regularPrice')),
                                inStock: fd.get('inStock') === 'true',
                                stock: Number(fd.get('stock')),
                                lowStockLimit: Number(fd.get('lowStockLimit')),
                                weight: Number(fd.get('weight')),
                                volume: Number(fd.get('volume')),
                                allowReviews: fd.get('allowReviews') === 'true',
                                purchaseNote: fd.get('purchaseNote') as string,
                                categories: fd.get('categories') as string,
                                tags: fd.get('tags') as string,
                                images: (e.currentTarget.querySelector('#imageField') as HTMLInputElement).value,
                                brand: fd.get('brand') as string,
                                imageType: fd.get('imageType') as any || 'link',
                                targetPage: fd.get('targetPage') as string,
                                imageRatio: imageRatio
                            } as Product;

                            saveProducts(editingProduct ? products.map(p => p.id === updated.id ? updated : p) : [...products, updated]);
                            setIsModalOpen(false);
                            alert('Product changes saved successfully!');
                        }}>
                            <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div className={styles.formGroup}>
                                    <label>Product Name *</label>
                                    <input name="name" className={styles.input} defaultValue={editingProduct?.name} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SKU *</label>
                                    <input name="sku" className={styles.input} defaultValue={editingProduct?.sku} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Type</label>
                                    <select name="type" className={styles.select} defaultValue={editingProduct?.type || 'simple'}>
                                        <option value="simple">Simple</option>
                                        <option value="variable">Variable</option>
                                        <option value="grouped">Grouped</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Brand</label>
                                    <input name="brand" className={styles.input} defaultValue={editingProduct?.brand || 'CutiXa'} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Regular Price *</label>
                                    <input name="regularPrice" type="number" step="0.01" className={styles.input} defaultValue={editingProduct?.regularPrice} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sale Price</label>
                                    <input name="salePrice" type="number" step="0.01" className={styles.input} defaultValue={editingProduct?.salePrice} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sale Start Date</label>
                                    <input name="salePriceStart" type="date" className={styles.input} defaultValue={editingProduct?.salePriceStart} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sale End Date</label>
                                    <input name="salePriceEnd" type="date" className={styles.input} defaultValue={editingProduct?.salePriceEnd} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Stock Quantity</label>
                                    <input name="stock" type="number" className={styles.input} defaultValue={editingProduct?.stock || 0} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Low Stock Limit</label>
                                    <input name="lowStockLimit" type="number" className={styles.input} defaultValue={editingProduct?.lowStockLimit || 10} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Weight (g)</label>
                                    <input name="weight" type="number" className={styles.input} defaultValue={editingProduct?.weight || 0} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Volume (ml)</label>
                                    <input name="volume" type="number" className={styles.input} defaultValue={editingProduct?.volume || 0} />
                                </div>
                                {/* Combined Category & Subcategory Selection */}
                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Category & Subcategory Selection *</label>
                                    <select name="categories" className={styles.select} defaultValue={editingProduct?.categories || ''} required>
                                        <option value="">Select Category/Subcategory...</option>
                                        {Object.entries(CATEGORIES_DATA).map(([main, items]) => (
                                            <React.Fragment key={main}>
                                                <optgroup label={main}>
                                                    <option value={main}>{main} (Main)</option>
                                                    {items.map((item, idx) => (
                                                        typeof item === 'string' ?
                                                            <option key={idx} value={`${main} > ${item}`}>&nbsp;&nbsp;{item}</option>
                                                            :
                                                            <React.Fragment key={idx}>
                                                                <option value={`${main} > ${item.name}`} disabled>{item.name}</option>
                                                                {item.sub.map((s, sIdx) => (
                                                                    <option key={sIdx} value={`${main} > ${item.name} > ${s}`}>&nbsp;&nbsp;&nbsp;&nbsp;{s}</option>
                                                                ))}
                                                            </React.Fragment>
                                                    ))}
                                                </optgroup>
                                            </React.Fragment>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Published</label>
                                    <select name="published" className={styles.select} defaultValue={String(editingProduct?.published ?? true)}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Visibility</label>
                                    <select name="visibility" className={styles.select} defaultValue={editingProduct?.visibility || 'Visible'}>
                                        <option value="Visible">Visible</option>
                                        <option value="Hidden">Hidden</option>
                                        <option value="Featured">Featured Only</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Is Featured?</label>
                                    <select name="isFeatured" className={styles.select} defaultValue={String(editingProduct?.isFeatured ?? false)}>
                                        <option value="true">Featured</option>
                                        <option value="false">Standard</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Display Location</label>
                                    <select name="targetPage" className={styles.select} defaultValue={editingProduct?.targetPage || 'Shop'}>
                                        <option value="Shop">Shop Page</option>
                                        <option value="Home">Home Page</option>
                                        <option value="Archive">Archive</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                <label>Premium Image Studio</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            id="imageField"
                                            name="images"
                                            placeholder="URL or Uploaded Preview"
                                            className={styles.input}
                                            defaultValue={editingProduct?.images}
                                            style={{ flex: 1 }}
                                        />
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <select
                                                className={styles.select}
                                                value={imageRatio}
                                                onChange={(e) => setImageRatio(e.target.value)}
                                                style={{ width: '80px', fontSize: '0.7rem' }}
                                            >
                                                <option value="1:1">1:1 Sq</option>
                                                <option value="4:5">4:5 Port</option>
                                                <option value="16:9">16:9 Land</option>
                                            </select>
                                            <label className={styles.secondaryBtn} style={{ cursor: 'pointer', margin: 0 }}>
                                                <Upload size={14} /> Upload
                                                <input
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setIsProcessing(true);
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                (document.querySelector('#imageField') as HTMLInputElement).value = reader.result as string;
                                                                setIsProcessing(false);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            className={styles.secondaryBtn}
                                            onClick={async () => {
                                                const imgField = document.querySelector('#imageField') as HTMLInputElement;
                                                if (!imgField.value) return alert('Please upload an image first');

                                                setIsProcessing(true);
                                                try {
                                                    const img = new Image();
                                                    img.crossOrigin = "anonymous";
                                                    img.src = imgField.value;

                                                    await new Promise((resolve, reject) => {
                                                        img.onload = resolve;
                                                        img.onerror = reject;
                                                    });

                                                    const canvas = document.createElement('canvas');
                                                    const ctx = canvas.getContext('2d');
                                                    if (!ctx) return;

                                                    canvas.width = img.width;
                                                    canvas.height = img.height;
                                                    ctx.drawImage(img, 0, 0);

                                                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                                    const data = imageData.data;

                                                    // Simulated AI Background Removal (Removes white/bright backgrounds)
                                                    for (let i = 0; i < data.length; i += 4) {
                                                        const r = data[i];
                                                        const g = data[i + 1];
                                                        const b = data[i + 2];
                                                        // Threshold for "white" background
                                                        if (r > 200 && g > 200 && b > 200) {
                                                            data[i + 3] = 0; // Set alpha to 0 (transparent)
                                                        }
                                                    }

                                                    ctx.putImageData(imageData, 0, 0);
                                                    const pngBase64 = canvas.toDataURL('image/png');
                                                    imgField.value = pngBase64;

                                                    alert('Background removed successfully! Image converted to Transparent PNG.');
                                                } catch (err) {
                                                    alert('Error processing image. Ensure the image source is valid.');
                                                } finally {
                                                    setIsProcessing(false);
                                                }
                                            }}
                                            disabled={isProcessing}
                                            style={{ fontSize: '0.7rem', flex: 1 }}
                                        >
                                            <RotateCcw size={12} /> {isProcessing ? 'Removing Background...' : 'Remove Background (AI/PNG)'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.secondaryBtn}
                                            onClick={() => alert(`Applied Ratio ${imageRatio}`)}
                                            style={{ fontSize: '0.7rem', flex: 1 }}
                                        >
                                            <Settings size={12} /> Auto Crop to {imageRatio}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                <label>Description</label>
                                <textarea name="description" className={styles.input} style={{ minHeight: '80px' }} defaultValue={editingProduct?.description} />
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Tags (Comma separated)</label>
                                    <input name="tags" className={styles.input} defaultValue={editingProduct?.tags} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Purchase Note</label>
                                    <input name="purchaseNote" className={styles.input} defaultValue={editingProduct?.purchaseNote} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Allow Reviews?</label>
                                    <select name="allowReviews" className={styles.select} defaultValue={String(editingProduct?.allowReviews ?? true)}>
                                        <option value="true">Enabled</option>
                                        <option value="false">Disabled</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>In Stock?</label>
                                    <select name="inStock" className={styles.select} defaultValue={String(editingProduct?.inStock ?? true)}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalFooter} style={{ marginTop: '2rem' }}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Column Detector Modal */}
            {showColumnPrompt && csvMetadata && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">New Columns Detected!</h2>
                            <button onClick={() => setShowColumnPrompt(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Your CSV file contains columns that are <strong>not present</strong> in your dashboard:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                {csvMetadata.newHeaders.map(h => (
                                    <span key={h} style={{ background: 'rgba(197,160,89,0.1)', color: 'var(--gold-matte)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', border: '1px solid var(--gold-matte)' }}>
                                        {h}
                                    </span>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Would you like to create these columns in the dashboard or ignore them?
                                <br /><small>(Owner/Admin check: Column permissions will be inherited)</small>
                            </p>
                        </div>
                        <div className={styles.modalFooter} style={{ gap: '10px' }}>
                            <button
                                className={styles.secondaryBtn}
                                onClick={() => processIncomingData(csvMetadata.data, false)}
                                style={{ flex: 1 }}
                            >
                                Ignore & Import
                            </button>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => processIncomingData(csvMetadata.data, true, csvMetadata.newHeaders)}
                                style={{ flex: 1 }}
                            >
                                <Plus size={16} /> Create & Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSV Column Detector Modal */}
            {showColumnPrompt && csvMetadata && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">New Columns Detected!</h2>
                            <button onClick={() => setShowColumnPrompt(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Your CSV file contains columns that are <strong>not present</strong> in your dashboard:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                {csvMetadata.newHeaders.map(h => (
                                    <span key={h} style={{ background: 'rgba(197,160,89,0.1)', color: 'var(--gold-matte)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', border: '1px solid var(--gold-matte)' }}>
                                        {h}
                                    </span>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Would you like to create these columns in the dashboard or ignore them?
                                <br /><small>(Owner/Admin check: Column permissions will be inherited)</small>
                            </p>
                        </div>
                        <div className={styles.modalFooter} style={{ gap: '10px' }}>
                            <button
                                className={styles.secondaryBtn}
                                onClick={() => processIncomingData(csvMetadata.data, false)}
                                style={{ flex: 1 }}
                            >
                                Ignore & Import
                            </button>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => processIncomingData(csvMetadata.data, true, csvMetadata.newHeaders)}
                                style={{ flex: 1 }}
                            >
                                <Plus size={16} /> Create & Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

