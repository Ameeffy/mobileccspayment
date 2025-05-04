import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [idnumber, setIdnumber] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const loadCooldownState = async () => {
      const cooldownEndTime = await AsyncStorage.getItem('cooldownEndTime');
      if (cooldownEndTime) {
        const remainingTime = Math.max(
          0,
          Math.floor(
            (new Date(cooldownEndTime).getTime() - new Date().getTime()) / 1000
          )
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

  const handleCooldown = async () => {
    const cooldownDuration = 30; // 30 seconds
    const cooldownEndTime = new Date(new Date().getTime() + cooldownDuration * 1000);
    await AsyncStorage.setItem('cooldownEndTime', cooldownEndTime.toISOString());

    startCooldownTimer(cooldownDuration);
  };

  const handleSubmit = async () => {
    if (isCooldown) {
      Alert.alert('Cooldown Active', 'Please wait before trying again.');
      return;
    }

    try {
      const response = await fetch(
        'https://finalccspayment.onrender.com/api/auth/verifyUser',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'OTP sent to your email.');
        router.push({ pathname: '/passwordchangeuserotp', params: { email } });
      } else {
        setFailedAttempts((prev) => prev + 1);
        Alert.alert('Error', data.msg);

        if (failedAttempts + 1 >= 5) {
          handleCooldown();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal for Instructions */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Welcome!</Text>
            <Text style={styles.modalText}>
              Please provide your WMSU email to proceed with password recovery.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.header}>Forgot Password</Text>

      

      {/* Email Input */}
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


      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, isCooldown && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isCooldown}
      >
        <Text style={styles.verifyButtonText}>
          {isCooldown ? `Try again in ${cooldownTime}s` : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1B3A28',
  },
  header: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  verifyButton: {
    backgroundColor: '#004d00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d00',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#004d00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
