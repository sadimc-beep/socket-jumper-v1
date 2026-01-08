import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import api from '../lib/api';
import LiveBidView from '../components/LiveBidView'; // We will assume LiveBidView handles its own styling or accepts props, but likely needs refactor too.
import { Ionicons } from '@expo/vector-icons';

export default function RFQDetailsScreen({ route, navigation }: any) {
    const { rfqId } = route.params;
    const [rfq, setRfq] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get(`/rfqs/${rfqId}/`);
            setRfq(res.data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not load RFQ details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [rfqId]);

    const handleClose = async () => {
        try {
            await api.patch(`/rfqs/${rfqId}/`, { status: 'CLOSED' });
            fetchData();
            Alert.alert("Closed", "Request is now closed.");
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) return (
        <View className="flex-1 bg-white justify-center items-center">
            <ActivityIndicator color="black" />
        </View>
    );

    if (!rfq) return <View className="flex-1 bg-white"><Text>Not Found</Text></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-black tracking-tighter">Request Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
                {/* Status Banner */}
                <View className="bg-black px-6 py-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white font-bold text-lg tracking-tighter">
                            {rfq.year} {rfq.make} {rfq.model}
                        </Text>
                        <View className="bg-white/20 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold uppercase tracking-tighter">{rfq.status.replace('_', ' ')}</Text>
                        </View>
                    </View>
                    <Text className="text-gray-400 text-xs tracking-tighter">
                        Requested on {new Date(rfq.created_at).toLocaleDateString()} • ID #{rfq.id}
                    </Text>
                    {rfq.vin && <Text className="text-gray-500 text-xs mt-1 tracking-tighter">VIN: {rfq.vin}</Text>}
                </View>

                {/* Items List */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1 tracking-wider tracking-tighter">Requested Parts</Text>
                    {rfq.items.map((item: any) => (
                        <View key={item.id} className="bg-white p-4 rounded-xl mb-3 border border-gray-200 shadow-sm">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center mb-1">
                                        <View className="bg-gray-100 w-6 h-6 rounded-full items-center justify-center mr-2">
                                            <Text className="font-bold text-xs tracking-tighter">{item.quantity}x</Text>
                                        </View>
                                        <Text className="text-black font-bold text-base tracking-tighter">{item.name}</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs ml-8 tracking-tighter">
                                        {item.category} • {item.part_type ? item.part_type.replace('_', ' ') : ''}
                                    </Text>
                                    {item.notes && (
                                        <Text className="text-gray-400 text-xs italic mt-2 ml-8 tracking-tighter">"{item.notes}"</Text>
                                    )}
                                </View>
                                {item.winning_bid_id ? (
                                    <View className="bg-orange-500 px-3 py-1 rounded-full">
                                        <Text className="text-white text-xs font-bold uppercase tracking-tighter">Ordered</Text>
                                    </View>
                                ) : (
                                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-tighter">Open</Text>
                                    </View>
                                )}
                            </View>

                            {/* View Order Button if Ordered */}
                            {item.winning_bid_id && (
                                <TouchableOpacity
                                    className="mt-3 bg-black py-2 rounded-lg items-center"
                                    onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
                                >
                                    <Text className="text-white font-bold text-xs tracking-tighter">View Order</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* Live Bids (Only for items NOT yet ordered) */}
                {rfq.status !== 'COMPLETED' && rfq.status !== 'CLOSED' && rfq.items.some((i: any) => !i.winning_bid_id) && (
                    <View className="px-4 mb-4">
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-2 tracking-wider tracking-tighter">Live Offers</Text>
                        <LiveBidView
                            rfqId={rfq.id}
                            isWorkshop={true}
                            excludeItemIds={rfq.items.filter((i: any) => i.winning_bid_id).map((i: any) => i.id)}
                        />
                    </View>
                )}

                {/* Delete/Close Option */}
                {rfq.status === 'OPEN' && (
                    <View className="px-6 mt-4 mb-10">
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    "Delete Request?",
                                    "This will cancel the request and notify all vendors. This action cannot be undone.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Delete",
                                            style: "destructive",
                                            onPress: async () => {
                                                try {
                                                    await api.delete(`/rfqs/${rfq.id}/`);
                                                    navigation.goBack();
                                                } catch (e) {
                                                    Alert.alert("Error", "Could not delete request");
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            className="bg-red-50 p-4 rounded-xl items-center border border-red-100"
                        >
                            <Text className="text-red-600 font-bold tracking-tighter">Delete Request</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
