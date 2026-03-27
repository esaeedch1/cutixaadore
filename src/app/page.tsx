'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, User, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';
import styles from './page.module.css';

const countries = [
  // Priority Countries
  { name: 'Pakistan', code: 'PK', currency: 'PKR' },
  { name: 'UAE', code: 'AE', currency: 'AED' },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR' },
  { name: 'Oman', code: 'OM', currency: 'OMR' },
  { name: 'Qatar', code: 'QA', currency: 'QAR' },
  { name: 'Kuwait', code: 'KW', currency: 'KWD' },
  { name: 'Bangladesh', code: 'BD', currency: 'BDT' },
  // Others
  { name: 'USA', code: 'US', currency: 'USD' },
  { name: 'UK', code: 'GB', currency: 'GBP' },
  { name: 'China', code: 'CN', currency: 'CNY' },
  { name: 'Sri Lanka', code: 'LK', currency: 'LKR' },
  { name: 'Nepal', code: 'NP', currency: 'NPR' },
  { name: 'Malaysia', code: 'MY', currency: 'MYR' },
  { name: 'Indonesia', code: 'ID', currency: 'IDR' },
];

export default function LandingPage() {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [selectedCurrency, setSelectedCurrency] = useState('PKR');
  const router = useRouter();

  React.useEffect(() => {
    // If we're on the .pk domain, automatically set Pakistan and redirect to shop
    if (typeof window !== 'undefined' && window.location.hostname.includes('cutixaadore.pk')) {
      localStorage.setItem('userCountry', 'Pakistan');
      localStorage.setItem('userCurrency', 'PKR');
      router.push('/shop');
    }
  }, [router]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    const country = countries.find(c => c.name === newVal);
    setSelectedCountry(newVal);
    if (country) {
      setSelectedCurrency(country.currency);

      // If Pakistan is selected, redirect to .pk domain in production
      if (newVal === 'Pakistan' && typeof window !== 'undefined' && !window.location.hostname.includes('cutixaadore.pk')) {
        localStorage.setItem('userCountry', 'Pakistan');
        localStorage.setItem('userCurrency', 'PKR');
        // Only redirect in production
        if (process.env.NODE_ENV === 'production') {
          window.location.href = `https://cutixaadore.pk/shop`;
        } else {
          router.push('/shop');
        }
        return;
      }
    }
  };

  const handleEnterShop = () => {
    localStorage.setItem('userCountry', selectedCountry);
    localStorage.setItem('userCurrency', selectedCurrency);

    // Check if Pakistan is selected and we're not already on the .pk domain
    if (selectedCountry === 'Pakistan' && typeof window !== 'undefined' && !window.location.hostname.includes('cutixaadore.pk')) {
      if (process.env.NODE_ENV === 'production') {
        window.location.href = `https://cutixaadore.pk/shop`;
        return;
      }
    }

    router.push('/shop');
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.ownerCorner}>
          <button
            onClick={() => router.push('/dashboard/login')}
            className={styles.ownerButton}
          >
            <User size={18} />
            <span>{t('Owner')}</span>
          </button>
        </div>
      </header>

      <div className={styles.heroSection}>
        <div className={styles.branding}>
          <h1 className="brand-name">CutiXa Adore</h1>
          <p className="tagline">Love Your Skin</p>
        </div>

        <div className={`${styles.selectionCard} glass`}>
          <h2 className={styles.welcomeTitle}>{t('Select Country')}</h2>

          <div className={styles.formGroup}>
            <div className={styles.inputWithIcon}>
              <Globe size={18} className={styles.icon} />
              <select
                id="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                className={styles.select}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Currency</label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className={styles.select}
            >
              <option value={countries.find(c => c.name === selectedCountry)?.currency}>
                {countries.find(c => c.name === selectedCountry)?.currency}
              </option>
              <option value="USD">USD</option>
            </select>
          </div>

          <button
            onClick={handleEnterShop}
            className={styles.enterButton}
          >
            {t('Shop')} <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <div className={styles.bgGlow}></div>
    </main>
  );
}
