import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // Import for icons

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true); // State for loading user data
  const [userData, setUserData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/'); // Redirect to login if no token is found
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data); // Store the complete user data
    } catch (error) {
      console.error('Error:', error);
      router.push('/'); // Redirect to login if an error occurs
    } finally {
      setLoadingUserData(false); // Stop loading after fetching data
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Show confirmation dialog before submitting
    Alert.alert(
      'Confirm Password Change',
      'Are you sure you want to change your password?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Password change canceled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                router.push('/'); // Redirect to login if no token is found
                return;
              }

              const response = await fetch('https://finalccspayment.onrender.com/api/auth/change-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  newPassword, // Only new password is required
                }),
              });

              if (!response.ok) {
                const errorDetails = await response.json();
                setError(errorDetails.msg || 'Failed to update password');
              } else {
                Alert.alert('Success', 'Password changed.');
                router.push('/ccspaymenthome'); // Redirect to profile after password change
              }
            } catch (error) {
              console.error('Error:', error);
              setError('Something went wrong. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      

      {/* New Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {newPassword.length > 0 && newPassword.length < 8 && (
          <Text style={styles.errorText}>Password must be at least 8 characters</Text>
        )}
      </View>

      {/* Confirm Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <MaterialIcons
              name={showConfirmPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {confirmPassword && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      </View>

      {/* Global Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
    onPress={handleSubmit}
    disabled={loading}
    style={[styles.button, loading && styles.buttonDisabled]}
  >
    <Text style={styles.buttonText}>
      {loading ? 'Updating...' : 'Submit'}
    </Text>
  </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  welcomeText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  input: {
    width: '90%',
    padding: 10,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  loadingText: {
    color: 'white',
    marginBottom: 20,
  },
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ChangePasswordScreen;
