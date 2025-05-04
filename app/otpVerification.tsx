import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerification = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Retrieve email from AsyncStorage
    const fetchEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          Alert.alert('Error', 'No email found. Redirecting to Register.');
          router.push('/register');
        }
      } catch (error) {
        console.error('Error retrieving email:', error);
        Alert.alert('Error', 'An error occurred while retrieving the email.');
        router.push('/register');
      }
    };

    fetchEmail();
    animateOpacity();
  }, []);

  const animateOpacity = () => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Alert.alert('Validation Error', 'Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        'https://finalccspayment.onrender.com/api/auth/verify-otpmobile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: enteredOtp }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'OTP verified successfully.');
        await AsyncStorage.removeItem('userEmail'); // Remove email after verification
        router.push('/login'); // Redirect to login
      } else {
        Alert.alert('Error', data.msg || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        'https://finalccspayment.onrender.com/api/auth/resend-otpmobile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'OTP resent successfully. Please check your email.');
      } else {
        Alert.alert('Error', data.msg || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Automatically focus on the next input if the user types a number
    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: animatedOpacity }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/ccsdeptlogo.png')}
          style={styles.logo}
        />
        <Text style={styles.collegeText}>College Of Computing Studies</Text>
      </View>
      <Text style={styles.title}>Verify OTP</Text>
      {email && (
        <Text style={styles.subtitle}>
          An OTP has been sent to your email: {email}
        </Text>
      )}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)} // Assign ref properly
            style={styles.otpInput}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(text) => handleInputChange(text, index)}
          />
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.link}
        onPress={handleResendOtp}
        disabled={isSubmitting}
      >
        <Text style={styles.linkText}>Click here to send an OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push('/register')}
        disabled={isSubmitting}
      >
        <Text style={styles.linkText}>Back to Register</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1B3A28', // Dark green background
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // Makes the image circular (half the width/height)
    overflow: 'hidden', // Ensures the image respects the borderRadius
},

  collegeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#d0d0d0',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    width: 50,
    height: 50,
    backgroundColor: '#f9f9f9',
    color: '#000000',
  },
  button: {
    backgroundColor: '#028a0f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#a1f2a1',
    fontSize: 14,
  },
});

export default OtpVerification;
