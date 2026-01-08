import React from 'react';
import { View, Text, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServicesScreen() {
    return (
        <LinearGradient colors={['#0f172a', '#020617']} className="flex-1">
            <StatusBar barStyle="light-content" />
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text className="text-4xl mb-4">🛠️</Text>
                <Text className="text-white font-bold text-2xl mb-2">Services</Text>
                <Text className="text-slate-400 text-center px-10">Coming soon. This is where you can find additional services.</Text>
            </SafeAreaView>
        </LinearGradient>
    );
}
