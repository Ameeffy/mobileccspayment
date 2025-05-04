import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ApplyOrganization = () => {
  const [userData, setUserData] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      router.push('/'); // Redirect to login if no token is found
      return;
    }
    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data); // Store the user data (first name, last name, and id)
    } catch (error) {
      console.error('Error:', error);
      router.push('/');
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/organizations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data); // Store the organizations data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrganizations();
  }, []);

  const handleApply = (organizationId: number) => {
    // Ensure userData is available before navigating
    if (userData) {
      router.push({
        pathname: '/applyorganizationform', // Navigate to the Apply Organization Form page
        params: {
          userId: userData.id,
          firstName: userData.firstname,
          lastName: userData.lastname,
          organizationId: organizationId,
        },
      });
    }
  };
  
  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Apply to an Organization</Text>

      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <>
          <Text style={styles.subtitle}>User: {userData?.firstname} {userData?.lastname}</Text>
          <FlatList
            data={organizations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.organizationContainer}>
                <Text style={styles.organizationName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleApply(item.id)} style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  organizationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  organizationName: {
    fontSize: 18,
  },
  applyButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ApplyOrganization;
