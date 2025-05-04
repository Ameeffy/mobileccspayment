import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const CurrentPasswordScreen = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secureText, setSecureText] = useState(true);

    const togglePasswordVisibility = () => {
      setSecureText(!secureText); // Toggle the password visibility
  };

    const handleValidatePassword = async () => {
        if (!currentPassword) {
            Alert.alert('Validation Error', 'Please enter your current password.');
            return;
        }

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'User not authenticated. Please log in again.');
                router.push('/');
                return;
            }

            const response = await fetch(
                'https://finalccspayment.onrender.com/api/auth/validate-current-password',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ currentPassword }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', data.msg || 'Validation failed.');
                setLoading(false);
                return;
            }

            Alert.alert('Success', 'Current password validated.');
            router.push('/ChangePasswordScreen'); // Navigate to the password change screen
        } catch (error) {
            console.error('Error validating password:', error);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
      
      <View style={styles.container}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Current Password</Text>
      <View style={styles.inputContainer}>
          {/* Input field */}
          <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry={secureText}
              value={currentPassword}
              onChangeText={setCurrentPassword}
          />
          {/* Eye icon to toggle password visibility */}
          <TouchableOpacity style={styles.icon} onPress={togglePasswordVisibility}>
              <MaterialIcons
                  name={secureText ? 'visibility-off' : 'visibility'}
                  size={24}
                  color="#7f8c8d"
              />
          </TouchableOpacity>
      </View>
      {/* Padlock icon to indicate security */}
      <View style={styles.padlockIconContainer}>
          <MaterialIcons name="lock" size={24} color="#7f8c8d" />
      </View>
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleValidatePassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {loading ? 'Validating...' : 'Submit'}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdfe1',
    marginBottom: 16,
},
input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingLeft: 10,
    color: 'white',
},
icon: {
    position: 'absolute',
    right: 10,
},
padlockIconContainer: {
    alignItems: 'center',
    marginTop: 10,
},
  button: {
    backgroundColor: '#004d00', // Green background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
},
buttonDisabled: {
    backgroundColor: '#95a5a6', // Greyed-out button when loading
},
buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'normal',
},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1B3A28', // Dark background color
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
    
});

export default CurrentPasswordScreen;
