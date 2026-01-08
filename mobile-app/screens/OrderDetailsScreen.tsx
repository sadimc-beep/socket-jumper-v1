import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function OrderDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const [orderRes, userRes] = await Promise.all([
                api.get(`/orders/${orderId}/`),
                api.get('/auth/me/')
            ]);
            setOrder(orderRes.data);
            setUser(userRes.data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to load order details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionStr: string) => {
        try {
            await api.post(`/orders/${orderId}/${actionStr}/`);
            fetchOrderDetails();
            Alert.alert("Success", `Order updated.`);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to update order");
        }
    };

    if (loading || !order) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    const isVendor = user?.role === 'VENDOR';
    const isWorkshop = user?.role === 'WORKSHOP';

    const formatCategory = (cat: string) => {
        switch (cat) {
            case 'GENUINE_OEM': return 'Genuine OEM';
            case 'AFTERMARKET_BRANDED': return 'Aftermarket (Branded)';
            case 'AFTERMARKET_UNBRANDED': return 'Aftermarket';
            case 'USED_RECONDITIONED': return 'Used / Reconditioned';
            default: return cat;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let text = 'PENDING';
        let bg = 'bg-gray-100';
        let fg = 'text-gray-600';
        let iconName: any = 'time';

        switch (status) {
            case 'PENDING_PAYMENT': text = 'REQUESTED'; bg = 'bg-black'; fg = 'text-white'; iconName = 'hourglass'; break;
            case 'CONFIRMED': text = 'PREPARING'; bg = 'bg-gray-800'; fg = 'text-white'; iconName = 'construct'; break;
            case 'READY_FOR_PICKUP': text = 'READY'; bg = 'bg-[#FF3B30]'; fg = 'text-white'; iconName = 'checkmark-circle'; break;
            case 'COMPLETED': text = 'DELIVERED'; bg = 'bg-gray-100'; fg = 'text-gray-500'; iconName = 'flag'; break;
        }
        return (
            <View className={`${bg} px-3 py-1.5 rounded-full flex-row items-center self-start`}>
                <Ionicons name={iconName} size={12} color={['PENDING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP'].includes(status) ? 'white' : 'black'} style={{ marginRight: 4 }} />
                <Text className={`${fg} text-xs font-bold uppercase tracking-wider`}>{text}</Text>
            </View>
        );
    };

    const formatCurrency = (amount: any) => {
        return Number(amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-extrabold text-black tracking-tighter">Order #{order.id}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView className="flex-1">
                    {/* Status Section */}
                    <View className="p-6 border-b border-gray-100 bg-gray-50">
                        <StatusBadge status={order.status} />
                        <Text className="text-4xl font-extrabold text-black mt-4 tracking-tighter">৳{formatCurrency(order.total_amount)}</Text>
                        <Text className="text-gray-500 font-bold tracking-tighter">Total Amount</Text>
                    </View>

                    {/* Vehicle Info */}
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">Vehicle Details</Text>
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-black rounded-xl items-center justify-center mr-4 shadow-sm">
                                <Ionicons name="car-sport" size={24} color="white" />
                            </View>
                            <View>
                                <Text className="text-xl font-extrabold text-black tracking-tighter">{order.rfq_details || 'Vehicle Info'}</Text>
                                <Text className="text-gray-500 text-xs mt-1 font-bold tracking-tighter">
                                    {[order.rfq_vin && `VIN: ${order.rfq_vin}`, order.rfq_reg && `Reg: ${order.rfq_reg}`].filter(Boolean).join(' • ')}
                                </Text>
                            </View>
                        </View>

                        {/* Link to Request Details - Styled as Button */}
                        {/* Link to Request Details - Styled as Button */}
                        <TouchableOpacity
                            className="bg-white border border-gray-300 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
                            onPress={() => navigation.navigate('RFQDetails', { rfqId: typeof order.rfq === 'object' ? order.rfq.id : order.rfq })}
                        >
                            <Text className="text-black font-bold mr-2 text-sm tracking-tighter">View Request Details</Text>
                            <Ionicons name="arrow-forward" size={16} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* items Section */}
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">Order Summary</Text>

                        {order.bids && order.bids.length > 0 ? (
                            order.bids.map((bid: any, index: number) => (
                                <View key={bid.id} className="mb-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0 last:mb-0">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <View className="flex-1 mr-2">
                                            <View className="flex-row items-center">
                                                {bid.item_quantity > 1 && (
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                                                        <Text className="text-black font-bold text-xs tracking-tighter">{bid.item_quantity}x</Text>
                                                    </View>
                                                )}
                                                <Text className="text-black font-bold text-lg tracking-tighter flex-1">{bid.item_name}</Text>
                                            </View>

                                            <Text className="text-gray-500 text-xs font-bold mt-1 tracking-tighter">
                                                {bid.brand ? `${bid.brand} • ` : ''}{formatCategory(bid.part_category)}
                                            </Text>
                                            {bid.eta && (
                                                <Text className="text-gray-400 text-[10px] mt-0.5 tracking-tighter font-bold">ETA: {bid.eta}</Text>
                                            )}
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-black font-bold text-lg tracking-tighter">৳{formatCurrency(bid.amount)}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-400 italic tracking-tighter">No item details available.</Text>
                        )}

                        <View className="mt-4 pt-4 border-t border-dashed border-gray-200">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-black font-extrabold text-xl tracking-tighter">Total</Text>
                                <Text className="text-black font-extrabold text-xl tracking-tighter">৳{formatCurrency(order.total_amount)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Vendor/Workshop Info */}
                    <View className="p-6">
                        <Text className="text-xs font-bold text-gray-900 uppercase tracking-tighter mb-4">
                            {isVendor ? 'Customer' : 'Vendor'}
                        </Text>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="storefront" size={20} color="black" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-black tracking-tighter">
                                    {isVendor ? (order.rfq_workshop_name || 'Workshop') : (order.vendor_shop_name || order.vendor_name || 'Vendor')}
                                </Text>
                                <Text className="text-gray-500 text-xs font-bold tracking-tighter">Socket Jumper Partner</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Actions */}
                <View className="p-6 border-t border-gray-100 bg-white">
                    {/* Vendor Actions */}
                    {isVendor && (
                        <>
                            {order.status === 'PENDING_PAYMENT' && (
                                <TouchableOpacity
                                    className="bg-black w-full py-4 rounded-xl items-center shadow-lg"
                                    onPress={() => handleAction('confirm')}
                                >
                                    <Text className="text-white font-bold uppercase tracking-tighter">Accept & Prepare</Text>
                                </TouchableOpacity>
                            )}
                            {order.status === 'CONFIRMED' && (
                                <TouchableOpacity
                                    className="bg-black w-full py-4 rounded-xl items-center shadow-md"
                                    onPress={() => handleAction('mark_ready')}
                                >
                                    <Text className="text-white font-bold uppercase tracking-tighter">Mark as Ready</Text>
                                </TouchableOpacity>
                            )}
                            {order.status === 'READY_FOR_PICKUP' && (
                                <TouchableOpacity
                                    className="bg-black w-full py-4 rounded-xl items-center shadow-md"
                                    onPress={() => handleAction('confirm_delivery')}
                                >
                                    <Text className="text-white font-bold uppercase tracking-tighter">Confirm Delivery</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    {/* Workshop Actions */}
                    {isWorkshop && (
                        <TouchableOpacity
                            className="bg-gray-100 w-full py-4 rounded-xl items-center flex-row justify-center"
                            onPress={() => Alert.alert("Support", "Contacting support...")}
                        >
                            <Ionicons name="headset" size={20} color="black" style={{ marginRight: 8 }} />
                            <Text className="text-black font-bold uppercase tracking-tighter">Contact Support</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
