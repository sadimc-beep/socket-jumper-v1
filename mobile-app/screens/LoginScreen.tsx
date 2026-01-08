import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { setAuthToken } from '../lib/api';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const devLogin = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/dev-login/', { phone_number: phone, role: 'WORKSHOP' });
            await setAuthToken(res.data.token);
            Alert.alert('Details', 'Logging in as Workshop...');

            const role = res.data.user.role;
            if (role === 'WORKSHOP') navigation.replace('WorkshopTabs');
            else if (role === 'VENDOR') navigation.replace('VendorTabs');
            else Alert.alert('Error', 'Role not supported on mobile');

        } catch (e: any) {
            Alert.alert('Error', `Dev Login Failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const devLoginVendor = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/dev-login/', { phone_number: phone, role: 'VENDOR' });
            await setAuthToken(res.data.token);
            Alert.alert('Details', 'Logging in as Vendor...');
            navigation.replace('VendorTabs');
        } catch (e: any) {
            Alert.alert('Error', `Vendor Login Failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/otp/request/', { phone_number: phone });
            if (res.data.otp) Alert.alert('DEV OTP', res.data.otp);
            setStep('OTP');
        } catch (e: any) {
            Alert.alert('Error', `Failed to send OTP: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/otp/verify/', { phone_number: phone, otp });
            await setAuthToken(res.data.token);
            const role = res.data.user.role;
            if (role === 'WORKSHOP') navigation.replace('WorkshopTabs');
            else if (role === 'VENDOR') navigation.replace('VendorTabs');
            else Alert.alert('Error', 'Role not supported on mobile');
        } catch (e) {
            Alert.alert('Error', 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const ShortcutChip = ({ label, number, colorStr }: any) => (
        <TouchableOpacity
            className={`mr-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50`}
            onPress={() => setPhone(number)}
        >
            <Text className={`font-bold text-xs ${colorStr}`}>{label}</Text>
            <Text className="text-gray-500 text-[10px]">{number}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 justify-center px-8"
                >
                    {/* Logo */}
                    <View className="items-center mb-8">
                        <Text className="text-4xl font-black text-black" style={{ letterSpacing: -1 }}>SOCKET</Text>
                        <Text className="text-4xl font-black text-black" style={{ letterSpacing: -1 }}>JUMPER</Text>
                        <Text className="text-gray-500 font-medium mt-1 text-center">Parts Marketplace</Text>
                    </View>

                    <View className="bg-white">
                        {step === 'PHONE' ? (
                            <>
                                <View className="mb-6">
                                    <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                        <Ionicons name="call-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                                        <TextInput
                                            className="flex-1 text-black font-semibold text-lg h-10"
                                            placeholder="Mobile Number"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={setPhone}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    className={`bg-black p-4 rounded-xl mb-6 shadow-md items-center ${loading ? 'opacity-80' : ''}`}
                                    onPress={requestOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Continue</Text>}
                                </TouchableOpacity>

                                {/* Dev Shortcuts */}
                                <View className="mt-8 pt-6 border-t border-gray-100">
                                    <Text className="text-xs font-bold text-gray-400 uppercase mb-4 text-center tracking-wider">Developer Access</Text>

                                    <View className="flex-row justify-center gap-3 mb-6">
                                        <TouchableOpacity onPress={devLogin} className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                            <Text className="text-blue-700 font-bold text-xs">Workshop Login</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={devLoginVendor} className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
                                            <Text className="text-purple-700 font-bold text-xs">Vendor Login</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-2">
                                        <ShortcutChip label="Work-1" number="01711111111" colorStr="text-blue-600" />
                                        <ShortcutChip label="Work-2" number="01711000000" colorStr="text-blue-600" />
                                        <ShortcutChip label="Vend-1" number="01811000000" colorStr="text-purple-600" />
                                        <ShortcutChip label="Vend-2" number="01771043993" colorStr="text-purple-600" />
                                    </ScrollView>
                                </View>
                            </>
                        ) : (
                            <>
                                <View className="mb-6">
                                    <Text className="text-gray-500 text-center mb-4 font-medium">Enter the code sent to {phone}</Text>
                                    <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                        <Ionicons name="keypad-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                                        <TextInput
                                            className="flex-1 text-black font-bold text-2xl h-10 text-center tracking-widest"
                                            placeholder="• • • •"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="number-pad"
                                            value={otp}
                                            onChangeText={setOtp}
                                            maxLength={4}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    className="bg-black p-4 rounded-xl shadow-md items-center mb-4"
                                    onPress={verifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Login</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep('PHONE')} disabled={loading}>
                                    <Text className="text-gray-500 text-center font-bold text-sm">Change Phone Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
