import React, { useState, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
  const [selectedImageProof, setSelectedImageProof] = useState<string | null>(null);
  const [paymentQrcode, setPaymentQrcode] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transaction details from the API
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

  const handleSelectImageProof = async () => {
    try {
      // Request permissions for media library and camera
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  
      if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
        alert('Permissions to access camera and media library are required!');
        return;
      }
  
      // Provide options to the user: Select from Library or Take a Photo
      Alert.alert(
        'Upload Proof of Payment',
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
                setSelectedImageProof(cameraResult.assets[0].uri);
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
                setSelectedImageProof(libraryResult.assets[0].uri);
                console.log(libraryResult.assets[0].uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error selecting image proof:', error);
      alert('An error occurred while selecting proof of payment.');
    }
  };
  

  const handleSubmit = async () => {
    if (!selectedImageProof) {
      Alert.alert('Missing image', 'Please upload the promissory note.');
      return;
    }
    setIsSubmitting(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('transaction_id', transaction.transaction_id); // Use the existing transaction_id
      formData.append('payment_id', transaction.payment_id); // Add payment_id if required

      // Append promissory note image if selected
      if (selectedImageProof) {
        formData.append('proof_of_payment', {
          uri: selectedImageProof,
          name: `payment_proof_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/update-transaction-balanceProof', {
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
      Alert.alert('Success', 'Thank you, we are gonna review your payment.');
      router.push('/ccspaymenthome');
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

  return (
    <ScrollView style={styles.container}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
  {infoModalVisible && (
  <View style={styles.infoModal}>
    <View style={styles.infoModalContent}>
      <Text style={styles.infoModalTitle}>Payment Instructions</Text>
      <Text style={styles.infoModalText}>
      Please scan the QR code to pay the remaining balance. After payment, upload your proof of payment. Thank you!
      </Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setInfoModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
)} 
   <Text style={styles.label}><Text style={styles.value}>{transaction.semester_name}</Text></Text>
   <Text style={styles.label}><Text style={styles.value}>{transaction.organization_name}</Text></Text>
   <Text style={styles.label}>Total to pay :<Text style={styles.values}>{transaction.balance}</Text></Text>


  {transaction.qrcode_picture && (
        <Image source={{ uri: transaction.qrcode_picture }} style={styles.qrcodeImage} />
    )}
  
  
 
  <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleSelectImageProof}>
                <Text style={styles.buttonText}>Upload Proof of Payment</Text>
            </TouchableOpacity>
            <View>
  <Text style={styles.previewText}>
    {selectedImageProof ? "Image Selected:" : "No image selected yet."}
  </Text>
  {selectedImageProof ? (
    <Image source={{ uri: selectedImageProof }} style={styles.image} />
  ) : (
    <Text style={styles.noImageText}>Please upload or capture an image.</Text>
  )}
</View>
            <TouchableOpacity 
  style={[styles.button, isSubmitting && styles.disabledButton]} 
  onPress={handleSubmit} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <Text style={styles.buttonText}>Submit Payment Balance</Text>
  )}
</TouchableOpacity>

        </View>
    
  
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
  button: {
    backgroundColor: '#004d00',// Green background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
},
buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'normal',
},
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: 'white',
  },
  value: {
    fontWeight: 'normal',
    color: 'white',
  },
  values: {
    fontWeight: 'bold',
    color: 'red',
    marginLeft: 5,
  },  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#004d00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  infoModalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrcodeImage: {
    width: 200,
    height: 400,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 16,
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default AddBalancePayment;
