import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setUserData(data);
    } catch (error) {
      console.error('Error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserData();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateStatus = (id: number) => {
    router.push(`/profileStatus?id=${id}`);
  };

  const handleApplyOrganization = () => {
    router.push('/applyorganization'); // Navigate to ApplyOrganization screen
  };

  const handleChangePassword = () => {
    router.push('/ChangePasswordScreenCurrent');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.topIcons}>
        
          {(userData?.status === 'Pending' || userData?.status === 'Not Enrolled' || userData?.status === 'Declined') && (
            <TouchableOpacity onPress={() => handleUpdateStatus(userData?.id)} style={styles.iconButton}>
              <MaterialIcons name="update" size={24} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleChangePassword} style={styles.iconButton}>
            <MaterialIcons name="lock" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>User Profile</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : userData ? (
        <ScrollView contentContainerStyle={styles.userDetails}>
          <View style={styles.detailContainer}>
            <MaterialIcons name="person" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.username}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="email" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.email}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="badge" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.idnumber}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="school" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.department} | {userData.course}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="view-agenda" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.section}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="person-outline" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.firstname} {userData.middlename} {userData.lastname}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="phone" size={24} color="#004d00" />
            <Text style={styles.detailText}>{userData.contactnumber}</Text>
          </View>
          <View style={styles.detailContainer}>
            <MaterialIcons name="wc" size={24} color="#004d00" />
            <Text style={styles.detailText}> {userData.gender}</Text>
          </View>
          
          
          <View style={styles.detailContainer}>
            <MaterialIcons name="check-circle" size={24} color="#004d00" />
            <Text style={styles.detailText}>Status: {userData.status}</Text>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.errorText}>Error fetching user data</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#004d00',
    borderRadius: 20,  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004d00',
    borderRadius: 20,
  },
  iconButton: {
    
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  userDetails: {
    paddingVertical: 10,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 6,
    
  },
  
  loadingText: {
    textAlign: 'center',
    color: 'white',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
  },
});

export default ProfileScreen;
