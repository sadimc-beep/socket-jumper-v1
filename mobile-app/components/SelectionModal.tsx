import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SelectionModalProps {
    visible: boolean;
    title: string;
    items: any[];
    loading?: boolean;
    onSelect: (item: any) => void;
    onClose: () => void;
    displayKey?: string; // Key to display, e.g., 'name' or 'year'
}

export default function SelectionModal({
    visible,
    title,
    items,
    loading = false,
    onSelect,
    onClose,
    displayKey = 'name'
}: SelectionModalProps) {
    const [search, setSearch] = useState('');
    const [filteredItems, setFilteredItems] = useState<any[]>([]);

    useEffect(() => {
        if (search) {
            setFilteredItems(items.filter(item =>
                String(item[displayKey]).toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setFilteredItems(items);
        }
    }, [search, items, displayKey]);

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl h-[80%] overflow-hidden">
                    <SafeAreaView className="flex-1">
                        {/* Header */}
                        <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-xl font-extrabold text-black">{title}</Text>
                            <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View className="px-6 py-2 bg-white">
                            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <Ionicons name="search" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 text-black font-semibold"
                                    placeholder={`Search ${title}...`}
                                    placeholderTextColor="#9CA3AF"
                                    value={search}
                                    onChangeText={setSearch}
                                    autoFocus={false}
                                />
                            </View>
                        </View>

                        {/* List */}
                        {loading ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color="black" />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredItems}
                                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                                contentContainerStyle={{ padding: 24 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="py-4 border-b border-gray-50 flex-row justify-between items-center"
                                        onPress={() => {
                                            onSelect(item);
                                            onClose();
                                            setSearch('');
                                        }}
                                    >
                                        <Text className="text-lg font-semibold text-black">{item[displayKey]}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#E5E7EB" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View className="items-center py-10">
                                        <Text className="text-gray-400">No matches found.</Text>
                                    </View>
                                }
                            />
                        )}
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}
