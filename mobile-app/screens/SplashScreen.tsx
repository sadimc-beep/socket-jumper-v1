import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

export default function SplashScreen({ navigation }: any) {
    useEffect(() => {
        // Navigate to login after 2 seconds
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoText}>SOCKET</Text>
                <Text style={styles.logoText}>JUMPER</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFD700', // Yellow background
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 52,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: -1,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    },
});
