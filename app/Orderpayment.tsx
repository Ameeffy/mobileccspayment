import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Button, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Orderpayment = () => {
  const router = useRouter();
  const [transactionDetails, setTransactionDetails] = useState<any | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
          return;
        }

        const response = await fetch(
          'https://finalccspayment.onrender.com/api/auth/transaction-detailsOrders',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTransactionDetails(data); // Store the fetched data
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to retrieve transaction details.');
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        Alert.alert('Error', 'An error occurred while fetching transaction details.');
      }
    };

    fetchTransactionDetails();
  }, []);

  // Handle image selection
  const handleSelectImage = async () => {
    try {

      setIsSubmitting(true); // Start loading
      // Request permissions for both media library and camera
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  
      if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
        alert('Permissions to access camera and media library are required!');
        return;
      }
  
      // Provide options to the user: Select from Library or Take a Photo
      Alert.alert(
        'Upload Image',
        'Choose an option',
        [
          {
            text: 'Camera now',
            onPress: async () => {
              const cameraResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Optional: allow editing before saving
                quality: 1,           // Keep the highest quality
              });
  
              if (!cameraResult.canceled) {
                setSelectedImage(cameraResult.assets[0].uri);
                console.log(cameraResult.assets[0].uri);
              }
            },
          },
          {
            text: 'Album Library',
            onPress: async () => {
              const libraryResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Optional: allow editing before saving
                quality: 1,           // Keep the highest quality
              });
  
              if (!libraryResult.canceled) {
                setSelectedImage(libraryResult.assets[0].uri);
                console.log(libraryResult.assets[0].uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('An error occurred while selecting an image.');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };
  

  // Handle the submission of the proof of payment
  const handleSubmitPayment = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please upload a proof of payment before submitting.');
      return;
    }

    setIsSubmitting(true); // Start loading

    const userToken = await AsyncStorage.getItem('userToken');
    const formData = new FormData();
    formData.append('order_transaction_id', transactionDetails?.order_transaction_id);
    formData.append('gcashorder_id', transactionDetails?.id);
    if (selectedImage) {
        formData.append('proof_of_payment', {
          uri: selectedImage,
          name: `payment_proof_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

    try {
      const response = await fetch(
        'https://finalccspayment.onrender.com/api/auth/update-proof-of-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Please wait for the confirmation of your orders');
        router.push('/ccspaymenthome'); // Redirect to the payment home page
      } else {
        Alert.alert('Error', data.message || 'Failed to submit proof of payment.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting proof of payment:', error);
      Alert.alert('Error', 'An error occurred while submitting the proof of payment.');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  if (!transactionDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  // Destructure the transaction details using the predefined fields for easier access
  const {
    order_transaction_id: transactionId,
    total_amount: amount,
    status,
    payment_method: paymentMethod,
    order_status: orderStatus,
    gcashnumber,
    qrcodepicture,
    id,
  } = transactionDetails;

  return (
    <ScrollView contentContainerStyle={styles.container}>
  {infoModalVisible && (
    <View style={styles.infoModal}>
      <View style={styles.infoModalContent}>
        <Text style={styles.infoModalTitle}>Payment Instructions</Text>
        <Text style={styles.infoModalText}>
          Please scan the QR code to pay the exact amount. After payment, upload your proof of payment. Thank you!
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

  <Text style={styles.title}>Payment order details</Text>

  <Text style={styles.label}>Transaction ID:</Text>
  <Text style={styles.value}>{transactionId || 'N/A'}</Text>

  <Text style={styles.label}>Amount:</Text>
  <Text style={styles.value}>{amount ? `${amount} PHP` : 'N/A'}</Text>
  
  {qrcodepicture ? (
    <View style={styles.qrContainer}>
      <Text style={styles.label}>QR Code:</Text>
      <Image source={{ uri: qrcodepicture }} style={styles.qrcodeImage} />
    </View>
  ) : (
    <Text style={styles.value}>No QR Code Available</Text>
  )}

  <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
    <Text style={styles.buttonText}>Upload Proof of Payment</Text>
  </TouchableOpacity>

  <View>
  <Text style={styles.previewText}>
    {selectedImage ? "Image Selected:" : "No image selected yet."}
  </Text>
  {selectedImage ? (
    <Image source={{ uri: selectedImage }} style={styles.image} />
  ) : (
    <Text style={styles.noImageText}>Please upload or capture an image.</Text>
  )}
</View>

<TouchableOpacity 
  style={[styles.button, isSubmitting && styles.disabledButton]} 
  onPress={handleSubmitPayment} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <Text style={styles.buttonText}>Submit Payment</Text>
  )}
</TouchableOpacity>

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
    color: '#333', // Dark text for readability
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#004d00',
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
  closeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrcodeImage: {
    width: 200,
    height: 400,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  container: {
    backgroundColor: '#1B3A28',
    flexGrow: 1,
    alignItems: 'center', // Align children to the center
    justifyContent: 'flex-start', // Align children to the top
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    color: '#ffffff',
    marginTop: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#ffffff',
  },
  
  loadingText: {
    fontSize: 18,
    color: '#cccccc',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 16,
    borderRadius: 8,
},
});

export default Orderpayment;
