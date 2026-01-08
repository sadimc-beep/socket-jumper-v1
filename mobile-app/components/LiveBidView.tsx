import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api, { BASE_URL } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

interface LiveBidViewProps {
    rfqId: number;
    isWorkshop: boolean;
    excludeItemIds?: number[];
}

export default function LiveBidView({ rfqId, isWorkshop, excludeItemIds = [] }: LiveBidViewProps) {
    const [bids, setBids] = useState<any[]>([]);
    const [status, setStatus] = useState<string>('Connecting...');
    const [selectedBids, setSelectedBids] = useState<number[]>([]);
    const [awarding, setAwarding] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const navigation = useNavigation();

    const fetchBids = async () => {
        try {
            const [bidsRes, userRes] = await Promise.all([
                api.get(`/bids/?rfq=${rfqId}`),
                api.get('/auth/me/')
            ]);
            setCurrentUser(userRes.data);

            // Backend already filters bids by role, but we'll filter on frontend as safety
            let filteredBids = bidsRes.data;
            if (!isWorkshop && userRes.data) {
                // Vendors should only see their own bids
                filteredBids = bidsRes.data.filter((bid: any) => bid.vendor === userRes.data.id);
            }

            // Filter out bids for excluded items (already ordered)
            if (excludeItemIds.length > 0) {
                filteredBids = filteredBids.filter((bid: any) => !excludeItemIds.includes(bid.rfq_item));
            }

            setBids(filteredBids);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleBidSelection = (bidId: number) => {
        if (!isWorkshop) return; // Vendors can't select
        setSelectedBids(prev => {
            if (prev.includes(bidId)) {
                return prev.filter(id => id !== bidId);
            } else {
                return [...prev, bidId];
            }
        });
    };

    const handleAwardOrder = async () => {
        if (selectedBids.length === 0) return;

        setAwarding(true);
        try {
            const res = await api.post(`/rfqs/${rfqId}/award_order/`, {
                bid_ids: selectedBids
            });
            Alert.alert('Success', 'Order(s) created successfully!');
            setSelectedBids([]);
            // @ts-ignore
            navigation.navigate('OrderTracking');
        } catch (e: any) {
            console.error(e);
            Alert.alert('Error', 'Failed to create order. Please try again.');
        } finally {
            setAwarding(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchBids();

        // WebSocket Connection
        const wsProtocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
        const wsHost = BASE_URL.replace(/^https?:\/\//, '').split('/')[0];
        const wsUrl = `${wsProtocol}://${wsHost}/ws/rfqs/${rfqId}/`;

        console.log('Connecting to WS:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WS Connected');
            setStatus('Live');
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'bid_placed') {
                console.log('New Bid:', data.bid);
                // For vendors, only show their own bids
                if (!isWorkshop && currentUser && data.bid.vendor !== currentUser.id) {
                    console.log('Filtering out bid from another vendor');
                    return;
                }
                // Filter out bids for excluded items
                if (excludeItemIds.includes(data.bid.rfq_item)) {
                    console.log('Filtering out bid for ordered item');
                    return;
                }

                setBids(prev => [data.bid, ...prev]);
            }
        };

        ws.onerror = (e) => {
            console.log('WS Error:', e);
            setStatus('Connection Error');
        };

        ws.onclose = () => {
            console.log('WS Closed');
            setStatus('Disconnected');
        };

        return () => {
            ws.close();
        };
    }, [rfqId]); // Only reconnect when rfqId changes

    // Group bids by Vendor
    const groupedBids = bids.reduce((acc, bid) => {
        const vendor = bid.vendor_name || 'Unknown Vendor';
        if (!acc[vendor]) acc[vendor] = [];
        acc[vendor].push(bid);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-black">Live Offers</Text>
                <View className={`px-2 py-1 rounded-full flex-row items-center ${status === 'Live' ? 'bg-green-100 border border-green-200' : 'bg-red-50'}`}>
                    {status === 'Live' && <View className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse" />}
                    <Text className={`text-[10px] font-bold ${status === 'Live' ? 'text-green-700' : 'text-red-500'}`}>
                        {status === 'Live' ? 'LIVE FEED' : status}
                    </Text>
                </View>
            </View>

            {Object.keys(groupedBids).length === 0 ? (
                <View className="items-center py-8">
                    <Ionicons name="pulse" size={24} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm mt-2">Waiting for live offers...</Text>
                </View>
            ) : (
                <View className="mb-4">
                    {(Object.entries(groupedBids) as [string, any[]][]).map(([vendor, vendorBids]) => (
                        <View key={vendor} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2 mb-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="storefront-outline" size={14} color="black" style={{ marginRight: 6 }} />
                                    <Text className="font-bold text-black text-sm">{vendorBids[0].vendor_shop_name || vendor}</Text>
                                </View>
                                {vendorBids[0].vendor_rating && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 2 }} />
                                        <Text className="text-gray-600 text-xs font-bold">{vendorBids[0].vendor_rating}</Text>
                                    </View>
                                )}
                            </View>
                            {vendorBids.map((bid: any) => {
                                const isSelected = selectedBids.includes(bid.id);
                                return (
                                    <TouchableOpacity
                                        key={bid.id}
                                        onPress={() => toggleBidSelection(bid.id)}
                                        disabled={!isWorkshop}
                                        className={`flex-row justify-between items-center mb-2 p-3 rounded-lg bg-white shadow-sm border ${isSelected ? 'border-black bg-gray-50' : 'border-gray-100'}`}
                                    >
                                        <View className="flex-1">
                                            <Text className="text-gray-600 text-xs font-bold uppercase mb-1">
                                                {bid.item_name}{bid.item_quantity ? ` x${bid.item_quantity}` : ''}
                                            </Text>
                                            <Text className="font-bold text-black text-base">৳ {bid.amount}</Text>
                                            <Text className="text-xs text-gray-500 mt-0.5 font-medium">{bid.brand} • {bid.part_category}</Text>
                                            {bid.eta && <Text className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 self-start px-1 rounded">ETA: {bid.eta}</Text>}
                                        </View>
                                        <View className="items-end">
                                            <View className={`px-2 py-1 rounded mb-2 ${bid.availability ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                                <Text className={`text-[10px] font-bold ${bid.availability ? 'text-green-700' : 'text-yellow-700'}`}>
                                                    {bid.availability ? 'In Stock' : 'Check Stock'}
                                                </Text>
                                            </View>
                                            {isWorkshop && (
                                                <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                </View>
            )}

            {/* Award Button Floating (Only for Workshop) */}
            {isWorkshop && selectedBids.length > 0 && (
                <TouchableOpacity
                    className={`bg-black p-4 rounded-xl shadow-lg flex-row justify-center items-center mt-4 ${awarding ? 'opacity-80' : ''}`}
                    onPress={handleAwardOrder}
                    disabled={awarding}
                >
                    {awarding ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-base">
                            Award Order ({selectedBids.length})
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}
