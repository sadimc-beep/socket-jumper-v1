import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function OrderTrackingScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [activeExpanded, setActiveExpanded] = useState(false);
    const [completedExpanded, setCompletedExpanded] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const navigation = useNavigation<any>();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    }, []);

    const fetchData = async () => {
        try {
            const [orderRes, userRes] = await Promise.all([
                api.get('/orders/'),
                api.get('/auth/me/')
            ]);
            setOrders(orderRes.data);
            setUser(userRes.data);
        } catch (e) {
            console.log('Error fetching orders:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleAction = async (orderId: number, actionStr: string) => {
        try {
            await api.post(`/orders/${orderId}/${actionStr}/`);
            fetchData();
            Alert.alert("Success", `Order updated.`);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to update order");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let text = 'PENDING';
        let bg = 'bg-gray-100';
        let fg = 'text-gray-600';
        let iconName: any = 'time';

        switch (status) {
            case 'PENDING_PAYMENT': text = 'PENDING'; bg = 'bg-black'; fg = 'text-white'; iconName = 'hourglass'; break; // Black for action required
            case 'CONFIRMED': text = 'PREPARING'; bg = 'bg-gray-800'; fg = 'text-white'; iconName = 'construct'; break;
            case 'READY_FOR_PICKUP': text = 'READY'; bg = 'bg-orange-500'; fg = 'text-white'; iconName = 'checkmark-circle'; break; // Solid Orange
            case 'COMPLETED': text = 'DELIVERED'; bg = 'bg-gray-100'; fg = 'text-gray-500'; iconName = 'flag'; break;
        }
        return (
            <View className={`${bg} px-3 py-1.5 rounded-full mb-2 self-start flex-row items-center`}>
                <Ionicons name={iconName} size={10} color={['PENDING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP'].includes(status) ? 'white' : 'black'} style={{ opacity: 0.8, marginRight: 4 }} />
                <Text className={`${fg} text-[10px] font-bold uppercase tracking-wider`}>{text}</Text>
            </View>
        );
    };

    const renderOrderItem = ({ item: order }: { item: any }) => {
        const isVendor = user?.role === 'VENDOR';
        const isWorkshop = user?.role === 'WORKSHOP';

        // Helper to safely format date
        const formatDate = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
        };

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                className="bg-white mb-4 mx-4 p-5 rounded-xl shadow-sm border border-gray-100"
            >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-black text-lg font-bold mb-1">{order.rfq_details || 'Vehicle Order'}</Text>
                        {/* VIN / Reg Info */}
                        {(order.rfq_vin || order.rfq_reg) && (
                            <Text className="text-gray-500 text-xs font-semibold mb-1">
                                {[order.rfq_vin && `VIN: ${order.rfq_vin}`, order.rfq_reg && `Reg: ${order.rfq_reg}`].filter(Boolean).join(' • ')}
                            </Text>
                        )}
                        <Text className="text-gray-400 text-xs">
                            {formatDate(order.created_at)}
                        </Text>
                    </View>
                    <StatusBadge status={order.status} />
                </View>

                {/* Map Visual / Route Line */}
                {/* Map Visual / Route Line */}
                <View className="flex-row items-stretch py-3 flex-1">
                    <View className="items-center mr-4 mt-[5px]">
                        <View className="w-2.5 h-2.5 bg-black rounded-full" />
                        <View className="w-0.5 flex-1 bg-gray-200" />
                        <Ionicons name="location" size={16} color="#9CA3AF" />
                    </View>
                    <View className="flex-1 flex-row justify-between items-center pb-1">
                        <View className="flex-1 mr-4">
                            <Text className="text-black font-bold text-sm mb-1">
                                {isVendor
                                    ? order.rfq_workshop_name || 'Workshop'
                                    : order.vendor_shop_name || order.vendor_name || 'Vendor'}
                            </Text>
                            <Text className="text-gray-500 font-medium text-xs">
                                Socket Jumper Logistics
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-black font-bold text-lg">৳{order.total_amount ? Math.round(order.total_amount).toLocaleString() : '0'}</Text>
                            <Text className="text-gray-400 text-[10px] font-bold uppercase mt-0.5">Total</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3 pt-3 border-t border-gray-50">
                    {/* Vendor Actions */}
                    {isVendor && order.status === 'PENDING_PAYMENT' && (
                        <TouchableOpacity
                            className="bg-black flex-1 py-3 rounded-lg items-center shadow-lg"
                            onPress={() => handleAction(order.id, 'confirm')}
                        >
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Accept</Text>
                        </TouchableOpacity>
                    )}
                    {isVendor && order.status === 'CONFIRMED' && (
                        <TouchableOpacity
                            className="bg-black flex-1 py-3 rounded-lg items-center shadow-md"
                            onPress={() => handleAction(order.id, 'mark_ready')}
                        >
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Mark Ready</Text>
                        </TouchableOpacity>
                    )}
                    {isVendor && order.status === 'READY_FOR_PICKUP' && (
                        <TouchableOpacity
                            className="bg-black flex-1 py-3 rounded-lg items-center shadow-md"
                            onPress={() => handleAction(order.id, 'confirm_delivery')}
                        >
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Confirm Delivery</Text>
                        </TouchableOpacity>
                    )}

                    {/* Workshop Actions */}
                    {isWorkshop && order.status === 'PENDING_PAYMENT' && (
                        <TouchableOpacity
                            className="bg-black flex-1 py-3 rounded-lg items-center shadow-lg"
                            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                        >
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">View & Pay</Text>
                        </TouchableOpacity>
                    )}
                    {isWorkshop && order.status === 'READY_FOR_PICKUP' && (
                        <TouchableOpacity
                            className="bg-black flex-1 py-3 rounded-lg items-center shadow-md"
                            onPress={() => handleAction(order.id, 'confirm_pickup')}
                        >
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Confirm Pickup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Hoist filter logic here or inside the component body before return. 
    // Since I can't easily hoist it UP without replacing the whole component start, 
    // I will assume the previous 'return' was closed and I need to close the component function correctly.
    // Wait, the Previous tool replaced from line 104. 
    // I need to replace the incorrectly pasted block with valid code.

    // RENDER CONTENT
    const filteredOrders = orders.filter(order => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') return ['PENDING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP'].includes(order.status);
        if (filter === 'CONFIRMED') return order.status === 'CONFIRMED';
        if (filter === 'COMPLETED') return order.status === 'COMPLETED';
        return false;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 py-3 bg-white border-b border-gray-100 z-10 shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3 bg-gray-100 p-2 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={20} color="black" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-3xl font-extrabold text-black tracking-tighter">Orders</Text>
                        <Text className="text-gray-400 font-bold text-xs mt-0.5 uppercase tracking-widest">Active & Past</Text>
                    </View>
                </View>
            </View>


            {/* Filter Dropdown */}
            <View className="bg-white border-b border-gray-100 z-50">
                <TouchableOpacity
                    onPress={() => setFilterOpen(!filterOpen)}
                    className="flex-row items-center justify-between px-6 py-3"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="filter" size={16} color="black" style={{ marginRight: 8 }} />
                        <Text className="font-bold text-sm tracking-tight text-gray-500 uppercase mr-1">Status:</Text>
                        <Text className="font-bold text-sm tracking-tight text-black">{filter}</Text>
                    </View>
                    <Ionicons name={filterOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
                </TouchableOpacity>

                {/* Dropdown Content */}
                {filterOpen && (
                    <View className="bg-gray-50 border-t border-gray-100">
                        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                onPress={() => {
                                    setFilter(status);
                                    setFilterOpen(false);
                                }}
                                className={`px-6 py-3 flex-row items-center justify-between border-b border-gray-100 ${filter === status ? 'bg-white' : ''}`}
                            >
                                <Text className={`font-bold text-sm tracking-tight ${filter === status ? 'text-black' : 'text-gray-500'}`}>
                                    {status === 'ALL' ? 'All Orders' : status}
                                </Text>
                                {filter === status && <Ionicons name="checkmark" size={18} color="black" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {
                loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="black" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
                        ListEmptyComponent={
                            <View className="items-center py-20 opacity-50 px-10">
                                <Ionicons name="receipt-outline" size={64} color="black" />
                                <Text className="text-gray-400 font-bold text-lg text-center mt-4 tracking-tighter">No orders yet.</Text>
                            </View>
                        }
                        renderItem={renderOrderItem}
                    />
                )
            }
        </SafeAreaView >
    );
}
