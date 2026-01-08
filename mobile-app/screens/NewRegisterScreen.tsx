import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NewRegisterScreen({ navigation }: any) {
    const [step, setStep] = useState(1); // 1 = Account Info, 2 = Role Selection, 3 = Documents
    const [role, setRole] = useState(''); // 'workshop' or 'supplier'

    // Account Info Fields
    const [workshopName, setWorkshopName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [thana, setThana] = useState('');
    const [postCode, setPostCode] = useState('');

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2 && role) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const RoleSelectionScreen = () => (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Register</Text>

            <TouchableOpacity
                style={[styles.roleButton, role === 'workshop' && styles.roleButtonSelected]}
                onPress={() => setRole('workshop')}
            >
                <Text style={[styles.roleButtonText, role === 'workshop' && styles.roleButtonTextSelected]}>
                    Register as Workshop/Repairer
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.roleButton, role === 'supplier' && styles.roleButtonSelected]}
                onPress={() => setRole('supplier')}
            >
                <Text style={[styles.roleButtonText, role === 'supplier' && styles.roleButtonTextSelected]}>
                    Register as Vendor/Supplier
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.continueButton, !role && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={!role}
            >
                <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );

    const AccountInfoScreen = () => (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Register as {role === 'workshop' ? 'Repairer' : 'Supplier'}</Text>
            <Text style={styles.subtitle}>Account Information</Text>

            <TextInput
                style={styles.input}
                placeholder="Workshop Name"
                value={workshopName}
                onChangeText={setWorkshopName}
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <View style={styles.phoneContainer}>
                <Text style={styles.phonePrefix}>+880</Text>
                <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="Phone No"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                />
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="District"
                    value={district}
                    onChangeText={setDistrict}
                />
            </View>

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Thana"
                    value={thana}
                    onChangeText={setThana}
                />
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Post Code"
                    value={postCode}
                    onChangeText={setPostCode}
                    keyboardType="number-pad"
                />
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const DocumentsScreen = () => (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Register as {role === 'workshop' ? 'Repairer' : 'Supplier'}</Text>
            <Text style={styles.subtitle}>Required Documents</Text>
            <Text style={styles.subtitleSmall}>JPG, PNG, PDF - Max 1 MB</Text>

            <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Trade License</Text>
                <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Browse File</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>National ID</Text>
                <View style={styles.uploadRow}>
                    <TouchableOpacity style={[styles.uploadButton, styles.halfButton]}>
                        <Text style={styles.uploadButtonText}>Front Side</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.uploadButton, styles.halfButton]}>
                        <Text style={styles.uploadButtonText}>Back Side</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Proof of Address</Text>
                <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Electricity/Gas/Water Bill</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );

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
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                        <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
                    </View>
                </View>

                {/* Content */}
                {step === 2 && <RoleSelectionScreen />}
                {step === 1 && <AccountInfoScreen />}
                {step === 3 && <DocumentsScreen />}
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
        paddingTop: 40,
        paddingBottom: 20,
    },
    logoText: {
        fontSize: 30,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    },
    stepIndicator: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00000030',
    },
    stepDotActive: {
        backgroundColor: '#000000',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    subtitleSmall: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        marginBottom: 12,
        color: '#000000',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    phonePrefix: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        marginBottom: 0,
    },
    roleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 16,
    },
    roleButtonSelected: {
        borderColor: '#000000',
        backgroundColor: '#F5F5F5',
    },
    roleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666666',
    },
    roleButtonTextSelected: {
        color: '#000000',
    },
    continueButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    backButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 30,
    },
    backButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadSection: {
        marginBottom: 20,
    },
    uploadLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    uploadButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    },
    uploadRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfButton: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
