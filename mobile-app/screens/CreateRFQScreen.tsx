import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import api from '../lib/api';
import { Ionicons } from '@expo/vector-icons';
import SelectionModal from '../components/SelectionModal';
import CustomerDetailsModal from '../components/CustomerDetailsModal';

const BD_CITIES = [
    { id: 'DHAKA METRO', name: 'DHAKA METRO' }, { id: 'CHATTOGRAM METRO', name: 'CHATTOGRAM METRO' },
    { id: 'DHAKA', name: 'DHAKA' }, { id: 'CHATTOGRAM', name: 'CHATTOGRAM' },
    { id: 'RAJSHAHI', name: 'RAJSHAHI' }, { id: 'KHULNA', name: 'KHULNA' },
    { id: 'SYLHET', name: 'SYLHET' }, { id: 'BARISAL', name: 'BARISAL' },
    { id: 'RANGPUR', name: 'RANGPUR' }, { id: 'MYMENSINGH', name: 'MYMENSINGH' }
];

const BD_SERIES = [
    { id: 'KA', name: 'KA - Private Car (Small)' }, { id: 'KHA', name: 'KHA - Private Car (Medium)' },
    { id: 'GA', name: 'GA - Private Car (Large)' }, { id: 'GHA', name: 'GHA - SUV/Jeep' },
    { id: 'CHA', name: 'CHA - Microbus' }, { id: 'CAA', name: 'CAA - Microbus (Hire)' },
    { id: 'JA', name: 'JA - Minibus' }, { id: 'JHA', name: 'JHA - Bus' },
    { id: 'TA', name: 'TA - Truck (Large)' }, { id: 'THA', name: 'THA - Pickup (Double Cabin)' },
    { id: 'DA', name: 'DA - Truck (Medium)' }, { id: 'NA', name: 'NA - Pickup (Small)' },
    { id: 'PA', name: 'PA - Taxi' }, { id: 'BHA', name: 'BHA - Private Car (2000cc+)' },
    { id: 'MA', name: 'MA - Pickup (Delivery)' }, { id: 'HA', name: 'HA - Motorbike' },
    { id: 'LA', name: 'LA - Motorbike (Large)' }
];

export default function CreateRFQScreen({ navigation }: any) {
    const [vin, setVin] = useState('');
    const [trim, setTrim] = useState('');
    const [loading, setLoading] = useState(false);

    // Vehicle Data State
    const [makes, setMakes] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [engines, setEngines] = useState<any[]>([]);

    // Selected Values
    const [selectedMake, setSelectedMake] = useState<any>(null);
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [selectedEngine, setSelectedEngine] = useState<any>(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'make' | 'model' | 'year' | 'engine' | 'reg_city' | 'reg_series' | 'garage' | null>(null);
    const [listLoading, setListLoading] = useState(false);

    // Garage State
    const [garageVehicles, setGarageVehicles] = useState<any[]>([]);

    // Registration State
    const [regCity, setRegCity] = useState<any>(null);
    const [regSeries, setRegSeries] = useState<any>(null);
    const [regNum1, setRegNum1] = useState('');
    const [regNum2, setRegNum2] = useState('');

    // Save Vehicle State
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [savingVehicle, setSavingVehicle] = useState(false);

    // Load makes on mount
    useEffect(() => {
        const loadMakes = async () => {
            if (makes.length === 0) {
                try {
                    const res = await api.get('/vehicles/');
                    setMakes(res.data);
                } catch (e) {
                    console.error('Error fetching makes:', e);
                }
            }
        };
        loadMakes();
    }, []);

    const openMakeSelection = async () => {
        setModalType('make');
        setModalVisible(true);
        // Makes are already loading/loaded via useEffect
    };

    const openModelSelection = async () => {
        if (!selectedMake) {
            Alert.alert('Step Missing', 'Please select a Make first.');
            return;
        }
        setModalType('model');
        setModalVisible(true);
        setListLoading(true);
        try {
            const res = await api.get(`/vehicles/models/?make=${selectedMake.id}`);
            setModels(res.data);
        } catch (e) {
            console.error('Error fetching models:', e);
            Alert.alert('Error', 'Failed to load models.');
        } finally {
            setListLoading(false);
        }
    };

    const openEngineSelection = async () => {
        if (!selectedModel) {
            Alert.alert('Step Missing', 'Please select a Model first.');
            return;
        }
        setModalType('engine');
        setModalVisible(true);
        setListLoading(true);
        try {
            const res = await api.get(`/vehicles/engines/?model=${selectedModel.id}`);
            setEngines(res.data);
        } catch (e) {
            console.error('Error fetching engines:', e);
            // Don't alert error heavily as engines might be empty initially
        } finally {
            setListLoading(false);
        }
    };

    const openYearSelection = async () => {
        if (!selectedModel) {
            Alert.alert('Step Missing', 'Please select a Model first.');
            return;
        }
        setModalType('year');
        setModalVisible(true);
        setListLoading(true);
        try {
            const res = await api.get(`/vehicles/years/?model=${selectedModel.id}`);
            setYears(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setListLoading(false);
        }
    };

    const openGarageSelection = async () => {
        setModalType('garage');
        setModalVisible(true);
        setListLoading(true);
        try {
            const res = await api.get('/saved-vehicles/');
            setGarageVehicles(res.data);
        } catch (e) {
            console.error('Error fetching garage:', e);
            Alert.alert('Error', 'Failed to load saved vehicles.');
        } finally {
            setListLoading(false);
        }
    };

    const openRegCitySelection = () => {
        setModalType('reg_city');
        setModalVisible(true);
    };

    const openRegSeriesSelection = () => {
        setModalType('reg_series');
        setModalVisible(true);
    };

    const handleSaveVehicle = async (customerDetails: { name: string; phone: string; nickname: string }) => {
        if (!selectedMake || !selectedModel || !selectedYear) {
            Alert.alert('Missing Info', 'Please select Make, Model, and Year first.');
            return;
        }

        setSavingVehicle(true);
        try {
            const payload = {
                vin,
                reg_city: regCity?.id || '',
                reg_series: regSeries?.id || '',
                reg_number1: regNum1 ? parseInt(regNum1) : null,
                reg_number2: regNum2 ? parseInt(regNum2) : null,
                make_id: selectedMake.id,
                make_name: selectedMake.name,
                model_id: selectedModel.id,
                model_name: selectedModel.name,
                year: selectedYear.year,
                engine: selectedEngine ? selectedEngine.name : '',
                customer_name: customerDetails.name,
                customer_phone: customerDetails.phone,
                nickname: customerDetails.nickname
            };

            await api.post('/saved-vehicles/', payload);

            setShowCustomerModal(false);
            Alert.alert('Success', 'Vehicle saved to My Garage!', [
                { text: 'OK', onPress: () => handleCreate() } // Auto-continue to next step
            ]);
        } catch (error) {
            console.error('Error saving vehicle:', error);
            Alert.alert('Error', 'Failed to save vehicle. Please try again.');
        } finally {
            setSavingVehicle(false);
        }
    };

    const handleSelect = (item: any) => {
        if (modalType === 'garage') {
            // Auto-fill form from saved vehicle
            setVin(item.vin || '');

            // Set Registration
            const city = BD_CITIES.find(c => c.id === item.reg_city);
            const series = BD_SERIES.find(s => s.id === item.reg_series);
            setRegCity(city || null);
            setRegSeries(series || null);
            setRegNum1(item.reg_number1 ? item.reg_number1.toString() : '');
            setRegNum2(item.reg_number2 ? item.reg_number2.toString() : '');

            // Set Vehicle Info (We just set the selected objects manually since we trust the saved data)
            setSelectedMake({ id: item.make_id, name: item.make_name });
            setSelectedModel({ id: item.model_id, name: item.model_name });
            setSelectedYear({ year: item.year });
            setSelectedEngine(item.engine ? { name: item.engine } : null); // Simple restore

        } else if (modalType === 'make') {
            setSelectedMake(item);
            setSelectedModel(null);
            setSelectedYear(null);
            setSelectedEngine(null);
        } else if (modalType === 'model') {
            setSelectedModel(item);
            setSelectedYear(null);
            setSelectedEngine(null);
        } else if (modalType === 'engine') {
            setSelectedEngine(item);
        } else if (modalType === 'year') {
            setSelectedYear(item);
        } else if (modalType === 'reg_city') {
            setRegCity(item);
        } else if (modalType === 'reg_series') {
            setRegSeries(item);
        }
        setModalVisible(false);
    };

    const handleCreate = async () => {
        // Validation: Must have either VIN OR (Make + Model + Year)
        // Engine is optional in validation for now to avoid blocking legacy, but strongly encouraged by UI flow.
        if (!vin && (!selectedMake || !selectedModel || !selectedYear)) {
            Alert.alert("Missing Info", "Please enter VIN or select Make, Model, and Year");
            return;
        }

        // Don't create RFQ yet - just pass vehicle data to AddItem screen
        // RFQ will be created when first part is added
        navigation.navigate('AddItem', {
            vehicleData: {
                vin,
                reg_city: regCity?.id || '',
                reg_series: regSeries?.id || '',
                reg_number1: regNum1 ? parseInt(regNum1) : null,
                reg_number2: regNum2 ? parseInt(regNum2) : null,
                make_id: selectedMake?.id,
                model_id: selectedModel?.id,
                year: selectedYear?.year,
                make_name: selectedMake?.name,
                model_name: selectedModel?.name,
                trim,
                engine: selectedEngine?.name || ''
            }
        });
    };

    const getModalItems = () => {
        switch (modalType) {
            case 'make': return makes;
            case 'model': return models;
            case 'engine': return engines;
            case 'year': return years;
            case 'reg_city': return BD_CITIES;
            case 'reg_series': return BD_SERIES;
            case 'garage': return garageVehicles;
            default: return [];
        }
    };

    const getDisplayKey = () => {
        if (modalType === 'year') return 'year';
        if (modalType === 'engine') return 'name';
        if (modalType === 'garage') return 'registration_display';
        return 'name';
    };

    const getModalTitle = () => {
        switch (modalType) {
            case 'make': return 'Select Make';
            case 'model': return 'Select Model';
            case 'engine': return 'Select Engine';
            case 'year': return 'Select Year';
            case 'reg_city': return 'Select City';
            case 'reg_series': return 'Select Series';
            case 'garage': return 'Select from My Garage';
            default: return 'Select';
        }
    };

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    {/* Header with Close Button */}
                    <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                        <View>
                            <Text className="text-black text-2xl font-bold">Vehicle Details</Text>
                            <Text className="text-gray-500 text-sm">Enter vehicle info to start request.</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-gray-100 p-2 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-6 pt-4">
                        <View className="mb-6">
                            {/* Select from Garage Button */}
                            <TouchableOpacity
                                onPress={openGarageSelection}
                                className="bg-gray-100 border border-gray-200 p-4 rounded-xl flex-row items-center justify-center mb-2"
                            >
                                <Ionicons name="car-sport" size={20} color="black" />
                                <Text className="ml-2 text-black font-bold">Select from My Garage</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-4">
                            {/* Make - Selection */}
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Make</Text>
                                <TouchableOpacity
                                    onPress={openMakeSelection}
                                    className="bg-gray-50 border border-gray-200 flex-row items-center justify-between p-4 rounded-xl"
                                >
                                    <Text className={`text-lg font-semibold ${selectedMake ? 'text-black' : 'text-gray-400'}`}>
                                        {selectedMake ? selectedMake.name : 'Select Make'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            {/* Model - Selection */}
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Model</Text>
                                <TouchableOpacity
                                    onPress={openModelSelection}
                                    className={`bg-gray-50 border border-gray-200 flex-row items-center justify-between p-4 rounded-xl ${!selectedMake ? 'opacity-50' : ''}`}
                                    disabled={!selectedMake}
                                >
                                    <Text className={`text-lg font-semibold ${selectedModel ? 'text-black' : 'text-gray-400'}`}>
                                        {selectedModel ? selectedModel.name : 'Select Model'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            {/* Engine - Selection */}
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Engine</Text>
                                <TouchableOpacity
                                    onPress={openEngineSelection}
                                    className={`bg-gray-50 border border-gray-200 flex-row items-center justify-between p-4 rounded-xl ${!selectedModel ? 'opacity-50' : ''}`}
                                    disabled={!selectedModel}
                                >
                                    <Text className={`text-lg font-semibold ${selectedEngine ? 'text-black' : 'text-gray-400'}`}>
                                        {selectedEngine ? selectedEngine.name : 'Select Engine'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row gap-4">
                                {/* Year - Selection */}
                                <View className="flex-1">
                                    <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Year</Text>
                                    <TouchableOpacity
                                        onPress={openYearSelection}
                                        className={`bg-gray-50 border border-gray-200 flex-row items-center justify-between p-4 rounded-xl ${!selectedModel ? 'opacity-50' : ''}`}
                                        disabled={!selectedModel}
                                    >
                                        <Text className={`text-lg font-semibold ${selectedYear ? 'text-black' : 'text-gray-400'}`}>
                                            {selectedYear ? selectedYear.year : 'YYYY'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                                {/* Trim - Free Text */}
                                <View className="flex-[1.5]">
                                    <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Trim (Optional)</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 text-black p-4 rounded-xl text-lg font-semibold"
                                        placeholder="e.g. XLE"
                                        placeholderTextColor="#9CA3AF"
                                        value={trim}
                                        onChangeText={setTrim}
                                    />
                                </View>
                            </View>

                            {/* VIN */}
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">VIN (Optional)</Text>
                                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                    <Ionicons name="barcode-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                                    <TextInput
                                        className="flex-1 text-black font-semibold text-lg h-10"
                                        placeholder="Scan or Type VIN"
                                        placeholderTextColor="#9CA3AF"
                                        value={vin}
                                        onChangeText={setVin}
                                        autoCapitalize="characters"
                                    />
                                    <TouchableOpacity>
                                        <Ionicons name="camera-outline" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Registration Number */}
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Registration Number (Optional)</Text>

                                {/* City Selection */}
                                <TouchableOpacity
                                    onPress={openRegCitySelection}
                                    className="bg-gray-50 border border-gray-200 flex-row items-center justify-between p-4 rounded-xl mb-3"
                                >
                                    <Text className={`text-lg font-semibold ${regCity ? 'text-black' : 'text-gray-400'}`}>
                                        {regCity ? regCity.name : 'Select City (e.g. DHAKA METRO)'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* Series and Numbers Row */}
                                <View className="flex-row gap-2">
                                    {/* Series */}
                                    <TouchableOpacity
                                        onPress={openRegSeriesSelection}
                                        className="flex-[1.5] bg-gray-50 border border-gray-200 justify-center px-3 py-3 rounded-xl"
                                    >
                                        <Text className={`font-semibold ${regSeries ? 'text-black' : 'text-gray-400'}`} numberOfLines={1}>
                                            {regSeries ? regSeries.id : 'Series'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Number 1 (e.g. 13) */}
                                    <TextInput
                                        className="flex-1 bg-gray-50 border border-gray-200 text-black px-3 py-3 rounded-xl text-center font-semibold"
                                        placeholder="13"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={regNum1}
                                        onChangeText={setRegNum1}
                                    />

                                    {/* Number 2 (e.g. 4545) */}
                                    <TextInput
                                        className="flex-[1.5] bg-gray-50 border border-gray-200 text-black px-3 py-3 rounded-xl text-center font-semibold"
                                        placeholder="4545"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        value={regNum2}
                                        onChangeText={setRegNum2}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Save Vehicle Option */}
                        {(vin || (regCity && regSeries && regNum2)) && (
                            <TouchableOpacity
                                onPress={() => setShowCustomerModal(true)}
                                className="mt-8 flex-row items-center justify-center bg-gray-100 p-4 rounded-xl border border-gray-200"
                            >
                                <Ionicons name="save-outline" size={20} color="black" />
                                <Text className="ml-2 text-black font-bold text-base">Save Vehicle to My Garage</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className={`bg-black p-4 rounded-xl items-center mt-10 shadow-lg ${loading ? 'opacity-70' : ''}`}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            <Text className="text-white font-bold text-lg">Continue to Parts</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>

                <SelectionModal
                    visible={modalVisible}
                    title={getModalTitle()}
                    items={getModalItems()}
                    loading={listLoading}
                    onClose={() => setModalVisible(false)}
                    onSelect={handleSelect}
                    displayKey={getDisplayKey()}
                />

                <CustomerDetailsModal
                    visible={showCustomerModal}
                    onClose={() => setShowCustomerModal(false)}
                    onSave={handleSaveVehicle}
                    loading={savingVehicle}
                />
            </SafeAreaView>
        </View>
    );
}
