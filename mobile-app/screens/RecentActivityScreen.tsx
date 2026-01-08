import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function RecentActivityScreen() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const fetchData = async () => {
        try {
            const [rfqsRes, ordersRes] = await Promise.all([
                api.get('/rfqs/'),
                api.get('/orders/')
            ]);

            const rfqs = rfqsRes.data.map((r: any) => ({
                id: r.id,
                type: 'RFQ',
                date: new Date(r.created_at),
                title: `Requested Parts for ${r.year} ${r.make}`,
                subtitle: `${r.items?.length || 0} items • ${r.status}`,
                status: r.status,
                data: r
            }));

            const orders = ordersRes.data.map((o: any) => ({
                id: o.id,
                type: 'ORDER',
                date: new Date(o.created_at),
                title: `Order #${o.id} - ৳${o.total_amount}`,
                subtitle: `From ${o.vendor_shop_name || 'Vendor'} • ${o.status.replace('_', ' ')}`,
                status: o.status,
                data: o
            }));

            // Merge and sort desc
            const all = [...rfqs, ...orders].sort((a, b) => b.date.getTime() - a.date.getTime());
            setActivities(all);
        } catch (e) {
            console.log('Error fetching activity:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderActivityItem = (item: any, index: number) => {
        const isLast = index === activities.length - 1;
        const isOrder = item.type === 'ORDER';

        return (
            <TouchableOpacity
                key={`${item.type}-${item.id}`}
                className="flex-row px-6 mb-0"
                onPress={() => {
                    if (isOrder) {
                        // @ts-ignore
                        navigation.navigate('OrderTracking'); // Ideally navigate to detail, but list is fine
                    } else {
                        // @ts-ignore
                        navigation.navigate('RFQDetails', { rfqId: item.data.id });
                    }
                }}
            >
                {/* Timeline Line */}
                <View className="items-center mr-4">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isOrder ? 'bg-black' : 'bg-gray-100'}`}>
                        <Ionicons
                            name={isOrder ? 'receipt' : 'search'}
                            size={14}
                            color={isOrder ? '#FFFFFF' : '#000000'}
                        />
                    </View>
                    {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </View>

                {/* Content */}
                <View className="flex-1 pb-8">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-black font-bold text-base flex-1 mr-2">{item.title}</Text>
                        <Text className="text-gray-400 text-[10px] font-bold mt-1">
                            {item.date.toLocaleDateString()}
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">{item.subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                <View className="px-6 py-4 border-b border-gray-100 mb-4">
                    <Text className="text-2xl font-extrabold text-black">Recent Activity</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#000" />}
                >
                    {activities.length === 0 && !loading ? (
                        <View className="items-center py-20 px-10">
                            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 font-bold mt-4">No recent activity</Text>
                        </View>
                    ) : (
                        <View className="pt-2">
                            {activities.map((item, index) => renderActivityItem(item, index))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
