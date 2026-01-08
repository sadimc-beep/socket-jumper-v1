import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Switch } from 'react-native';
import api from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function VendorRFQDetailsScreen({ route, navigation }: any) {
    const { rfqId } = route.params;
    const [rfq, setRfq] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Bidding Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [bidData, setBidData] = useState<any>({}); // itemId -> { amount, part_category, brand, availability, eta, remarks }
    const [submitting, setSubmitting] = useState(false);

    const partCategories = [
        { label: 'Genuine OEM', value: 'GENUINE_OEM' },
        { label: 'Aftermarket (Branded)', value: 'AFTERMARKET_BRANDED' },
        { label: 'Aftermarket (Unbranded)', value: 'AFTERMARKET_UNBRANDED' },
        { label: 'Used/Reconditioned', value: 'USED_RECONDITIONED' }
    ];

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/rfqs/${rfqId}/`);
            setRfq(res.data);
        } catch (e) {
            Alert.alert("Error", "Could not load details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [rfqId]);

    const updateBidField = (itemId: number, field: string, value: any) => {
        setBidData((prev: any) => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const submitBid = async () => {
        setSubmitting(true);
        try {
            const itemsToBid = Object.keys(bidData).filter(k => bidData[k]?.amount);
            if (itemsToBid.length === 0) {
                Alert.alert("Empty", "Please enter a price for at least one item");
                setSubmitting(false);
                return;
            }

            // Validate required fields
            for (const itemId of itemsToBid) {
                const bid = bidData[itemId];
                if (!bid.part_category) {
                    Alert.alert("Missing Info", "Please select part category for all items");
                    setSubmitting(false);
                    return;
                }
            }

            // Submit bids with all fields
            for (const itemId of itemsToBid) {
                const bid = bidData[itemId];
                await api.post('/bids/', {
                    rfq_item: itemId,
                    amount: parseFloat(bid.amount),
                    part_category: bid.part_category,
                    brand: bid.brand || '',
                    availability: bid.availability ?? true,
                    eta: '', // Not collected in UI
                    remarks: bid.remarks || ''
                });
            }

            Alert.alert("Sent", "Your offers have been sent!");
            setModalVisible(false);
            setBidData({});
            fetchDetails(); // Refresh
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e.response?.data?.detail || "Failed to place bid");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <View className="flex-1 bg-white justify-center"><ActivityIndicator color="black" /></View>;
    if (!rfq) return null;

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Workshop Info */}
                <View className="bg-white p-6 shadow-sm border-b border-gray-100 flex-row items-center mb-4">
                    <View className="bg-blue-50 h-10 w-10 rounded-full items-center justify-center mr-3">
                        <Ionicons name="business" size={20} color="#2563EB" />
                    </View>
                    <View>
                        <Text className="text-gray-500 font-bold text-xs uppercase">Request From</Text>
                        <Text className="text-black text-lg font-bold">{rfq.workshop_name || 'Workshop'}</Text>
                        {rfq.workshop_address && <Text className="text-gray-400 text-xs">{rfq.workshop_address}</Text>}
                    </View>
                </View>

                {/* Car Info */}
                <View className="px-4 mb-4">
                    <View className="bg-black rounded-xl p-5 shadow-lg">
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-white text-2xl font-bold">{rfq.year} {rfq.make}</Text>
                                <Text className="text-gray-400 text-lg font-medium">{rfq.model}</Text>
                            </View>
                            <Ionicons name="car-sport" size={40} color="white" style={{ opacity: 0.2 }} />
                        </View>
                        <View className="mt-4 bg-white/10 self-start px-3 py-1 rounded">
                            <Text className="text-white text-xs font-mono">{rfq.vin || 'NO VIN'}</Text>
                        </View>
                    </View>
                </View>

                {/* Items */}
                <View className="px-4">
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-2 tracking-wider">Required Parts</Text>
                    {rfq.items.map((item: any) => (
                        <View key={item.id} className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-lg font-bold text-black flex-1">{item.name}</Text>
                                <View className="bg-gray-100 px-2 py-1 rounded">
                                    <Text className="text-xs font-bold text-gray-600">x{item.quantity}</Text>
                                </View>
                            </View>
                            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{item.preferred_category} • {item.side}</Text>
                            {item.notes && <Text className="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded italic">"{item.notes}"</Text>}
                        </View>
                    ))}
                </View>


            </ScrollView>

            {/* Sticky Footer CTA */}
            <View className="bg-white p-4 border-t border-gray-100 shadow-lg">
                <TouchableOpacity
                    className="bg-black py-4 rounded-xl items-center shadow-md flex-row justify-center"
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="pricetag" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg">Make an Offer</Text>
                </TouchableOpacity>
            </View>

            {/* Bid Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white pt-6">
                    <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                        <Text className="text-2xl font-bold text-black">Submit Offer</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="black" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6 pt-4">
                        {rfq.items.map((item: any) => (
                            <View key={item.id} className="mb-6 pb-4 border-b border-gray-200">
                                <Text className="text-black font-bold text-lg mb-3">{item.name} (x{item.quantity})</Text>

                                {/* Price */}
                                <Text className="text-gray-600 font-bold text-xs uppercase mb-1">Price *</Text>
                                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 h-12 bg-white mb-3">
                                    <Text className="text-black font-bold text-lg mr-2">৳</Text>
                                    <TextInput
                                        className="flex-1 text-black font-bold text-lg h-full"
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={bidData[item.id]?.amount || ''}
                                        onChangeText={(v) => updateBidField(item.id, 'amount', v)}
                                    />
                                </View>


                                {/* Part Category - Chip Buttons */}
                                <Text className="text-gray-600 font-bold text-xs uppercase mb-1">Part Type *</Text>
                                <View className="flex-row flex-wrap mb-3">
                                    {partCategories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.value}
                                            onPress={() => updateBidField(item.id, 'part_category', cat.value)}
                                            className={`px-3 py-2 rounded-full mr-2 mb-2 border ${bidData[item.id]?.part_category === cat.value ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
                                        >
                                            <Text className={`text-xs font-bold ${bidData[item.id]?.part_category === cat.value ? 'text-white' : 'text-gray-600'}`}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>


                                {/* Compact row for Brand and Stock */}
                                <View className="flex-row gap-3 mb-3">
                                    {/* Brand */}
                                    <View className="flex-1">
                                        <Text className="text-gray-600 font-bold text-xs uppercase mb-1">Brand</Text>
                                        <TextInput
                                            className="border border-gray-300 rounded-xl px-3 h-10 bg-white text-black text-sm"
                                            placeholder="Optional"
                                            value={bidData[item.id]?.brand || ''}
                                            onChangeText={(v) => updateBidField(item.id, 'brand', v)}
                                        />
                                    </View>

                                    {/* Stock Availability */}
                                    <View className="items-center justify-end pb-1">
                                        <Text className="text-gray-600 font-bold text-xs uppercase mb-1">In Stock</Text>
                                        <Switch
                                            value={bidData[item.id]?.availability ?? true}
                                            onValueChange={(v) => updateBidField(item.id, 'availability', v)}
                                        />
                                    </View>
                                </View>

                                {/* Remarks - Compact */}
                                <Text className="text-gray-600 font-bold text-xs uppercase mb-1">Notes</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-xl px-3 py-2 bg-white text-black text-sm"
                                    placeholder="Optional notes"
                                    multiline
                                    numberOfLines={2}
                                    value={bidData[item.id]?.remarks || ''}
                                    onChangeText={(v) => updateBidField(item.id, 'remarks', v)}
                                />
                            </View>
                        ))}
                    </ScrollView>

                    <View className="p-6 border-t border-gray-100">
                        <TouchableOpacity
                            className="bg-black py-4 rounded-xl items-center shadow-lg"
                            onPress={submitBid}
                            disabled={submitting}
                        >
                            <Text className="text-white font-bold text-lg">{submitting ? 'Sending...' : 'Confirm Offer'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
