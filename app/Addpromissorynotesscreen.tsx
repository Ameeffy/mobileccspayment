import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';



const AddPaymentMobile = () => {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentId } = route.params as { paymentId: number };
  const [hasExistingTransaction, setHasExistingTransaction] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [paymentName, setPaymentName] = useState('');
  const [paymentPrice, setPaymentPrice] = useState(0);
  const [paymentID, setPaymentId] = useState(0);
  const [paymentQrcode, setPaymentQrcode] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(true);
  const [selectedImagePromissory, setSelectedImagePromissory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //https://wmsuccspayment.onrender.com
      //ngrok http --domain=wholly-creative-mutt.ngrok-free.app 5000
//http://192.168.0.30:5000
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
          return;
        }

        const response = await fetch('https://finalccspayment.onrender.com/api/auth/get-payment-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentName(data.name);
          setPaymentPrice(data.price);
          setPaymentQrcode(data.qrcode_picture);
          setPaymentId(data.payment_id);

        } else {
          const errorData = await response.json();
          setDialogMessage(errorData.error || 'Failed to fetch payment details.');
          setDialogVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setDialogMessage('An error occurred while fetching payment details.');
        setDialogVisible(true);
      }
    };

    // Check if user status is Pending
    const checkUserStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          alert('User not authenticated.');
          return;
        }
    
        const response = await fetch('https://finalccspayment.onrender.com/api/auth/checkUserStatus', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
    
        const data = await response.json();
    
        if (response.ok) {
          // Check if the user status is 'Pending'
          if (data.status === 'Pending') {
            
            router.push('/profileStatus');  // Navigate back if user status is pending
          }
        } else {
          // Show the error message from the backend if the response is not ok
          alert(data.error || 'Error checking user status.');
          router.push('/profileStatus');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while checking user status.');
      }
    };
    const checkExistingTransaction = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          Alert.alert(
            'Authentication Error',
            'User not authenticated.',
            [{ text: 'OK' }]
          );
          return;
        }
    
        const response = await fetch('https://finalccspayment.onrender.com/api/auth/check-existing-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
          }),
        });
    
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setHasExistingTransaction(true);
            Alert.alert(
              'Transaction Exists',
              'You already have an existing transaction for this payment.',
              [{ text: 'OK' }]
              
            );
            router.back()
          }
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'An error occurred while checking transactions.',
          [{ text: 'OK' }]
        );
      }
    };
    
    
    

    checkExistingTransaction();
    fetchPaymentDetails();
    checkUserStatus();
  }, [paymentId]);
  const handleDialogClose = () => {
    setDialogVisible(false);
    if (!isPending) {
      navigation.goBack();
    }
  };
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
  

  const handlePaymentAction = async () => {

    
    if (hasExistingTransaction) return;

    if (!selectedImagePromissory) {
      Alert.alert(
        'No Image Selected',
        'Please upload a proof of payment before submitting.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }

    setIsSubmitting(true)

    const currentYear = new Date().getFullYear().toString();
    const transactionId = `${currentYear}${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setDialogMessage('User not authenticated.');
        setDialogVisible(true);
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('payment_id', paymentId.toString());
      formData.append('transaction_id', transactionId);
      formData.append('payment_status', 'Balance');
      formData.append('payment_method', 'None');
      formData.append('total_amount', '0'); // Adjusted to use paymentPrice
      formData.append('balance', '0');
      formData.append('proof_of_payment', '');

      if (selectedImagePromissory) {
        formData.append('promissory_note', {
          uri: selectedImagePromissory,
          name: `payment_promissory_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/add-transactionPromissory', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Thank you, we are gonna review your payment.');
        router.push('/ccspaymenthome');
      } else {
        const errorData = await response.json();
        setDialogMessage(errorData.error || 'An unknown error occurred.');
        setDialogVisible(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setDialogMessage('An error occurred while adding payment.');
      setDialogVisible(true);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };
  const handleNavigateToPromissory = (paymentId: number) => {
    // Passing paymentId as a query parameter to Addpromissorynotesscreen
    router.push(`/Addpromissorynotesscreen?paymentId=${paymentId}`);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <MaterialIcons name="arrow-back" size={24} color="white" />
  </TouchableOpacity>


</View>


      {infoModalVisible && (
  <View style={styles.infoModal}>
    <View style={styles.infoModalContent}>
    <Text style={styles.infoModalTitle}>Promissory Instructions</Text>
        <Text style={styles.infoModalText}>
          Please upload a clear and valid promissory note to proceed with your payment process. 
          Ensure that the document is legible and contains all required information. Thank you!
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

     
      <TouchableOpacity style={styles.button} onPress={handleSelectImagePromissory}>
                <Text style={styles.buttonText}>Upload Promossiorry Notes</Text>
            </TouchableOpacity>
            <View>
  <Text style={styles.previewText}>
    {selectedImagePromissory ? "Image Selected:" : "No image selected yet."}
  </Text>
  {selectedImagePromissory ? (
    <Image source={{ uri: selectedImagePromissory }} style={styles.image} />
  ) : (
    <Text style={styles.noImageText}>Please upload or capture a clear image of your promissory note to continue.</Text>
  )}
</View>


<TouchableOpacity 
  style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
  onPress={handlePaymentAction} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <Text style={styles.submitButtonText}>Submit Promissory Notes</Text>
  )}
</TouchableOpacity>


      {dialogVisible && (
        <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>{hasExistingTransaction ? 'Error' : 'Success'}</Dialog.Title>
          <Dialog.Description>{dialogMessage}</Dialog.Description>
          <Dialog.Button label="OK" onPress={() => setDialogVisible(false)} />
        </Dialog.Container>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#004d00', // Ensure disabled button is dark green
    opacity: 0.6, // Slight transparency to indicate disabled state
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promissoryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promissoryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "normal",
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
    backgroundColor: '#004d00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'normal',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrcodeImage: {
    width: 200,
    height: 400,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: '#004d00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'normal',
  },
});

export default AddPaymentMobile;
