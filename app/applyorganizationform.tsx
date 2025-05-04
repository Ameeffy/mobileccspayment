import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';  // Import useRoute from React Navigation
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';  // Import Picker from react-native-picker

const ApplyOrganizationForm = () => {
  const router = useRouter();
  const route = useRoute();  // Use useRoute to get params
  const { userId, firstName, lastName, organizationId } = route.params as {
    userId: number;
    firstName: string;
    lastName: string;
    organizationId: number;
  };

  const [position, setPosition] = useState('');

  const handleApply = async () => {
    if (!position || !userId || !organizationId) {
      Alert.alert('Error', 'Please select a position');
      return;
    }

    try {
      const response = await fetch('https://utterly-stable-arachnid.ngrok-free.app/api/auth/apply-for-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          organization_id: organizationId,
          position: position,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'You have successfully applied to the organization!');
        router.push('/ccspaymenthome');// Redirect to the home screen or another relevant screen
      } else {
        Alert.alert('Error', 'Failed to apply for the organization');
      }
    } catch (error) {
      console.error('Error applying for organization:', error);
      Alert.alert('Error', 'An error occurred while applying for the organization');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply to {firstName} {lastName}'s Organization</Text>

      {/* Label for Position */}
      <Text style={styles.subtitle}>Select Position</Text>

      {/* Picker for position selection */}
      <Picker
  selectedValue={position}
  onValueChange={(itemValue) => setPosition(itemValue)}
  style={styles.picker}
  dropdownIconColor="white"  // Optional: to change the dropdown icon color
  itemStyle={{ fontSize: 16, color: 'black' }}  // Set font size and label color to black
>
  <Picker.Item label="Select Position" value="" />
  <Picker.Item label="President" value="President" />
  <Picker.Item label="Vice President" value="Vice President" />
  <Picker.Item label="Secretary" value="Secretary" />
  <Picker.Item label="Treasurer" value="Treasurer" />
  <Picker.Item label="Member" value="Member" />
  {/* Add more positions as needed */}
</Picker>

      {/* Apply Button */}
      <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Submit Application</Text>
      </TouchableOpacity>
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
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',  // Label color set to black
    fontWeight: 'bold',
  },
  picker: {
    height: '50%',
    width: '100%',
    color: 'white',
  },
  applyButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ApplyOrganizationForm;
