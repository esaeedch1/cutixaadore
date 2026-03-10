'use client';

import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    CheckCircle2,
    Settings,
    Layout,
    Layers,
    Save,
    Info,
    Trash2
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface PageItem {
    id: string;
    name: string;
    type: 'Page' | 'Category';
    isVisible: boolean;
    lastModified: string;
}

export default function PageManagement() {
    const [items, setItems] = useState<PageItem[]>([
        { id: 'p1', name: 'Home Landing', type: 'Page', isVisible: true, lastModified: '2026-03-01' },
        { id: 'p2', name: 'Shop / Store', type: 'Page', isVisible: true, lastModified: '2026-03-01' },
        { id: 'c1', name: 'Mens', type: 'Category', isVisible: true, lastModified: '2026-03-02' },
        { id: 'c2', name: 'Women', type: 'Category', isVisible: true, lastModified: '2026-03-02' },
        { id: 'c3', name: 'Fragrances', type: 'Category', isVisible: true, lastModified: '2026-03-03' },
        { id: 'c4', name: 'Beauty & Self Care', type: 'Category', isVisible: true, lastModified: '2026-03-03' },
        { id: 'c5', name: 'Special Offers', type: 'Category', isVisible: true, lastModified: '2026-03-03' },
        { id: 'p3', name: 'Contact Us', type: 'Page', isVisible: true, lastModified: '2026-02-28' },
    ]);

    const [newItemName, setNewItemName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'Page' | 'Category'>('Page');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName) return;
        const newItem: PageItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            type: addType,
            isVisible: true,
            lastModified: new Date().toISOString().split('T')[0]
        };
        setItems([...items, newItem]);
        setNewItemName('');
        setShowAddModal(false);
    };

    const removeItem = (id: string) => {
        if (confirm('Are you sure you want to remove this?')) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const toggleVisibility = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isVisible: !item.isVisible, lastModified: new Date().toISOString().split('T')[0] } : item
        ));
    };

    return (
        <div className={styles.pagePanel}>
            <div className={styles.controls}>
                <div className={styles.alertBox}>
                    <Info size={18} />
                    <span>Hiding a category will remove it from the customer navigation and shop filters.</span>
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={() => { setAddType('Page'); setShowAddModal(true); }}>
                        <Layout size={18} /> Add Page
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => { setAddType('Category'); setShowAddModal(true); }}>
                        <Layers size={18} /> Add Category
                    </button>
                    <button className={styles.primaryBtn}><Save size={18} /> Save Config</button>
                </div>
            </div>

            <div className={styles.grid2} style={{ marginTop: '2rem' }}>
                {/* Page Visibility */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Layout size={20} className={styles.statIcon} />
                            <h3>Main Pages</h3>
                        </div>
                    </div>
                    <div className={styles.configList}>
                        {items.filter(i => i.type === 'Page').map(item => (
                            <div key={item.id} className={styles.configItem}>
                                <div className={styles.configInfo}>
                                    <p className={styles.configName}>{item.name}</p>
                                    <span className={styles.configDate}>Last sync: {item.lastModified}</span>
                                </div>
                                <div className={styles.itemRowActions}>
                                    <button onClick={() => toggleVisibility(item.id)} className={item.isVisible ? styles.visibleBtn : styles.hiddenBtn}>
                                        {item.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => removeItem(item.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Visibility */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Layers size={20} className={styles.statIcon} />
                            <h3>Shop Categories</h3>
                        </div>
                    </div>
                    <div className={styles.configList}>
                        {items.filter(i => i.type === 'Category').map(item => (
                            <div key={item.id} className={styles.configItem}>
                                <div className={styles.configInfo}>
                                    <p className={styles.configName}>{item.name}</p>
                                    <span className={styles.configDate}>Last sync: {item.lastModified}</span>
                                </div>
                                <div className={styles.itemRowActions}>
                                    <button onClick={() => toggleVisibility(item.id)} className={item.isVisible ? styles.visibleBtn : styles.hiddenBtn}>
                                        {item.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => removeItem(item.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '400px' }}>
                        <h3>Add {addType}</h3>
                        <form onSubmit={handleAddItem} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>{addType} Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    placeholder={`e.g. New ${addType}`}
                                    required
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
