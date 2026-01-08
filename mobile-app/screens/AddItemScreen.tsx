import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import api from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen({ route, navigation }: any) {
    const { rfqId, rfqData, vehicleData } = route.params || {};

    // If we have vehicleData but no rfqId, we need to create RFQ when adding first part
    const needsRFQCreation = !rfqId && vehicleData;
    const vehicleInfo = rfqData || vehicleData;

    // Standard Fields
    const [partNumber, setPartNumber] = useState('');
    const [partName, setPartName] = useState('');
    const [partType, setPartType] = useState('ANY');
    const [quantity, setQuantity] = useState('1');
    const [note, setNote] = useState('');

    // Part Search
    const [partSearchResults, setPartSearchResults] = useState<any[]>([]);
    const [partSearchLoading, setPartSearchLoading] = useState(false);
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const [compatibilityWarning, setCompatibilityWarning] = useState<string | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Vehicle Info Modal
    const [showVehicleModal, setShowVehicleModal] = useState(false);

    // Collapsible sections
    const [categoryExpanded, setCategoryExpanded] = useState(false);
    const [positionExpanded, setPositionExpanded] = useState(false);

    // Fields
    const [category, setCategory] = useState('ENGINE');
    const [side, setSide] = useState('N/A');

    const [loading, setLoading] = useState(false);

    // Debounced part number search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (partNumber.length >= 3) {
            setPartSearchLoading(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    // Get vehicle data for compatibility check
                    let vehicleParams = '';
                    if (vehicleInfo && vehicleInfo.make_id && vehicleInfo.model_id) {
                        vehicleParams = `&vehicle_make=${vehicleInfo.make_id}&vehicle_model=${vehicleInfo.model_id}&vehicle_year=${vehicleInfo.year || ''}`;
                    }

                    const res = await api.get(`/parts/search/?q=${partNumber}${vehicleParams}`);
                    setPartSearchResults(res.data);
                    setShowPartDropdown(res.data.length > 0);
                } catch (e) {
                    console.error('Part search error:', e);
                } finally {
                    setPartSearchLoading(false);
                }
            }, 500); // 500ms debounce
        } else {
            setPartSearchResults([]);
            setShowPartDropdown(false);
            setPartSearchLoading(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [partNumber, vehicleInfo]);

    const handleSelectPart = (part: any) => {
        setPartNumber(part.part_number);
        setPartName(part.part_name);
        setShowPartDropdown(false);

        // Only show warning if explicitly incompatible
        console.log('Part compatibility:', part.is_compatible, 'for part:', part.part_number);
        if (part.is_compatible === false) {
            const vehicleInfoStr = part.make_name && part.model_name
                ? `${part.make_name} ${part.model_name} (${part.year_from}-${part.year_to})`
                : 'a different vehicle';
            setCompatibilityWarning(
                `⚠️ This part is designed for ${vehicleInfoStr}. It may not be compatible with your RFQ vehicle.`
            );
        } else {
            setCompatibilityWarning(null);
        }
    };

    const handleAddItem = async () => {
        if (!partName) {
            Alert.alert("Missing Info", "Please enter a part name");
            return;
        }

        setLoading(true);
        try {
            let currentRfqId = rfqId;

            // Create RFQ first if needed
            if (needsRFQCreation && vehicleData) {
                const rfqPayload = {
                    vin: vehicleData.vin || '',
                    make: vehicleData.make_name || '',
                    model: vehicleData.model_name || '',
                    year: vehicleData.year || null,
                    trim: vehicleData.trim || '',
                    engine: vehicleData.engine || '',
                    reg_city: vehicleData.reg_city || '',
                    reg_series: vehicleData.reg_series || '',
                    reg_number1: vehicleData.reg_number1 || null,
                    reg_number2: vehicleData.reg_number2 || null
                };

                const rfqRes = await api.post('/rfqs/', rfqPayload);
                currentRfqId = rfqRes.data.id;
            }

            // Add item to RFQ
            await api.post('/rfq-items/', {
                rfq: currentRfqId,
                name: partName,
                part_number: partNumber,
                quantity: parseInt(quantity) || 1,
                notes: note,
                preferred_category: partType,
                side: side,
            });

            // Navigate to RFQ details
            navigation.navigate('RFQDetails', { rfqId: currentRfqId });
        } catch (e) {
            Alert.alert("Error", "Failed to add item");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Use goBack() to return to previous screen with vehicle already selected
    const handleClose = () => {
        navigation.goBack();
    };

    const PartTypeChip = ({ label, value }: any) => (
        <TouchableOpacity
            onPress={() => setPartType(value)}
            className={`px-3 py-2 rounded-full mr-2 mb-2 border ${partType === value ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
        >
            <Text className={`text-xs font-bold ${partType === value ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    const CategoryChip = ({ label, value }: any) => (
        <TouchableOpacity
            onPress={() => setCategory(value)}
            className={`px-3 py-2 rounded-full mr-2 mb-2 border ${category === value ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
        >
            <Text className={`text-xs font-bold ${category === value ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    const SideChip = ({ label, value }: any) => (
        <TouchableOpacity
            onPress={() => setSide(value)}
            className={`px-3 py-2 rounded-full mr-2 border ${side === value ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
        >
            <Text className={`text-xs font-bold ${side === value ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {/* Header with vehicle icon */}
                <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white shadow-sm z-10">
                    <View className="flex-row items-center flex-1">
                        <Text className="text-xl font-bold text-black mr-3">Add Part</Text>
                        {vehicleInfo && (
                            <TouchableOpacity
                                onPress={() => setShowVehicleModal(true)}
                                className="bg-gray-100 px-3 py-1.5 rounded-lg flex-row items-center"
                            >
                                <Ionicons name="car-outline" size={16} color="#6B7280" />
                                <Text className="text-gray-600 text-xs font-semibold ml-1.5">
                                    {vehicleInfo.year} {vehicleInfo.make_name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Vehicle Info Modal */}
                <Modal
                    visible={showVehicleModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowVehicleModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowVehicleModal(false)}
                        className="flex-1 bg-black/50 justify-center items-center px-6"
                    >
                        <TouchableOpacity activeOpacity={1} className="bg-white rounded-2xl p-6 w-full max-w-sm">
                            <View className="flex-row items-center mb-4">
                                <Ionicons name="car" size={24} color="black" />
                                <Text className="text-xl font-bold text-black ml-2">Vehicle Details</Text>
                            </View>

                            {vehicleInfo && (
                                <View>
                                    <View className="mb-3">
                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Year</Text>
                                        <Text className="text-black text-lg font-semibold">{vehicleInfo.year}</Text>
                                    </View>
                                    <View className="mb-3">
                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Make</Text>
                                        <Text className="text-black text-lg font-semibold">{vehicleInfo.make_name}</Text>
                                    </View>
                                    <View className="mb-3">
                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Model</Text>
                                        <Text className="text-black text-lg font-semibold">{vehicleInfo.model_name}</Text>
                                    </View>
                                    {vehicleInfo.engine && (
                                        <View className="mb-3">
                                            <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Engine</Text>
                                            <Text className="text-black text-lg font-semibold">{vehicleInfo.engine}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() => setShowVehicleModal(false)}
                                className="bg-black py-3 rounded-xl items-center mt-4"
                            >
                                <Text className="text-white font-bold">Close</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                <ScrollView className="flex-1 px-6 pt-6">
                    {/* Compatibility Warning */}
                    {compatibilityWarning && (
                        <View className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex-row items-start">
                            <Ionicons name="warning" size={20} color="#F59E0B" style={{ marginRight: 8, marginTop: 2 }} />
                            <Text className="flex-1 text-yellow-800 text-sm font-medium">{compatibilityWarning}</Text>
                        </View>
                    )}

                    {/* Part Number - Searchable */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Part Number (Optional)</Text>
                        <View className="relative">
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                                <TextInput
                                    className="flex-1 text-black font-semibold text-lg"
                                    placeholder="Search by part number..."
                                    placeholderTextColor="#9CA3AF"
                                    value={partNumber}
                                    onChangeText={setPartNumber}
                                    onFocus={() => {
                                        if (partSearchResults.length > 0) {
                                            setShowPartDropdown(true);
                                        }
                                    }}
                                />
                                {partSearchLoading && <ActivityIndicator size="small" color="#6B7280" />}
                            </View>

                            {/* Search Results Dropdown */}
                            {showPartDropdown && partSearchResults.length > 0 && (
                                <View className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60">
                                    <ScrollView>
                                        {partSearchResults.map((part, index) => (
                                            <TouchableOpacity
                                                key={part.id}
                                                onPress={() => handleSelectPart(part)}
                                                className={`p-4 flex-row justify-between items-center ${index < partSearchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                                            >
                                                <View className="flex-1">
                                                    <Text className="text-black font-bold text-base">{part.part_number}</Text>
                                                    <Text className="text-gray-600 text-sm mt-1">{part.part_name}</Text>
                                                    {part.make_name && (
                                                        <Text className="text-gray-400 text-xs mt-1">
                                                            {part.make_name} {part.model_name ? `• ${part.model_name}` : ''}
                                                            {part.year_from ? ` • ${part.year_from}-${part.year_to || 'present'}` : ''}
                                                        </Text>
                                                    )}
                                                </View>
                                                {part.is_compatible === false && (
                                                    <Ionicons name="warning" size={20} color="#F59E0B" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Part Name */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Part Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 text-black p-4 rounded-xl text-lg font-semibold"
                            placeholder="e.g. Brake Pad, Headlight"
                            placeholderTextColor="#9CA3AF"
                            value={partName}
                            onChangeText={setPartName}
                            autoFocus
                        />
                    </View>

                    {/* Part Type */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Part Type</Text>
                        <View className="flex-row flex-wrap">
                            <PartTypeChip label="Any" value="ANY" />
                            <PartTypeChip label="Genuine OEM" value="GENUINE_OEM" />
                            <PartTypeChip label="Aftermarket (Branded)" value="AFTERMARKET_BRANDED" />
                            <PartTypeChip label="Aftermarket (Unbranded)" value="AFTERMARKET_UNBRANDED" />
                            <PartTypeChip label="Used/Reconditioned" value="USED_RECONDITIONED" />
                        </View>
                    </View>

                    {/* Quantity */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Quantity</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 text-black p-4 rounded-xl text-lg font-semibold text-center"
                            keyboardType="number-pad"
                            value={quantity}
                            onChangeText={setQuantity}
                        />
                    </View>

                    {/* Category - Collapsible */}
                    <TouchableOpacity
                        onPress={() => setCategoryExpanded(!categoryExpanded)}
                        className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="grid-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
                            <View>
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Category</Text>
                                <Text className="text-black font-semibold text-base mt-0.5">{category}</Text>
                            </View>
                        </View>
                        <Ionicons name={categoryExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {categoryExpanded && (
                        <View className="mb-4 px-2">
                            <View className="flex-row flex-wrap">
                                <CategoryChip label="Engine" value="ENGINE" />
                                <CategoryChip label="Body" value="BODY" />
                                <CategoryChip label="Suspension" value="SUSPENSION" />
                                <CategoryChip label="Electrical" value="ELECTRICAL" />
                                <CategoryChip label="Interior" value="INTERIOR" />
                                <CategoryChip label="Glass" value="GLASS" />
                            </View>
                        </View>
                    )}

                    {/* Position - Collapsible */}
                    <TouchableOpacity
                        onPress={() => setPositionExpanded(!positionExpanded)}
                        className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="locate-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
                            <View>
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Position</Text>
                                <Text className="text-black font-semibold text-base mt-0.5">{side}</Text>
                            </View>
                        </View>
                        <Ionicons name={positionExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {positionExpanded && (
                        <View className="mb-4 px-2">
                            <View className="flex-row flex-wrap">
                                <SideChip label="N/A" value="N/A" />
                                <SideChip label="Left (L)" value="L" />
                                <SideChip label="Right (R)" value="R" />
                                <SideChip label="Rear" value="REAR" />
                                <SideChip label="Front" value="FRONT" />
                            </View>
                        </View>
                    )}

                    {/* Notes */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Notes / Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 text-black p-4 rounded-xl text-base h-24"
                            placeholder="Add details about condition, color, etc."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                </ScrollView>

                {/* Add Part Button */}
                <View className="p-6 border-t border-gray-100 bg-white shadow-lg">
                    <TouchableOpacity
                        className="bg-black py-4 rounded-xl items-center shadow-md"
                        onPress={handleAddItem}
                        disabled={loading}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Adding...' : 'Add Part'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
