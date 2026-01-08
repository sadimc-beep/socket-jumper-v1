import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { removeAuthToken } from '../lib/api';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        api.get('/auth/me/').then(res => setUser(res.data)).catch(console.error);
    }, []);

    const handleLogout = async () => {
        await removeAuthToken();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const MenuItem = ({ icon, label, onPress, color = "text-black" }: any) => (
        <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100 bg-white"
            onPress={onPress}
        >
            <View className="bg-gray-50 h-10 w-10 rounded-lg items-center justify-center mr-4">
                <Ionicons name={icon} size={20} color="black" />
            </View>
            <Text className={`flex-1 font-bold text-base ${color}`}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                {/* Profile Header */}
                <View className="items-center py-10 border-b border-gray-100">
                    <View className="bg-black h-24 w-24 rounded-full items-center justify-center mb-4 shadow-lg">
                        <Text className="text-white text-4xl font-extrabold">{user?.username?.[0].toUpperCase()}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-black">
                        {(user?.shop_name || user?.username || '').replace(/[0-9]/g, '').replace(/[()]/g, '').trim()}
                    </Text>
                    <Text className="text-gray-500 font-medium">{user?.phone_number}</Text>
                    <View className="mt-4 bg-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-gray-600 uppercase">{user?.role}</Text>
                    </View>
                </View>

                <ScrollView className="px-6 pt-4">
                    <Text className="text-gray-400 font-bold text-xs uppercase mb-2 tracking-wider">Account</Text>
                    <MenuItem icon="person-outline" label="Edit Profile" onPress={() => { }} />
                    <MenuItem icon="notifications-outline" label="Notifications" onPress={() => { }} />
                    <MenuItem icon="card-outline" label="Payment Methods" onPress={() => { }} />

                    <Text className="text-gray-400 font-bold text-xs uppercase mb-2 mt-6 tracking-wider">Support</Text>
                    <MenuItem icon="help-circle-outline" label="Help Center" onPress={() => { }} />
                    <MenuItem icon="document-text-outline" label="Terms & Privacy" onPress={() => { }} />

                    <TouchableOpacity
                        className="flex-row items-center py-5 mt-6 border-t border-gray-100"
                        onPress={handleLogout}
                    >
                        <View className="bg-red-50 h-10 w-10 rounded-lg items-center justify-center mr-4">
                            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                        </View>
                        <Text className="flex-1 font-bold text-base text-red-600">Log Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
