import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, StatusBar, Image, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import MarketplaceSection from '../components/MarketplaceSection';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function WorkshopHomeScreen({ navigation }: any) {
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

    const MenuGridItem = ({ icon, label, onPress, color = "bg-gray-50" }: any) => (
        <TouchableOpacity
            className={`${color} rounded-xl p-4 mb-4 items-center justify-center shadow-sm border border-gray-100`}
            style={{ width: (SCREEN_WIDTH - 60) / 2, height: 110 }}
            onPress={onPress}
        >
            <View className="mb-3">
                <Ionicons name={icon} size={32} color="black" />
            </View>
            <Text className="font-semibold text-gray-900 text-sm">{label}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            className="flex-row items-center py-5 border-b border-gray-100"
            onPress={() => navigation.navigate('RFQDetails', { rfqId: item.id })}
        >
            <View className="bg-gray-100 h-10 w-10 rounded-full items-center justify-center mr-4">
                <Ionicons name="car-sport" size={20} color="black" />
            </View>
            <View className="flex-1">
                <Text className="text-black text-base font-semibold">{item.year} {item.make} {item.model}</Text>
                <Text className="text-gray-500 text-xs mt-1 font-medium">
                    {item.status.replace('_', ' ')} • {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Main Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#000" />}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
                    <View className="flex-row items-center">
                        <Image
                            source={require('../assets/socket-jumper-logo.png')}
                            style={{ width: 150, height: 38, resizeMode: 'contain', marginLeft: -12 }}
                        />
                    </View>
                    <TouchableOpacity
                        className="bg-black w-10 h-10 rounded-full items-center justify-center border border-gray-800"
                        onPress={() => navigation.navigate('Account')}
                    >
                        <Text className="text-white font-bold text-lg tracking-tighter">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                        <Ionicons name="search" size={20} color="#6B7280" />
                        <Text className="text-gray-400 ml-3 text-base font-medium tracking-tighter">Search parts, RFQs, orders...</Text>
                    </View>
                </View>

                {/* Hero Grid Section */}
                <View className="px-6 mb-8">
                    <View className="flex-row justify-between mb-4">
                        {/* Express Order - Large Black Card */}
                        <TouchableOpacity
                            className="w-[48%] bg-black rounded-2xl p-5 justify-between h-40 shadow-lg"
                            onPress={() => navigation.navigate('CreateRFQ')}
                            activeOpacity={0.9}
                        >
                            <View className="bg-gray-800 w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="flash" size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-extrabold mb-1 tracking-tighter">Express Order</Text>
                                <Text className="text-gray-400 text-xs font-medium tracking-tighter">Quick Request</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Right Column Stack */}
                        <View className="w-[48%] justify-between h-40">
                            {/* Active RFQs */}
                            <TouchableOpacity
                                className="bg-white rounded-2xl p-4 h-[47%] justify-between border border-gray-100 shadow-sm"
                                onPress={() => navigation.navigate('ActiveRFQs')}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="bg-green-50 w-8 h-8 rounded-full items-center justify-center">
                                        <Ionicons name="radio-button-on" size={16} color="#10B981" />
                                    </View>
                                    <Text className="text-2xl font-bold text-black -mt-1 tracking-tighter">{rfqs.length}</Text>
                                </View>
                                <Text className="text-black font-bold text-sm tracking-tighter">Active RFQs</Text>
                            </TouchableOpacity>

                            {/* My Orders */}
                            <TouchableOpacity
                                className="bg-white rounded-2xl p-4 h-[47%] justify-between border border-gray-100 shadow-sm"
                                onPress={() => navigation.navigate('OrderTracking')}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center">
                                        <Ionicons name="cube" size={16} color="#3B82F6" />
                                    </View>
                                    {/* Placeholder count */}
                                    <Text className="text-2xl font-bold text-black -mt-1 tracking-tighter">3</Text>
                                </View>
                                <Text className="text-black font-bold text-sm tracking-tighter">My Orders</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* My Garage Banner */}
                    <TouchableOpacity
                        className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-100"
                        onPress={() => navigation.navigate('Garage')}
                    >
                        <View className="bg-white w-12 h-12 rounded-xl items-center justify-center mr-4 border border-gray-100">
                            <Ionicons name="car-sport" size={24} color="black" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-black font-bold text-base mb-0.5 tracking-tighter">My Garage</Text>
                            <Text className="text-gray-500 text-xs tracking-tighter">Manage your saved vehicles</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Shop by Category - NOW below the standard grid */}
                <View className="px-6 mb-8">
                    <View className="flex-row justify-between items-end mb-4">
                        <Text className="text-xl font-extrabold text-black tracking-tighter">Shop by Category</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold text-sm tracking-tighter">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Render Categories */}
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { name: 'Oils & Fluids', image: 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?auto=format&fit=crop&q=80&w=800' },
                            { name: 'Tires & Wheels', image: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&q=80&w=800' },
                            { name: 'Batteries', image: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?auto=format&fit=crop&q=80&w=800' },
                            { name: 'Body Parts', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800' },
                            { name: 'Brakes', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800' },
                            { name: 'Suspension', image: 'https://images.unsplash.com/photo-1552176625-e47ff529b595?auto=format&fit=crop&q=80&w=800' },
                        ].map((cat, index) => (
                            <TouchableOpacity
                                key={index}
                                className="rounded-2xl mb-4 overflow-hidden relative shadow-sm"
                                style={{ width: '48%', height: 140 }}
                                onPress={() => navigation.navigate('CreateRFQ', { category: cat.name })}
                            >
                                <Image
                                    source={{ uri: cat.image }}
                                    className="absolute inset-0 w-full h-full"
                                    style={{ resizeMode: 'cover' }}
                                />
                                <View className="absolute inset-0 bg-black/30" />
                                <View className="absolute bottom-0 left-0 right-0 p-3">
                                    <Text className="text-white font-bold text-lg shadow-sm tracking-tighter" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                                        {cat.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
