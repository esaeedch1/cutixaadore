'use client';

import React, { useState } from 'react';
import {
    CreditCard,
    Smartphone,
    Globe,
    Banknote,
    Plus,
    Save,
    Info
} from 'lucide-react';
import styles from '../dashboard.module.css';

export default function PaymentManagement() {
    const [localGateways, setLocalGateways] = useState([
        { id: 'jazzcash', name: 'JazzCash', active: true, title: 'CutiXa Official', number: '0300-1234567' },
        { id: 'sadapay', name: 'SadaPay', active: true, title: 'CutiXa Adore', number: '0312-7654321' },
        { id: 'easypaisa', name: 'EasyPaisa', active: false, title: '', number: '' },
    ]);

    const [bankConfig, setBankConfig] = useState({
        bankName: 'Meezan Bank',
        accountTitle: 'CutiXa Adore PVT LTD',
        accountNumber: '0202010101010',
        iban: 'PK45MEZN0000202010101010'
    });

    const [intlConfig, setIntlConfig] = useState({
        method: 'PayPal',
        email: 'finance@cutixa.com',
        autoConvert: true,
        currency: 'USD'
    });

    const handleLocalGatewayChange = (id: string, field: string, value: any) => {
        setLocalGateways(prev => prev.map(gw =>
            gw.id === id ? { ...gw, [field]: value } : gw
        ));
    };

    const handleSave = () => {
        alert('Payment settings saved successfully!');
    };

    return (
        <div className={styles.paymentPanel}>
            <div className={styles.grid2}>
                {/* Local Wallets */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Smartphone size={20} className={styles.statIcon} />
                            <h3>Local Wallets</h3>
                        </div>
                        <button className={styles.primaryBtn} onClick={handleSave}><Save size={16} /> Save Changes</button>
                    </div>

                    <div className={styles.gatewayList}>
                        {localGateways.map(gw => (
                            <div key={gw.id} className={styles.gatewayItem}>
                                <div className={styles.gwInfo}>
                                    <div className={styles.gwToggle}>
                                        <input
                                            type="checkbox"
                                            checked={gw.active}
                                            onChange={(e) => handleLocalGatewayChange(gw.id, 'active', e.target.checked)}
                                        />
                                        <span className={styles.gwName}>{gw.name}</span>
                                    </div>
                                    <div className={styles.gwDetails}>
                                        <div className={styles.formGroup}>
                                            <input
                                                type="text"
                                                placeholder="Account Title"
                                                className={styles.input}
                                                value={gw.title}
                                                onChange={(e) => handleLocalGatewayChange(gw.id, 'title', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                className={styles.input}
                                                value={gw.number}
                                                onChange={(e) => handleLocalGatewayChange(gw.id, 'number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Transfer */}
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleWithIcon}>
                            <Banknote size={20} className={styles.statIcon} />
                            <h3>Bank Details (IBAN)</h3>
                        </div>
                        <button className={styles.primaryBtn} onClick={handleSave}><Save size={16} /> Save</button>
                    </div>

                    <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.formGroup + " " + styles.fullRow}>
                            <label>Bank Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={bankConfig.bankName}
                                onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Account Title</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={bankConfig.accountTitle}
                                onChange={(e) => setBankConfig({ ...bankConfig, accountTitle: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Account Number</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={bankConfig.accountNumber}
                                onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup + " " + styles.fullRow}>
                            <label>IBAN Number</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={bankConfig.iban}
                                onChange={(e) => setBankConfig({ ...bankConfig, iban: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* International Payments */}
            <div className={`${styles.card} glass`} style={{ marginTop: '2rem' }}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleWithIcon}>
                        <Globe size={20} className={styles.statIcon} />
                        <h3>International Routing (USD)</h3>
                    </div>
                    <div className={styles.alertBox}>
                        <Info size={16} />
                        <span>All foreign payments are auto-converted to USD before transfer.</span>
                    </div>
                </div>

                <div className={styles.formGrid} style={{ marginTop: '2rem' }}>
                    <div className={styles.formGroup}>
                        <label>Payout Method</label>
                        <select
                            className={styles.select}
                            value={intlConfig.method}
                            onChange={(e) => setIntlConfig({ ...intlConfig, method: e.target.value })}
                        >
                            <option>PayPal</option>
                            <option>Payoneer</option>
                            <option>Stripe</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Receiver Email / ID</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={intlConfig.email}
                            onChange={(e) => setIntlConfig({ ...intlConfig, email: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Base Currency Control</label>
                        <input type="text" className={styles.input} value="Live Spot Rate (Converted to USD)" disabled />
                    </div>
                    <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button className={styles.primaryBtn} style={{ width: '100%' }} onClick={handleSave}>Update Financial Routing</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
