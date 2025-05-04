import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPasswordOTPVerified = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 boxes
    const [attempts, setAttempts] = useState(0);
    const inputRefs = useRef<Array<TextInput | null>>([]); // References to input fields

    // Function to handle OTP input changes
    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // Allow only numeric input

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Automatically move to the next input box if a number is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // If the last digit is entered, attempt verification
        if (index === 5 && value) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    // Function to verify OTP
    const handleVerifyOTP = async (otpValue: string) => {
        if (attempts >= 5) {
            Alert.alert('Too many incorrect attempts.', 'Redirecting to Forgot Password.');
            router.push('/forgotpassword');
            return;
        }

        try {
            const response = await fetch('https://finalccspayment.onrender.com/api/auth/forgotpasswordotpverified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'OTP Verified');
                await AsyncStorage.setItem('userToken', data.token);
                router.push('/passwordchangeuser');
            } else {
                setAttempts(prev => prev + 1);
                Alert.alert('Error', data.msg);
                if (attempts + 1 >= 5) {
                    router.push('/forgotpassword');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    // Function to resend OTP
    const handleResendOTP = async () => {
        try {
            const response = await fetch('https://finalccspayment.onrender.com/api/auth/forgotpasswordresend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'OTP Resent. Check your email.');
            } else {
                Alert.alert('Error', data.msg);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Enter OTP</Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
                                inputRefs.current[index - 1]?.focus();
                            }
                        }}
                    />
                ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity style={styles.button} onPress={() => handleVerifyOTP(otp.join(''))}>
                <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>

            {/* Resend OTP Button */}
            <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
                <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#1B3A28', alignItems: 'center' },
    header: { fontSize: 24, color: 'white', textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
    otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    otpInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        fontSize: 18,
        textAlign: 'center',
        width: 40,
        height: 50,
        marginHorizontal: 5,
    },
    button: { backgroundColor: '#004d00', padding: 12, borderRadius: 8, alignItems: 'center', width: '80%' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    resendButton: { marginTop: 15 },
    resendButtonText: { color: '#ffcc00', fontSize: 16 },
});

export default ForgotPasswordOTPVerified;
