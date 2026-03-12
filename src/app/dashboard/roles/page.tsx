'use client';

import React, { useState } from 'react';
import {
    UserPlus,
    Shield,
    Trash2,
    Edit,
    Lock,
    CheckCircle2
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface UserRole {
    id: string;
    name: string;
    email: string;
    role: 'Developer' | 'Owner' | 'Admin' | 'Manager' | 'DEO' | 'Salesman';
    status: 'Active' | 'Pending' | 'Inactive';
}

const rolesHierarchy = [
    { id: 'Developer', name: 'Developer', permissions: ['System Root', 'Manage Owner', 'Core Access'] },
    { id: 'Owner', name: 'Owner', permissions: ['All Access', 'Role Management', 'System Settings'] },
    { id: 'Admin', name: 'Admin', permissions: ['All Access (except Owner Removal)', 'Product Mgmt', 'User Mgmt'] },
    { id: 'Manager', name: 'Manager', permissions: ['Product Management', 'Assigned Roles', 'Invoices'] },
    { id: 'DEO', name: 'DEO', permissions: ['Inventory Management', 'Product Entry'] },
    { id: 'Salesman', name: 'Salesman', permissions: ['Invoice Access Only'] },
];

const FEATURES = [
    'Product Management',
    'Inventory Controls',
    'Role Management',
    'Financial Reports',
    'Payment Settings',
    'Invoice Access'
];

type RoleKey = 'Developer' | 'Owner' | 'Admin' | 'Manager' | 'DEO' | 'Salesman';

export default function RoleManagement() {
    const [users, setUsers] = useState<UserRole[]>([]);
    const [permissions, setPermissions] = useState<Record<string, RoleKey[]>>({
        'Product Management': ['Owner', 'Admin', 'Manager', 'DEO'],
        'Inventory Controls': ['Owner', 'Admin', 'DEO'],
        'Role Management': ['Owner', 'Admin'],
        'Financial Reports': ['Owner', 'Admin'],
        'Payment Settings': ['Owner', 'Admin'],
        'Invoice Access': ['Owner', 'Admin', 'Manager', 'Salesman']
    });

    React.useEffect(() => {
        const savedPerms = localStorage.getItem('cutixa_permissions');
        if (savedPerms) setPermissions(JSON.parse(savedPerms));

        const loadUsers = () => {
            const saved = localStorage.getItem('cutixa_roles');
            if (saved) {
                setUsers(JSON.parse(saved));
            } else {
                const initial = [
                    { id: 'dev-1', name: 'Saeed Ahmad', email: 'esaeedch@gmail.com', role: 'Developer', status: 'Active' },
                    { id: '1', name: 'Super Owner', email: 'owner@cutixa.com', role: 'Owner', status: 'Active' },
                    { id: '2', name: 'Sarah Admin', email: 'admin@cutixa.com', role: 'Admin', status: 'Active' },
                    { id: '3', name: 'Mike Manager', email: 'mike@cutixa.com', role: 'Manager', status: 'Active' },
                    { id: '4', name: 'John Data', email: 'john@cutixa.com', role: 'DEO', status: 'Pending' },
                ];
                setUsers(initial as UserRole[]);
                localStorage.setItem('cutixa_roles', JSON.stringify(initial));
            }
        };

        loadUsers();
        window.addEventListener('storage', loadUsers);
        return () => window.removeEventListener('storage', loadUsers);
    }, []);

    const saveUsers = (newUsers: UserRole[]) => {
        setUsers(newUsers);
        localStorage.setItem('cutixa_roles', JSON.stringify(newUsers));
        window.dispatchEvent(new Event('storage'));
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRole | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const updatedUser: UserRole = {
            id: editingUser?.id || Math.random().toString(36).substr(2, 9),
            name: formData.get('userName') as string,
            email: formData.get('userEmail') as string,
            role: formData.get('userRole') as any,
            status: formData.get('userStatus') as any || 'Active',
        };

        if (editingUser) {
            saveUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        } else {
            saveUsers([...users, updatedUser]);
        }

        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Remove this staff member?')) {
            saveUsers(users.filter(u => u.id !== id));
        }
    };

    const handleEdit = (user: UserRole) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.rolePanel}>
            <div className={styles.statsGrid}>
                {rolesHierarchy.map(role => (
                    <div key={role.id} className={`${styles.statCard} glass`}>
                        <Shield size={20} className={styles.statIcon} />
                        <h4>{role.name}</h4>
                        <p>{users.filter(u => u.role === role.id).length} Users</p>
                    </div>
                ))}
            </div>

            <div className={styles.controls}>
                <h3>Staff Directory</h3>
                <button className={styles.primaryBtn} onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
                    <UserPlus size={18} /> Invite Staff member
                </button>
            </div>

            <div className={`${styles.tableContainer} glass`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={styles.productRow}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className={styles.statusBadge}>{user.role}</span></td>
                                <td>
                                    <span style={{ color: user.status === 'Active' ? '#22c55e' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.rowActions}>
                                        <button className={styles.editBtn} onClick={() => handleEdit(user)}><Edit size={16} /></button>
                                        {user.role !== 'Developer' && (
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                                        )}
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
                            <h2 className="brand-name">{editingUser ? 'Edit Staff member' : 'Invite Staff member'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <form className={styles.productForm} onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input name="userName" type="text" className={styles.input} defaultValue={editingUser?.name} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input name="userEmail" type="email" className={styles.input} defaultValue={editingUser?.email} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Assigned Role</label>
                                <select name="userRole" className={styles.select} defaultValue={editingUser?.role}>
                                    {rolesHierarchy.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            {editingUser && (
                                <div className={styles.formGroup}>
                                    <label>Account Status</label>
                                    <select name="userStatus" className={styles.select} defaultValue={editingUser?.status}>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.formSection} style={{ marginTop: '3rem' }}>
                <div className={styles.controls} style={{ marginBottom: '1rem' }}>
                    <h3>Dynamic Permission Matrix</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toggle checkboxes to grant/revoke access in real-time</p>
                </div>
                <div className={`${styles.tableContainer} glass`} style={{ background: 'var(--surface)' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                {rolesHierarchy.map(r => <th key={r.id}>{r.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map(feature => (
                                <tr key={feature}>
                                    <td>{feature}</td>
                                    {rolesHierarchy.map(role => (
                                        <td key={role.id} style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={permissions[feature]?.includes(role.id as RoleKey)}
                                                disabled={role.id === 'Owner' || role.id === 'Developer'} // Owner and Developer always have all access
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    const current = permissions[feature] || [];
                                                    const next = isChecked
                                                        ? [...current, role.id as RoleKey]
                                                        : current.filter(r => r !== role.id);

                                                    const updated = { ...permissions, [feature]: next };
                                                    setPermissions(updated);
                                                    localStorage.setItem('cutixa_permissions', JSON.stringify(updated));
                                                }}
                                                className={styles.checkbox}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
