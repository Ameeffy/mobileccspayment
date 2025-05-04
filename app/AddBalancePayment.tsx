import React, { useState, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, Alert, ScrollView, TouchableOpacity,ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const AddBalancePayment = () => {
  const router = useRouter();
  const route = useRoute();
  const { transactionId } = route.params as { transactionId: number }; // Get transactionId from params

  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImagePromissory, setSelectedImagePromissory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // https://finalccspayment.onrender.com/
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setError('User token is missing. Please log in again.');
          return;
        }

        const response = await fetch('https://finalccspayment.onrender.com/api/auth/get-payment-detailsBalance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            transactionId, // Pass the transactionId to the API
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Failed to fetch transaction details');
          return;
        }

        const data = await response.json();
        setTransaction(data); // Store the fetched transaction data
      } catch (error) {
        setError('Error fetching transaction details');
        console.error(error);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const handleSelectImagePromissory = async () => {
    try {
      // Request permission to access media library and camera
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  
      if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
        alert('Permissions to access camera and media library are required!');
        return;
      }
  
      // Provide options to the user: Select from Library or Take a Photo
      Alert.alert(
        'Upload Promissory Note',
        'Choose an option',
        [
          {
            text: 'Camera now',
            onPress: async () => {
              const cameraResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Optional: allow users to edit before saving
                quality: 1,           // Keep the highest quality
              });
  
              if (!cameraResult.canceled) {
                setSelectedImagePromissory(cameraResult.assets[0].uri);
                console.log(cameraResult.assets[0].uri);
              }
            },
          },
          {
            text: 'Album Library',
            onPress: async () => {
              const libraryResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Optional: allow users to edit before saving
                quality: 1,           // Keep the highest quality
              });
  
              if (!libraryResult.canceled) {
                setSelectedImagePromissory(libraryResult.assets[0].uri);
                console.log(libraryResult.assets[0].uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error selecting promissory note image:', error);
      alert('An error occurred while selecting an image.');
    }
  };
  

  const handleSubmit = async () => {
    if (!selectedImagePromissory) {
      Alert.alert('Missing image', 'Please upload the promissory note.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        return;
      }
      

      const formData = new FormData();

      formData.append('transaction_id', transaction.transaction_id); // Use the existing transaction_id
      formData.append('payment_id', transaction.payment_id); // Add payment_id if required

      
      if (selectedImagePromissory) {
        formData.append('promissory_note', {
          uri: selectedImagePromissory,
          name: `payment_promissory_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/update-transaction-balance', {
        method: 'POST',
        headers: {
          
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to submit');
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      Alert.alert('Success', 'Promissory Upload successfully.');
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while submitting payment details.');
      console.error(error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!transaction) {
    return <Text>Loading...</Text>;
  }

  const handleAddBalancePayment = (transactionId: number) => {
    router.push(`/AddBalancePaymentProof?transactionId=${transactionId}`);
  };

  return (
    <ScrollView style={styles.container}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="green" />
      </TouchableOpacity>
  <Text style={styles.header}>Transaction Details</Text>
  <Text style={styles.label}><Text style={styles.value}>{transaction.semester_name}</Text></Text>
      <Text style={styles.label}><Text style={styles.value}>{transaction.organization_name}</Text></Text>
      <Text style={styles.label}><Text style={styles.value}>{transaction.transaction_id}</Text></Text>
      <Text style={styles.label}>Amount Paid: <Text style={styles.value}>₱{transaction.total_amount}</Text></Text>
      <Text style={styles.label}>Status: <Text style={styles.values}>{transaction.payment_status}</Text></Text>
      <Text style={styles.label}>Balance: <Text style={styles.values}>{transaction.balance}</Text></Text>

      {transaction.promissory_note ? (
        <>
          <Text style={styles.text}>Promissory Note Uploaded</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => handleAddBalancePayment(transaction.transaction_id)}>
            <Text style={styles.loginButtonText}>Payment Balance</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={handleSelectImagePromissory}>
            <Text style={styles.loginButtonText}>Upload Promissory Note</Text>
          </TouchableOpacity>
          <View>
  <Text style={styles.previewText}>
    {selectedImagePromissory ? "Image Selected:" : "No image selected yet."}
  </Text>
  {selectedImagePromissory ? (
    <Image source={{ uri: selectedImagePromissory }} style={styles.image} />
  ) : (
    <Text style={styles.noImageText}>Please upload or capture an image.</Text>
  )}
</View>
<TouchableOpacity 
  style={[styles.loginButton, isSubmitting && styles.disabledButton]} 
  onPress={handleSubmit} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <Text style={styles.loginButtonText}>Submit Promissory Notes</Text>
  )}
</TouchableOpacity>

        </>
      )}
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#004d00', // Ensure disabled button is dark green
    opacity: 0.6, // Slight transparency to indicate disabled state
  },
  
  
  noImageText: {
    color: '#aaa', // Light gray for subtle message
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#aaa', // Dark text for readability
    marginBottom: 8,
    textAlign: 'center',
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
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 16,
    
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: 'white',
  },
  value: {
    fontWeight: 'normal',
    color: 'white',
    alignSelf: 'center',
  },
  values: {
    fontWeight: 'bold',
    color: 'red',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: 'white', // A subtle color for the message
    textAlign: 'center', 
    marginBottom: 10,
    fontStyle: 'italic', // Makes the text italic
}
,
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
    alignSelf: 'center',
  },
  
});

export default AddBalancePayment;
