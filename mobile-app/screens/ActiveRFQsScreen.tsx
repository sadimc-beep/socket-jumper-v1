import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ActiveRFQsScreen() {
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const fetchRfqs = async () => {
        try {
            const res = await api.get('/rfqs/');
            const data = res.data;
            const activeOnly = data.filter((r: any) =>
                r.status !== 'COMPLETED' && r.status !== 'CLOSED'
            );
            setRfqs(activeOnly);
        } catch (e) {
            console.log('Error fetching RFQs:', e);
        } finally {
            setLoading(false);
            setRefreshing(false); // Set refreshing to false when fetching ends
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRfqs();
        }, [])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-600';
            case 'BIDDING_OPEN': return 'bg-[#FF3B30] text-white'; // Promo Orange
            case 'PROCESSING': return 'bg-black text-white';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Draft';
            case 'BIDDING_OPEN': return 'Live';
            case 'PROCESSING': return 'Processing';
            default: return status;
        }
    };

    // renderRFQCard is no longer used directly, its logic is integrated into FlatList renderItem
    // const renderRFQCard = (rfq: any) => (
    //     <TouchableOpacity
    //         key={rfq.id}
    //         onPress={() => navigation.navigate('RFQDetails', { rfqId: rfq.id })}
    //         className="bg-white mb-4 mx-4 p-5 rounded-xl shadow-sm border border-gray-100"
    //     >
    //         <View className="flex-row justify-between items-start mb-3">
    //             <View className="flex-1">
    //                 <Text className="text-black text-lg font-bold tracking-tighter">
    //                     {rfq.year} {rfq.make} {rfq.model}
    //                 </Text>
    //                 <Text className="text-gray-500 text-xs font-semibold mt-1 tracking-tighter">
    //                     {new Date(rfq.created_at).toLocaleDateString()} • #{rfq.id}
    //                 </Text>
    //             </View>
    //             {/* Status Badge */}
    //             <View className={`px-3 py-1.5 rounded-full flex-row items-center ${getStatusColor(rfq.status).split(' ')[0]}`}>
    //                 <Ionicons
    //                     name={rfq.status === 'BIDDING_OPEN' ? 'flash' : 'time'}
    //                     size={10}
    //                     color="white"
    //                     style={{ marginRight: 4 }}
    //                 />
    //                 <Text className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(rfq.status).split(' ')[1]} tracking-tighter`}>
    //                     {getStatusLabel(rfq.status)}
    //                 </Text>
    //             </View>
    //         </View>

    //         <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
    //             <View className="flex-row items-center">
    //                 <View className="bg-gray-100 px-2 py-1 rounded mr-2">
    //                     <Text className="text-xs font-bold text-gray-700 tracking-tighter">{rfq.items ? rfq.items.length : 0} Parts</Text>
    //                 </View>
    //             </View>
    //             <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    //         </View>
    //     </TouchableOpacity>
    // );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-black tracking-tighter">Active Requests</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateRFQ')}
                    className="bg-black p-2 rounded-full"
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="black" />
                </View>
            ) : (
                <FlatList
                    data={rfqs}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRfqs} tintColor="#000" />}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <Ionicons name="list-outline" size={48} color="#9CA3AF" />
                            <Text className="text-lg font-bold text-gray-900 mt-4 tracking-tighter">No Active Requests</Text>
                            <Text className="text-gray-500 text-center mt-2 px-10 tracking-tighter">
                                You don't have any open requests at the moment.
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CreateRFQ')}
                                className="mt-6 bg-black px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-bold tracking-tighter">Create New Request</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('RFQDetails', { rfqId: item.id })}
                            className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200"
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <View>
                                    <View className="flex-row items-center mb-1">
                                        <View className="bg-green-100 px-2 py-0.5 rounded mr-2">
                                            <Text className="text-green-800 text-[10px] font-bold uppercase tracking-tighter">Live</Text>
                                        </View>
                                        <Text className="text-gray-400 text-xs font-bold tracking-tighter">#{item.id}</Text>
                                    </View>
                                    <Text className="text-lg font-extrabold text-black tracking-tighter">
                                        {item.year} {item.make} {item.model}
                                    </Text>
                                </View>
                                <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
                                    <Text className="font-bold text-black tracking-tighter">{item.items.length}</Text>
                                    <Text className="text-[8px] text-gray-500 uppercase tracking-tighter">Parts</Text>
                                </View>
                            </View>

                            {/* Preview Items */}
                            <View className="bg-gray-50 rounded-lg p-3 mb-3">
                                {item.items.slice(0, 2).map((part: any, idx: number) => (
                                    <View key={part.id} className="flex-row items-center mb-1 last:mb-0">
                                        <Ionicons name="ellipse" size={6} color="black" style={{ marginRight: 6 }} />
                                        <Text className="text-gray-700 text-xs font-medium tracking-tighter" numberOfLines={1}>
                                            {part.quantity}x {part.name}
                                        </Text>
                                    </View>
                                ))}
                                {item.items.length > 2 && (
                                    <Text className="text-gray-400 text-[10px] mt-1 ml-4 italic tracking-tighter">
                                        + {item.items.length - 2} more items...
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                                <Text className="text-gray-500 text-xs font-medium tracking-tighter">
                                    Posted {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-blue-600 text-xs font-bold mr-1 tracking-tighter">View Details</Text>
                                    <Ionicons name="arrow-forward" size={14} color="#2563EB" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
