'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    FileText,
    Share2,
    Video,
    Globe,
    Warehouse,
    ShoppingBag
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        const savedName = localStorage.getItem('userName');
        if (!savedRole && !pathname.includes('/login')) {
            router.push('/dashboard/login');
        }
        setRole(savedRole);
        setUserName(savedName);
    }, [pathname, router]);

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO', 'Salesman'] },
        { name: 'Products', href: '/dashboard/products', icon: Package, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO'] },
        { name: 'Inventory', href: '/dashboard/inventory', icon: Warehouse, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO'] },
        { name: 'Role Management', href: '/dashboard/roles', icon: Users, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'DEO', 'Salesman'] },
        { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, roles: ['Developer', 'Owner', 'Admin', 'Manager', 'Salesman'] },
        { name: 'Page Config', href: '/dashboard/pages', icon: Settings, roles: ['Developer', 'Owner', 'Admin'] },
        { name: 'Courses', href: '/dashboard/courses', icon: Video, roles: ['Developer', 'Owner', 'Admin', 'Manager'] },
        { name: 'Social Media', href: '/dashboard/social', icon: Share2, roles: ['Developer', 'Owner', 'Admin', 'Manager'] },
    ];

    const filteredNav = navItems.filter(item => role && item.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        router.push('/');
    };

    if (pathname === '/dashboard/login') return <>{children}</>;

    return (
        <div className={styles.dashboardWrapper}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed} glass`}>
                <div className={styles.sidebarHeader}>
                    <h2 className="brand-name">CutiXa Adore</h2>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={styles.toggleBtn}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isActive && isSidebarOpen && <ChevronRight size={16} className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        {isSidebarOpen && (
                            <div className={styles.userText}>
                                <p className={styles.userName}>{userName || 'Executive Portal'}</p>
                                <p className={styles.userRole}>{role}</p>
                            </div>
                        )}
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={`${styles.topHeader} glass`}>
                    <div className={styles.headerLeft}>
                        <h1>{navItems.find(n => n.href === pathname)?.name || 'Dashboard'}</h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.statusBadge}>{role} Access</div>
                    </div>
                </header>
                <div className={styles.scrollArea}>
                    {children}
                </div>
            </main>
        </div>
    );
}
