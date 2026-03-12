'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'dark', label: 'Dark', icon: <Moon size={15} /> },
        { id: 'dark-grey', label: 'Dark Grey', icon: <Moon size={15} color="var(--text-secondary)" /> },
        { id: 'light', label: 'Light', icon: <Sun size={15} /> },
        { id: 'light-grey', label: 'Light Grey', icon: <Monitor size={15} /> },
    ] as const;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50px',
            padding: '3px',
            gap: '2px',
        }}>
            {themes.map((t) => (
                <button
                    key={t.id}
                    title={t.label}
                    onClick={() => setTheme(t.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        background: theme === t.id
                            ? 'var(--gold-matte)'
                            : 'transparent',
                        color: theme === t.id ? '#fff' : 'var(--text-secondary)',
                    }}
                >
                    {t.icon}
                    <span>{t.label}</span>
                </button>
            ))}
        </div>
    );
}
