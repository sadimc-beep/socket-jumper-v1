import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

const PRODUCT_IMAGES = [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1549428581-2acda081a384?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

export default function MarketplaceSection() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Fetch parts from catalog. Limit to 5.
            const res = await api.get('/parts/');
            // If response is paginated (results field) or array
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setProducts(data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching marketplace products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="small" color="black" className="my-4" />;
    }

    if (products.length === 0) {
        // Fallback dummy data if API returns empty
        return (
            <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4 px-4">
                    <Text className="text-xl font-bold text-black">Parts Marketplace</Text>
                    <TouchableOpacity>
                        <Text className="text-blue-600 font-semibold">See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {[1, 2, 3].map((_, i) => (
                        <View key={i} className="mr-4 bg-white rounded-xl shadow-sm border border-gray-100 w-40 overflow-hidden">
                            <Image
                                source={{ uri: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length] }}
                                className="w-full h-32 bg-gray-200"
                            />
                            <View className="p-3">
                                <Text className="font-bold text-black mb-1">Coming Soon</Text>
                                <Text className="text-gray-500 text-xs">Premium Parts</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-4">
                <Text className="text-xl font-bold text-black">Parts Marketplace</Text>
                <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold">See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {products.map((item, index) => (
                    <TouchableOpacity key={item.id} className="mr-4 bg-white rounded-xl shadow-sm border border-gray-100 w-40 overflow-hidden">
                        <Image
                            source={{ uri: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length] }}
                            className="w-full h-32 bg-gray-200"
                        />
                        <View className="p-3">
                            <Text className="font-bold text-black mb-1 numberOfLines={2} h-10">{item.part_name || item.name}</Text>
                            <Text className="text-gray-500 text-xs mb-1">{item.part_number}</Text>
                            <Text className="text-black font-bold">৳ 2,500</Text>
                            {/* Dummy price since catalog needs price field */}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
