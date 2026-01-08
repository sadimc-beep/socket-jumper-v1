"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import styles from './vendors.module.css';

interface User {
    id: number;
    username: string;
    phone_number: string;
    role: string;
    is_verified: boolean;
    is_active: boolean;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVendors = async () => {
        try {
            const res = await apiFetch('/admin/vendors/');
            if (res.ok) {
                const data = await res.json();
                setVendors(data);
            }
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'suspend') => {
        try {
            const res = await apiFetch(`/admin/vendors/${id}/${action}/`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchVendors(); // Refresh list
            } else {
                alert('Action failed');
            }
        } catch (error) {
            alert('Action failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Vendor Management</h1>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>ID</th>
                            <th className={styles.th}>Phone</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Verification</th>
                            <th className={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr key={vendor.id}>
                                <td className={styles.td}>#{vendor.id}</td>
                                <td className={styles.td}>{vendor.phone_number}</td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${vendor.is_active ? styles.active : styles.suspended}`}>
                                        {vendor.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${vendor.is_verified ? styles.verified : styles.unverified}`}>
                                        {vendor.is_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        {!vendor.is_verified && (
                                            <button
                                                className={`${styles.btn} ${styles.btnApprove}`}
                                                onClick={() => handleAction(vendor.id, 'approve')}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {vendor.is_active && (
                                            <button
                                                className={`${styles.btn} ${styles.btnSuspend}`}
                                                onClick={() => handleAction(vendor.id, 'suspend')}
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
