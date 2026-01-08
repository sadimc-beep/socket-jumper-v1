import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

export default function MyGarageScreen() {
    const navigation = useNavigation<any>();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/saved-vehicles/');
            setVehicles(res.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVehicles();
    }, []);

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Delete Vehicle",
            `Are you sure you want to remove ${name} from your garage?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/saved-vehicles/${id}/`);
                            setVehicles(prev => prev.filter(v => v.id !== id));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete vehicle");
                        }
                    }
                }
            ]
        );
    };

    const handleQuickRequest = (vehicle: any) => {
        navigation.navigate('AddItem', {
            vehicleData: {
                make_id: vehicle.make_id,
                model_id: vehicle.model_id,
                year: vehicle.year,
                make_name: vehicle.make_name,
                model_name: vehicle.model_name,
                vin: vehicle.vin,
                reg_city: vehicle.reg_city,
                reg_series: vehicle.reg_series,
                reg_number1: vehicle.reg_number1,
                reg_number2: vehicle.reg_number2,
                customer_name: vehicle.customer_name,
                customer_phone: vehicle.customer_phone
            }
        });
    };

    return (
        <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-black tracking-tighter">My Garage</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddItem', { mode: 'create_rfq' })} // Quick add flow
                    className="bg-gray-100 p-2 rounded-full border border-gray-200"
                >
                    <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={vehicles}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={refreshing}
                    onRefresh={fetchVehicles}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="car-sport-outline" size={40} color="#9CA3AF" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 tracking-tighter">No Vehicles Saved</Text>
                            <Text className="text-gray-500 text-center mt-2 px-10 tracking-tighter">
                                Add your vehicles here for quick and easy request creation.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 bg-black rounded-lg items-center justify-center mr-4">
                                        {/* Placeholder logo logic or simple icon */}
                                        <Ionicons name="car-sport" size={24} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-lg font-extrabold text-black tracking-tighter">
                                            {item.make_name} {item.model_name}
                                        </Text>
                                        <Text className="text-gray-500 font-medium tracking-tighter">{item.year}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item.id, item.nickname || item.model_name)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>

                            {/* Details Grid */}
                            <View className="bg-gray-50 rounded-lg p-3 mb-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-500 text-xs uppercase tracking-tighter font-bold">Registration</Text>
                                    <Text className="text-black font-bold text-xs tracking-tighter">{item.reg_number1 ? `${item.reg_city} ${item.reg_series} ${item.reg_number1}` : 'N/A'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 text-xs uppercase tracking-tighter font-bold">VIN</Text>
                                    <Text className="text-black font-bold text-xs tracking-tighter">{item.vin || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Quick Action */}
                            <TouchableOpacity
                                className="bg-black py-3 rounded-lg flex-row justify-center items-center"
                                onPress={() => handleQuickRequest(item)}
                            >
                                <Ionicons name="flash" size={16} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-sm tracking-tighter">Express Request</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
