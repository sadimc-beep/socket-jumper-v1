import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function NewLoginScreen({ navigation }: any) {
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>SOCKET</Text>
                    <Text style={styles.logoText}>JUMPER</Text>
                </View>

                {/* Login Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Log in to Socket Jumper</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Phone/Email/Login"
                        placeholderTextColor="#999"
                        value={phoneOrEmail}
                        onChangeText={setPhoneOrEmail}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Log in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Create Account Section */}
                    <View style={styles.divider} />

                    <Text style={styles.createAccountTitle}>Create an account</Text>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>

                    <Text style={styles.privacyText}>Privacy Policy</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFD700',
    },
    content: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    logoText: {
        fontSize: 38,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        marginBottom: 16,
        color: '#000000',
    },
    loginButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    forgotPassword: {
        color: '#666666',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 30,
    },
    createAccountTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 16,
        textAlign: 'center',
    },
    registerButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    privacyText: {
        color: '#666666',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
    },
});
