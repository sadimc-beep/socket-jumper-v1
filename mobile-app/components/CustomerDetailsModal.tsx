import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomerDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (details: { name: string; phone: string; nickname: string }) => void;
    loading?: boolean;
}

export default function CustomerDetailsModal({ visible, onClose, onSave, loading = false }: CustomerDetailsModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [nickname, setNickname] = useState('');

    const handleSave = () => {
        if (!name.trim()) {
            // Simple validation
            return;
        }
        onSave({
            name,
            phone,
            nickname
        });
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-center px-4">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View className="bg-white rounded-2xl overflow-hidden p-6 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-black">Save Vehicle</Text>
                            <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="black" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 mb-6 text-sm">
                            Save this vehicle to My Garage for faster requests in the future.
                        </Text>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Customer Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-black font-semibold"
                                    placeholder="Enter Name"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View>
                                <Text className="text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Phone Number (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-black font-semibold"
                                    placeholder="Enter Phone Number"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>

                            <View>
                                <Text className="text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Vehicle Nickname (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-black font-semibold"
                                    placeholder="e.g. Dad's Car, Office Van"
                                    value={nickname}
                                    onChangeText={setNickname}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            className={`bg-black p-4 rounded-xl items-center mt-6 ${!name.trim() ? 'opacity-50' : ''}`}
                            onPress={handleSave}
                            disabled={!name.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Save to Garage</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
