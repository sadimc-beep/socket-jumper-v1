"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '@/lib/api';
import styles from './login.module.css';

export default function LoginPage() {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await apiFetch('/auth/otp/request/', {
                method: 'POST',
                body: JSON.stringify({ phone_number: phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('OTP');
                // For Dev Convenience, alerting the OTP
                if (data.otp) {
                    alert(`DEV MODE: OTP is ${data.otp}`);
                }
            } else {
                setError(JSON.stringify(data));
            }
        } catch (err) {
            setError('Failed to request OTP');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await apiFetch('/auth/otp/verify/', {
                method: 'POST',
                body: JSON.stringify({ phone_number: phone, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setAuthToken(data.token);
                router.push('/vendors');
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('Failed to verify OTP');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Login</h1>

                {error && <div className={styles.error}>{error}</div>}

                {step === 'PHONE' ? (
                    <form onSubmit={handleRequestOtp}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="017..."
                                required
                            />
                        </div>
                        <button type="submit" className={styles.button}>Send OTP</button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Enter OTP</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="4-digit code"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.button}>Verify</button>
                    </form>
                )}
            </div>
        </div>
    );
}
