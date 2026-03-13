'use client';

import React, { useState, useEffect } from 'react';
import {
    Eye,
    EyeOff,
    CheckCircle2,
    Settings,
    Layout,
    Layers,
    Save,
    Info,
    Trash2,
    Edit3,
    Type
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface CategoryItem {
    id: string;
    name: string;
    isVisible: boolean;
    subcategories: CategoryItem[];
}

interface PageItem {
    id: string;
    name: string;
    type: 'Page' | 'Category';
    isVisible: boolean;
    lastModified: string;
}

export default function PageManagement() {
    const [items, setItems] = useState<PageItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Page Content Editor States
    const [editingPage, setEditingPage] = useState<PageItem | null>(null);
    const [pageContent, setPageContent] = useState('');
    const [isUrduMode, setIsUrduMode] = useState(false);

    const [showSubModal, setShowSubModal] = useState<string | null>(null);
    const [subName, setSubName] = useState('');
    const [showMapModal, setShowMapModal] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'Page' | 'Category'>('Page');

    const [selectedFonts, setSelectedFonts] = useState({
        logo: 'Monotype Corsiva',
        header: 'Inter',
        body: 'Inter'
    });

    const MS_WORD_FONTS = [
        { name: 'Monotype Corsiva', family: '"Monotype Corsiva", "Apple Chancery", cursive' },
        { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
        { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
        { name: 'Calibri', family: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
        { name: 'Garamond', family: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
        { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
        { name: 'Playfair Display', family: '"Playfair Display", serif' },
        { name: 'Great Vibes', family: '"Great Vibes", cursive' },
        { name: 'Cinzel Decorative', family: '"Cinzel Decorative", serif' },
        { name: 'Jameel Noori', family: '"Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif' },
        { name: 'Traditional Arabic', family: '"Traditional Arabic", "Adobe Arabic", serif' }
    ];

    const LAYOUTS = [
        { id: 'grid-classic', name: 'Classic Grid', icon: Layout },
        { id: 'masonry', name: 'Modern Masonry', icon: Layers },
        { id: 'list-detail', name: 'List & Detail', icon: Eye }
    ];
    const [activeLayout, setActiveLayout] = useState('grid-classic');

    useEffect(() => {
        const savedPages = localStorage.getItem('cutixa_pages');
        if (savedPages) setItems(JSON.parse(savedPages));
        else {
            const initial = [
                { id: 'p1', name: 'Home Landing', type: 'Page', isVisible: true, lastModified: '2026-03-01' },
                { id: 'p2', name: 'Shop / Store', type: 'Page', isVisible: true, lastModified: '2026-03-01' },
                { id: 'p3', name: 'Contact Us', type: 'Page', isVisible: true, lastModified: '2026-02-28' },
            ];
            setItems(initial as PageItem[]);
            localStorage.setItem('cutixa_pages', JSON.stringify(initial));
        }

        const savedCats = localStorage.getItem('cutixa_categories');
        if (savedCats) setCategories(JSON.parse(savedCats));
        else {
            const initialCats: CategoryItem[] = [
                {
                    id: 'cat_men',
                    name: 'Men',
                    isVisible: true,
                    subcategories: [
                        { id: 'men_pents', name: 'Pents', isVisible: true, subcategories: [] },
                        { id: 'men_shirts', name: 'Shirts', isVisible: true, subcategories: [] },
                        { id: 'men_kurta', name: 'Kurta', isVisible: true, subcategories: [] },
                        { id: 'men_stiched', name: 'Stiched', isVisible: true, subcategories: [] },
                        { id: 'men_unstiched', name: 'Unstiched', isVisible: true, subcategories: [] },
                        { id: 'men_sox', name: 'Sox', isVisible: true, subcategories: [] },
                        { id: 'men_belts', name: 'Belts', isVisible: true, subcategories: [] },
                        { id: 'men_wallets', name: 'Wallets', isVisible: true, subcategories: [] },
                        { id: 'men_watches', name: 'Watches', isVisible: true, subcategories: [] },
                        { id: 'men_rings', name: 'Rings', isVisible: true, subcategories: [] },
                        { id: 'men_caps', name: 'Caps', isVisible: true, subcategories: [] }
                    ]
                },
                {
                    id: 'cat_women',
                    name: 'Women',
                    isVisible: true,
                    subcategories: [
                        { id: 'women_pents', name: 'Pents', isVisible: true, subcategories: [] },
                        { id: 'women_shirts', name: 'Shirts', isVisible: true, subcategories: [] },
                        { id: 'women_ladies_clothing', name: 'Ladies Clothing (Stiched, Unstiched)', isVisible: true, subcategories: [] },
                        { id: 'women_kurta', name: 'Kurta', isVisible: true, subcategories: [] },
                        { id: 'women_sox', name: 'Sox', isVisible: true, subcategories: [] },
                        { id: 'women_belts', name: 'Belts', isVisible: true, subcategories: [] },
                        { id: 'women_wallets', name: 'Wallets/ Purses/ Clutch', isVisible: true, subcategories: [] },
                        { id: 'women_watches', name: 'Watches', isVisible: true, subcategories: [] },
                        { id: 'women_caps', name: 'Caps', isVisible: true, subcategories: [] },
                        { id: 'women_jewellery', name: 'Jewellery (Ear Rings, Nose Pins, Rings, Necklace)', isVisible: true, subcategories: [] }
                    ]
                },
                {
                    id: 'cat_beauty',
                    name: 'Beauty and Personal Care',
                    isVisible: true,
                    subcategories: [
                        { id: 'beauty_extracts', name: 'Extracts (Glycerites, Oleolites)', isVisible: true, subcategories: [] },
                        { id: 'beauty_skincare', name: 'Skin Care', isVisible: true, subcategories: [] },
                        { id: 'beauty_creams', name: 'Beauty Creams and Soaps', isVisible: true, subcategories: [] },
                        { id: 'beauty_haircare', name: 'Hair Care', isVisible: true, subcategories: [] }
                    ]
                }
            ];
            setCategories(initialCats);
            localStorage.setItem('cutixa_categories', JSON.stringify(initialCats));
        }

        const savedFonts = localStorage.getItem('cutixa_brand_fonts');
        if (savedFonts) {
            const parsed = JSON.parse(savedFonts);
            setSelectedFonts(parsed);
            Object.entries(parsed).forEach(([key, val]: [string, any]) => {
                const fontObj = MS_WORD_FONTS.find(f => f.name === val);
                if (fontObj) document.documentElement.style.setProperty(`--font-${key}`, fontObj.family);
            });
        }

        const savedLayout = localStorage.getItem('cutixa_shop_layout');
        if (savedLayout) setActiveLayout(savedLayout);
    }, []);

    const changeFont = (type: 'logo' | 'header' | 'body', fontName: string) => {
        const fontObj = MS_WORD_FONTS.find(f => f.name === fontName);
        if (fontObj) {
            const newFonts = { ...selectedFonts, [type]: fontName };
            setSelectedFonts(newFonts);
            document.documentElement.style.setProperty(`--font-${type}`, fontObj.family);
            localStorage.setItem('cutixa_brand_fonts', JSON.stringify(newFonts));
        }
    };

    const changeLayout = (layoutId: string) => {
        setActiveLayout(layoutId);
        localStorage.setItem('cutixa_shop_layout', layoutId);
        alert(`Shop Layout updated to: ${layoutId}`);
    };

    const saveAll = (newPages: PageItem[], newCats: any[]) => {
        setItems(newPages);
        setCategories(newCats);
        localStorage.setItem('cutixa_pages', JSON.stringify(newPages));
        localStorage.setItem('cutixa_categories', JSON.stringify(newCats));
        window.dispatchEvent(new Event('storage'));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName) return;
        if (addType === 'Category') {
            const newCat = {
                id: Math.random().toString(36).substr(2, 9),
                name: newItemName,
                isVisible: true,
                mappedPages: ['p2'],
                subcategories: []
            };
            saveAll(items, [...categories, newCat]);
        } else {
            const newItem: PageItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: newItemName,
                type: 'Page',
                isVisible: true,
                lastModified: new Date().toISOString().split('T')[0]
            };
            saveAll([...items, newItem], categories);
        }
        setNewItemName('');
        setShowAddModal(false);
    };

    const removeItem = (id: string) => {
        if (confirm('Are you sure you want to remove this?')) {
            saveAll(items.filter(item => item.id !== id), categories);
        }
    };

    const removeCategory = (id: string) => {
        if (confirm('Are you sure you want to remove this category?')) {
            saveAll(items, categories.filter(c => c.id !== id));
        }
    };

    const toggleVisibility = (id: string) => {
        const newPages = items.map(item =>
            item.id === id ? { ...item, isVisible: !item.isVisible, lastModified: new Date().toISOString().split('T')[0] } : item
        );
        saveAll(newPages, categories);
    };

    const findAndToggleVisibility = (list: CategoryItem[], id: string): CategoryItem[] => {
        return list.map(item => {
            if (item.id === id) return { ...item, isVisible: !item.isVisible };
            if (item.subcategories.length > 0) {
                return { ...item, subcategories: findAndToggleVisibility(item.subcategories, id) };
            }
            return item;
        });
    };

    const toggleCategoryVisibility = (id: string) => {
        saveAll(items, findAndToggleVisibility(categories, id));
    };

    const findAndAddSub = (list: CategoryItem[], parentId: string, newSub: CategoryItem): CategoryItem[] => {
        return list.map(item => {
            if (item.id === parentId) return { ...item, subcategories: [...item.subcategories, newSub] };
            if (item.subcategories.length > 0) {
                return { ...item, subcategories: findAndAddSub(item.subcategories, parentId, newSub) };
            }
            return item;
        });
    };

    const addSubcategory = (parentId: string) => {
        const name = prompt('Enter subcategory name:');
        if (name) {
            const newSub: CategoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                isVisible: true,
                subcategories: []
            };
            saveAll(items, findAndAddSub(categories, parentId, newSub));
        }
    };

    const findAndRemove = (list: CategoryItem[], id: string): CategoryItem[] => {
        return list.filter(item => item.id !== id).map(item => ({
            ...item,
            subcategories: findAndRemove(item.subcategories, id)
        }));
    };

    const removeCategoryItem = (id: string) => {
        if (confirm('Are you sure you want to remove this category?')) {
            saveAll(items, findAndRemove(categories, id));
        }
    };

    const CategoryTree = ({ list, depth = 0 }: { list: CategoryItem[], depth?: number }) => {
        return (
            <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, display: 'grid', gap: '5px', marginTop: depth > 0 ? '5px' : 0 }}>
                {list.map(cat => (
                    <div key={cat.id} className={styles.categoryGroup} style={{
                        marginBottom: depth === 0 ? '1rem' : 0,
                        paddingBottom: depth === 0 ? '1rem' : 0,
                        borderBottom: depth === 0 ? '1px solid var(--border)' : 'none'
                    }}>
                        <div className={styles.configItem} style={{
                            padding: depth > 0 ? '4px 8px' : '8px 12px',
                            background: depth > 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                            border: depth > 0 ? 'none' : '1px solid var(--border)'
                        }}>
                            <div className={styles.configInfo}>
                                <p className={styles.configName} style={{
                                    fontWeight: depth === 0 ? 700 : 400,
                                    color: depth === 0 ? 'var(--gold-matte)' : 'var(--text-primary)',
                                    fontSize: depth === 0 ? '1rem' : '0.85rem'
                                }}>{cat.name}</p>
                            </div>
                            <div className={styles.itemRowActions}>
                                <button
                                    onClick={() => addSubcategory(cat.id)}
                                    className={styles.secondaryBtn}
                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                    title="Add Sub-subcategory"
                                >
                                    + Sub
                                </button>
                                <button onClick={() => toggleCategoryVisibility(cat.id)} className={cat.isVisible ? styles.visibleBtn : styles.hiddenBtn}>
                                    {cat.isVisible ? <Eye size={depth === 0 ? 18 : 14} /> : <EyeOff size={depth === 0 ? 18 : 14} />}
                                </button>
                                <button onClick={() => removeCategoryItem(cat.id)} className={styles.deleteBtn}>
                                    <Trash2 size={depth === 0 ? 16 : 12} />
                                </button>
                            </div>
                        </div>
                        {cat.subcategories.length > 0 && (
                            <CategoryTree list={cat.subcategories} depth={depth + 1} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const openEditor = (page: PageItem) => {
        setEditingPage(page);
        setPageContent(localStorage.getItem(`page_content_${page.id}`) || `Welcome to ${page.name} content editor...`);
    };

    return (
        <div className={styles.pagePanel}>
            <div className={styles.controls}>
                <div className={styles.alertBox}>
                    <Info size={18} />
                    <span>Manage your website architecture and content directly from here.</span>
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
                                    <button onClick={() => openEditor(item)} className={styles.editBtn} title="Edit Page Layout">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => removeItem(item.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Layers size={20} className={styles.statIcon} />
                            <h3>Shop Categories</h3>
                        </div>
                    </div>
                    <div className={styles.configList}>
                        <CategoryTree list={categories} />
                    </div>
                </div>
            </div>

            {/* Page Editor Modal */}
            {editingPage && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className={styles.modalHeader}>
                            <h3 className="brand-name">Visual Editor: {editingPage.name}</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={`${styles.secondaryBtn} ${isUrduMode ? styles.activeTab : ''}`}
                                    onClick={() => setIsUrduMode(!isUrduMode)}
                                >
                                    <Type size={16} /> {isUrduMode ? 'Switch English' : 'Urdu Mode'}
                                </button>
                                <button onClick={() => setEditingPage(null)} className={styles.closeBtn}>×</button>
                            </div>
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                            <label>Draft Content (Elementor Style Text Editor)</label>
                            <textarea
                                className={`${styles.input} ${isUrduMode ? 'urdu-text' : ''}`}
                                style={{ minHeight: '350px', padding: '1.5rem', fontSize: isUrduMode ? '1.5rem' : '1rem' }}
                                value={pageContent}
                                onChange={(e) => setPageContent(e.target.value)}
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryBtn} onClick={() => setEditingPage(null)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={() => {
                                localStorage.setItem(`page_content_${editingPage.id}`, pageContent);
                                setEditingPage(null);
                                alert('Page content updated successfully!');
                            }}>
                                <Save size={18} /> Update Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mapping Modal */}
            {showMapModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass`} style={{ maxWidth: '400px' }}>
                        <h4>Map Category to Pages</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                            {items.map(p => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={categories.find(c => c.id === showMapModal)?.mappedPages.includes(p.id)}
                                        onChange={(e) => {
                                            const cat = categories.find(c => c.id === showMapModal);
                                            const newPages = e.target.checked
                                                ? [...cat.mappedPages, p.id]
                                                : cat.mappedPages.filter((id: string) => id !== p.id);
                                            const newCats = categories.map(c => c.id === showMapModal ? { ...c, mappedPages: newPages } : c);
                                            saveAll(items, newCats);
                                        }}
                                    /> {p.name}
                                </label>
                            ))}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.primaryBtn} onClick={() => setShowMapModal(null)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Branding & Layout Controls */}
            <div className={styles.grid2} style={{ marginTop: '2rem' }}>
                {/* Font Customizer */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Type size={20} className={styles.statIcon} />
                            <h3>Global Typography</h3>
                        </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        {(['logo', 'header', 'body'] as const).map(type => (
                            <div key={type} className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                <label style={{ textTransform: 'capitalize' }}>{type} Font Style</label>
                                <select
                                    className={styles.select}
                                    value={selectedFonts[type]}
                                    onChange={(e) => changeFont(type, e.target.value)}
                                >
                                    {MS_WORD_FONTS.map(f => (
                                        <option key={f.name} value={f.name}>{f.name}</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.9rem', marginTop: '5px', fontFamily: MS_WORD_FONTS.find(f => f.name === selectedFonts[type])?.family }}>
                                    Sample: The quick brown fox jumps over the lazy dog.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Page Layout Selector */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Layout size={20} className={styles.statIcon} />
                            <h3>Shop Page Layouts</h3>
                        </div>
                    </div>
                    <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
                        {LAYOUTS.map(layout => {
                            const LayoutIcon = layout.icon;
                            return (
                                <button
                                    key={layout.id}
                                    onClick={() => changeLayout(layout.id)}
                                    className={styles.configItem}
                                    style={{
                                        border: activeLayout === layout.id ? '1px solid var(--gold-shining)' : '1px solid var(--border)',
                                        background: activeLayout === layout.id ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ padding: '10px', background: 'var(--surface)', borderRadius: '8px' }}>
                                            <LayoutIcon size={24} color={activeLayout === layout.id ? 'var(--gold-matte)' : 'var(--text-secondary)'} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{layout.name}</p>
                                            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.6 }}>Optimize for conversion and user experience.</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
