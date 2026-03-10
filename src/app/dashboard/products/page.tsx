'use client';

import React, { useState, useRef } from 'react';
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
    ChevronRight
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
    saleStart: string;
    saleEnd: string;
    salePrice: number;
    regularPrice: number;
    inStock: boolean;
    stockCount: number;
    lowStockAlert: number;
    weight: number;
    volume: number;
    allowReviews: boolean;
    purchaseNote: string;
    categories: string;
    images: string;
    brands: string;
}

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            type: 'Simple',
            sku: 'CX-RAD-001',
            name: 'Radiance Serum',
            published: true,
            isFeatured: true,
            visibility: 'Visible',
            description: 'Glow like never before.',
            saleStart: '',
            saleEnd: '',
            salePrice: 40,
            regularPrice: 45,
            inStock: true,
            stockCount: 150,
            lowStockAlert: 10,
            weight: 50,
            volume: 30,
            allowReviews: true,
            purchaseNote: 'Thank you for choosing CutiXa!',
            categories: 'Beauty, Serum',
            images: 'serum.jpg',
            brands: 'CutiXa Adore'
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const importedProducts = results.data as Product[];
                    setProducts([...products, ...importedProducts]);
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const updatedProduct: Product = {
            id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
            name: formData.get('name') as string,
            sku: formData.get('sku') as string,
            type: formData.get('type') as string,
            brands: formData.get('brands') as string,
            regularPrice: Number(formData.get('regularPrice')),
            salePrice: Number(formData.get('salePrice')),
            stockCount: Number(formData.get('stockCount')),
            lowStockAlert: Number(formData.get('lowStockAlert')),
            weight: Number(formData.get('weight')),
            volume: Number(formData.get('volume')),
            allowReviews: formData.get('allowReviews') === 'true',
            isFeatured: formData.get('isFeatured') === 'true',
            description: formData.get('description') as string,
            published: true,
            visibility: 'Visible',
            saleStart: '',
            saleEnd: '',
            inStock: Number(formData.get('stockCount')) > 0,
            purchaseNote: '',
            categories: 'General',
            images: ''
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        } else {
            setProducts([...products, updatedProduct]);
        }

        setIsModalOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className={styles.productPanel}>
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products, SKU, categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={() => fileInputRef.current?.click()}>
                        <Download size={18} /> Import CSV
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleImportCSV}
                    />
                    <button className={styles.secondaryBtn} onClick={handleExportCSV}>
                        <Upload size={18} /> Export CSV
                    </button>
                    <button className={styles.primaryBtn} onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
                        <Plus size={18} /> Add Manually
                    </button>
                </div>
            </div>

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className={styles.productRow}>
                                <td>{product.id}</td>
                                <td><span className={styles.skuTag}>{product.sku}</span></td>
                                <td>{product.name}</td>
                                <td>PKR {product.regularPrice}</td>
                                <td>{product.stockCount}</td>
                                <td>
                                    <div className={styles.rowActions}>
                                        <button className={styles.editBtn} onClick={() => handleEdit(product)}><Edit size={16} /></button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`}>
                        <div className={styles.modalHeader}>
                            <h2 className="brand-name">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>

                        <form className={styles.productForm} onSubmit={handleSave}>
                            <div className={styles.formSection}>
                                <h3>Basic Information</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Product Name</label>
                                        <input name="name" type="text" className={styles.input} defaultValue={editingProduct?.name} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>SKU</label>
                                        <input name="sku" type="text" className={styles.input} defaultValue={editingProduct?.sku} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Product Type</label>
                                        <select name="type" className={styles.select} defaultValue={editingProduct?.type}>
                                            <option>Simple Product</option>
                                            <option>Variable Product</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Brands</label>
                                        <input name="brands" type="text" className={styles.input} defaultValue={editingProduct?.brands} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Regular Price (PKR)</label>
                                    <input name="regularPrice" type="number" className={styles.input} defaultValue={editingProduct?.regularPrice} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sale Price (PKR)</label>
                                    <input name="salePrice" type="number" className={styles.input} defaultValue={editingProduct?.salePrice} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Stock Quantity</label>
                                    <input name="stockCount" type="number" className={styles.input} defaultValue={editingProduct?.stockCount} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Low Stock Alert</label>
                                    <input name="lowStockAlert" type="number" className={styles.input} defaultValue={editingProduct?.lowStockAlert} />
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Weight (g)</label>
                                    <input name="weight" type="number" className={styles.input} defaultValue={editingProduct?.weight} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Volume (ml)</label>
                                    <input name="volume" type="number" className={styles.input} defaultValue={editingProduct?.volume} />
                                </div>
                            </div>

                            <div className={styles.formGroup + " " + styles.fullRow}>
                                <label>Description</label>
                                <textarea name="description" className={styles.textarea} rows={4} defaultValue={editingProduct?.description}></textarea>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

