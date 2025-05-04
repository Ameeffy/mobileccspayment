import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  
  useEffect(() => {
    const loadCooldownState = async () => {
      const cooldownEndTime = await AsyncStorage.getItem('cooldownEndTime');
      if (cooldownEndTime) {
        const remainingTime = Math.max(
          0,
          Math.floor((new Date(cooldownEndTime).getTime() - new Date().getTime()) / 1000)
        );
        if (remainingTime > 0) {
          setIsCooldown(true);
          setCooldownTime(remainingTime);
          startCooldownTimer(remainingTime);
        } else {
          await AsyncStorage.removeItem('cooldownEndTime');
        }
      }
    };

    loadCooldownState();
  }, []);

  // Start the cooldown timer
  const startCooldownTimer = (time: number) => {
    setIsCooldown(true);
    setCooldownTime(time);

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCooldown(false);
          setFailedAttempts(0);
          AsyncStorage.removeItem('cooldownEndTime');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle login button clicks
  const handleLogin = async () => {
    if (isCooldown) {
      Alert.alert('You are in cooldown. Please wait before trying again.');
      return;
    }

    if (failedAttempts >= 5) {
      handleCooldown();
      Alert.alert('Too many failed attempts. You are now in cooldown.');
      return;
    }

    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        Alert.alert('Login successful!');
        router.push('/ccspaymenthome');
      } else {
        setFailedAttempts((prev) => prev + 1);
        Alert.alert(data.msg || 'Login failed');
        if (failedAttempts + 1 >= 5) {
          handleCooldown();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Start the cooldown
  const handleCooldown = async () => {
    const cooldownDuration = 60; // 30 seconds
    const cooldownEndTime = new Date(new Date().getTime() + cooldownDuration * 1000);
    await AsyncStorage.setItem('cooldownEndTime', cooldownEndTime.toISOString());
    startCooldownTimer(cooldownDuration);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logo} />
      </View>

      {/* Header Text */}
      <Text style={styles.header}>College of Computing Studies</Text>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#004d00" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#004d00" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#004d00"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {isCooldown && <Text style={styles.cooldownText}>Please wait {cooldownTime}s</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 14,
    backgroundColor: '#1B3A28',
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 16,
    padding: 10,
    backgroundColor: '#004d00',
    borderRadius: 40,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 120,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'normal',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 16,
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#004d00',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'normal',
  },
  forgotPassword: {
    marginTop: 12,
    color: '#004d00',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  cooldownText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoginScreen;
