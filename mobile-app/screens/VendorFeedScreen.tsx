import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, StatusBar, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

export default function VendorFeedScreen({ navigation }: any) {
    const [rfqs, setRfqs] = useState([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [rfqRes, userRes] = await Promise.all([
                api.get('/rfqs/'),
                api.get('/auth/me/')
            ]);
            setRfqs(rfqRes.data);
            setUser(userRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderItem = ({ item }: any) => {
        return (
            <TouchableOpacity
                className="flex-row items-center py-5 px-4 bg-white mb-3 mx-4 rounded-xl shadow-sm border border-gray-100"
                onPress={() => navigation.navigate('VendorRFQDetails', { rfqId: item.id })}
            >
                <View className="bg-gray-100 h-12 w-12 rounded-full items-center justify-center mr-4">
                    <Ionicons name="cube-outline" size={24} color="black" />
                </View>
                <View className="flex-1">
                    <Text className="text-black text-lg font-bold">Request #{item.id}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5 font-medium">
                        {item.year} {item.make} {item.model} • {item.item_count} Items
                    </Text>
                </View>
                <View className="bg-black px-4 py-2 rounded-full flex-row items-center">
                    <Text className="text-white text-xs font-bold mr-1">Bid Now</Text>
                    <Ionicons name="arrow-forward" size={12} color="white" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 pb-4 shadow-sm z-10">
                    <View>
                        <Text className="text-black text-2xl font-extrabold tracking-tight">Opportunities</Text>
                        <Text className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">Live Feed</Text>
                    </View>
                    {user?.shop_name && (
                        <View className="bg-[#FF3B30] px-3 py-1 rounded-full flex-row items-center border border-red-600/10">
                            <Ionicons name="ellipse" size={6} color="white" style={{ marginRight: 6 }} />
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Online</Text>
                        </View>
                    )}
                </View>

                {/* Request List */}
                <View className="flex-1 pt-4">
                    <FlatList
                        data={rfqs}
                        renderItem={renderItem}
                        keyExtractor={(item: any) => item.id.toString()}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#000" />}
                        ListEmptyComponent={
                            !loading ? (
                                <View className="mt-20 items-center opacity-50 px-10">
                                    <Ionicons name="beer-outline" size={64} color="black" />
                                    <Text className="text-black font-bold text-xl text-center mt-4">No active requests</Text>
                                    <Text className="text-gray-500 mt-2 text-center">New opportunities in your area will appear here instantly.</Text>
                                </View>
                            ) : null
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}
