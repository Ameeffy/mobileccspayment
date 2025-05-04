import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoreOptions = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade-in animation

  useEffect(() => {
    // Start fade-in animation on screen load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              Alert.alert('Logged out successfully!');
              router.push('/login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Logout failed. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>More Options</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/profile')}>
        <MaterialIcons name="account-circle" size={24} color="darkgreen" />
        <Text style={styles.buttonText}>My Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/AboutUs')}>
        <MaterialIcons name="info" size={24} color="darkgreen" />
        <Text style={styles.buttonText}>About Us</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/TermsAndConditions')}>
        <MaterialIcons name="gavel" size={24} color="darkgreen" />
        <Text style={styles.buttonText}>Terms and Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/PrivacyStatement')}>
        <MaterialIcons name="privacy-tip" size={24} color="darkgreen" />
        <Text style={styles.buttonText}>Privacy Statement</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="exit-to-app" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 16,
    padding: 10,
    backgroundColor: '#004d00',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#d32f2f',
    borderRadius: 5,
    marginTop: 20,
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MoreOptions;
