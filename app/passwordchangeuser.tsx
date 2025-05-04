import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity,Alert, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PasswordChangeUserScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const router = useRouter();

  const handleNewPasswordChange = (password: string) => {
    setNewPassword(password);

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (password: string) => {
    setConfirmPassword(password);

    if (password !== newPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordError || confirmPasswordError || newPassword === '' || confirmPassword === '') {
      return;
    }

    try {
        const token = await AsyncStorage.getItem('userToken');
      

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/changePassworduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Password changed successfully');
        router.push('/login');
      } else {
        Alert.alert(data.msg || 'Error changing password');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('An error occurred while changing password');
    }
  };

  return (
    <View style={styles.container}>
      {/* Label and Input for New Password */}
      <Text style={styles.label}>New Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#004d00" style={styles.icon} /> 
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor="gray"
          value={newPassword}
          onChangeText={handleNewPasswordChange}
          secureTextEntry={!isNewPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
          <Ionicons 
            name={isNewPasswordVisible ? "eye-off" : "eye"} 
            size={20} 
            color="#004d00" 
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* Label and Input for Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#004d00" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          placeholderTextColor="gray"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!isConfirmPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
          <Ionicons 
            name={isConfirmPasswordVisible ? "eye-off" : "eye"} 
            size={20} 
            color="#004d00" 
          />
        </TouchableOpacity>
      </View>
      {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

      {/* Button to change password */}
      <TouchableOpacity 
  style={[
    styles.button,
    { backgroundColor: passwordError || confirmPasswordError ? 'gray' : '#004d00' } // Change color if error present
  ]}
  onPress={handlePasswordChange}
  disabled={!!passwordError || !!confirmPasswordError || !newPassword || !confirmPassword}
>
  <Text style={styles.buttonText}>Change Password</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#004d00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1B3A28',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 5,
    padding: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default PasswordChangeUserScreen;
