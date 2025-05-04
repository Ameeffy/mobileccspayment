import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView,TouchableOpacity, Button, Image,Modal, Alert, ActivityIndicator  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const handleUpdateStatus = (id: number) => {
    router.push(`/profileStatus?id=${id}`);
  };

  const handleSelectImage = async () => {
    try {
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
    }
  };
  

  const handleSubmit = async () => {
    setIsSubmitting(true); // Start loading
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('You need to log in first');
      setIsSubmitting(false); // Stop loading
      return;
    }
  
    if (!selectedSection) {
      alert('Please select a section');
      setIsSubmitting(false); // Stop loading
      return;
    }
  
    const formData = new FormData();
    if (selectedImage) {
      formData.append('certificate_of_registration', {
        uri: selectedImage,
        name: `certificate_of_registration_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
    }
    formData.append('section', selectedSection); // Add section to form data
  
    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/uploadCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Successfully Uploaded. Please wait for your status approval');
        router.push('/ccspaymenthome');
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error uploading certificate');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <ScrollView style={styles.container}>
  <Modal
    transparent={true}
    visible={isModalVisible}
    animationType="slide"
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>
          Please upload your latest Certificate of Registration (COR) or any proof of documents to justify that you are currently enrolled on this current semester and please select your section. Thank you!
        </Text>
        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  <TouchableOpacity
    onPress={() => router.push('/ccspaymenthome')}
    style={styles.backButton}
  >
    <MaterialIcons name="arrow-back" size={24} color="black" />
  </TouchableOpacity>
  <Text style={styles.title}>User Profile</Text>
  {userData ? (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.detailText}>
        Full Name: {userData.firstname} {userData.middlename} {userData.lastname}
      </Text>
      <Text style={styles.detailText}>Status: {userData.status}</Text>
      {userData.status === "For approval" && (
  <Text style={styles.message}>
    Your upload documents together with your selected section is now under review. Please kindly wait.
  </Text>
)}
{userData.status === "Graduated" && (
  <Text style={styles.message}>
    Congratulations on your graduation! You no longer have access to this feature.
  </Text>
)}
{userData.status === "Not Enrolled" && (
  <Text style={styles.message}>
    You are not currently enrolled. Please contact your admin for further assistance.
  </Text>
)}
{userData.status === "Active" && (
  <Text style={styles.message}>
    Welcome back! Your account is active. You can access all features and updates as a currently enrolled user.
  </Text>
)}
{userData.status === "Pending" && (
  <Text style={styles.message}>
    Your account is pending . Please Upload your (Documents) together with your selected section .
  </Text>
)}
{userData.status === "Declined" && (
  <Text style={styles.message}>
    Your account has been declined. Please contact the admin for more information.
  </Text>
)}


     
{(userData.status === 'Pending' || userData.status === 'Not Enrolled' || userData.status === 'Declined') && (
        <>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSection}
              onValueChange={(itemValue) => setSelectedSection(itemValue)}
              style={styles.picker}
              dropdownIconColor="black"
            >
              <Picker.Item label="Select Section" value="" color="black" />
              <Picker.Item label="1st Year - A" value="1A" color="black" />
              <Picker.Item label="1st Year - B" value="1B" color="black" />
              <Picker.Item label="1st Year - C" value="1C" color="black" />
              <Picker.Item label="2nd Year - A" value="2A" color="black" />
              <Picker.Item label="2nd Year - B" value="2B" color="black" />
              <Picker.Item label="2nd Year - C" value="2C" color="black" />
              <Picker.Item label="3rd Year - A" value="3A" color="black" />
              <Picker.Item label="3rd Year - B" value="3B" color="black" />
              <Picker.Item label="3rd Year - C" value="3C" color="black" />
              <Picker.Item label="4th Year - A" value="4A" color="black" />
              <Picker.Item label="4th Year - B" value="4B" color="black" />
              <Picker.Item label="4th Year - C" value="4C" color="black" />
            </Picker>
          </View>

          <Button title="Select Documents" onPress={handleSelectImage} />

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
  style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
  onPress={handleSubmit} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <Text style={styles.submitButtonText}>Submit Documents</Text>
  )}
</TouchableOpacity>


        </>
      )}
    </ScrollView>
  ) : (
    <Text>Loading user data...</Text>
  )}
</ScrollView>

  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: 'green', 
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
  message: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray', // A subtle color for the message
    textAlign: 'center', 
    marginBottom: 10,// Center-align for better readability
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: '#1B3A28',
    padding: 12,
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  detailText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  pickerContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 5,
    height: 150, 
    overflow: 'hidden',
    backgroundColor: '#fff', // Ensures the background is white
    width: '100%', // Ensures it takes the full width of the parent container
  },
  picker: {
    height: '100%',
    width: '100%',
    color: 'black', // Ensures the selected value text is black
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
