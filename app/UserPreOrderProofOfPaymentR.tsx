import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const UserPreOrderProofOfPayment = () => {
    const router = useRouter();
    const { preOrderId } = useLocalSearchParams<{ preOrderId: string }>(); // Get preOrderId from URL params
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(true);
    const [organization, setOrganization] = useState<{ name: string, logo: string } | null>(null);
    const [gcashOrder, setGcashOrder] = useState<{ id: number, qrcodepicture: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreOrderDetails = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                if (!userToken) {
                    alert('User not authenticated.');
                    return;
                }

                const response = await fetch(`https://finalccspayment.onrender.com/api/auth/preorder/${preOrderId}/details`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setOrganization(data.organization);
                    setGcashOrder(data.gcashOrder);
                } else {
                    alert(data.error || 'Failed to fetch details.');
                }
            } catch (error) {
                console.error('Error fetching pre-order details:', error);
                alert('An error occurred.');
            } finally {
                setLoading(false);
            }
        };

        if (preOrderId) {
            fetchPreOrderDetails();
        }
    }, [preOrderId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#004d00" />
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleSelectImage = async () => {
        try {
            const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

            if (!mediaLibraryPermission.granted || !cameraPermission.granted) {
                alert('Permissions to access camera and media library are required!');
                return;
            }

            Alert.alert(
                'Upload Proof of Payment',
                'Choose an option',
                [
                    {
                        text: 'Camera',
                        onPress: async () => {
                            const cameraResult = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: false,
                                quality: 1,
                            });

                            if (!cameraResult.canceled) {
                                setSelectedImage(cameraResult.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: 'Gallery',
                        onPress: async () => {
                            const libraryResult = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: false,
                                quality: 1,
                            });

                            if (!libraryResult.canceled) {
                                setSelectedImage(libraryResult.assets[0].uri);
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

    const handleUploadProof = async () => {
        if (!selectedImage) {
            Alert.alert('No Image Selected', 'Please upload a proof of payment before submitting.');
            return;
        }

        setIsUploading(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                return;
            }

            const formData = new FormData();
            formData.append('pre_order_id', preOrderId);
            formData.append('proof_of_payment', {
                uri: selectedImage,
                name: `preorder_payment_${Date.now()}.jpg`,
                type: 'image/jpeg',
            } as any);

            const response = await fetch('https://finalccspayment.onrender.com/api/auth/Rupdate-preorder-proof', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Proof of payment uploaded successfully.');
                router.push('/ccspaymenthome'); // Redirect to user's pre-order page
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error('Error uploading proof of payment:', error);
            Alert.alert('Error', 'Failed to upload proof of payment.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {organization && (
    <>
        <Text style={styles.title}>{organization.name}</Text>
        <Image 
            source={organization.logo ? { uri: organization.logo } : require('../assets/images/ccsdeptlogo.png')} 
            style={styles.logo} 
        />
    </>
)}


            {gcashOrder ? (
                <>
                    <Text style={styles.subtitle}>Latest GCash QR Code</Text>
                    <Image source={{ uri: gcashOrder.qrcodepicture }} style={styles.qrcode} />
                </>
            ) : (
                <Text style={styles.subtitle}>No GCash QR Code available.</Text>
            )}
            <Text style={styles.subtitle}>Select Proof of Payment</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
                {selectedImage ? (
                    
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                ) : (
                    <Text style={styles.imagePickerText}>Select Image</Text>
                )}
            </TouchableOpacity>

            {selectedImage && (
                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadProof} disabled={isUploading}>
                    <Text style={styles.uploadButtonText}>
                        {isUploading ? 'Uploading...' : 'Submit Proof of Payment'}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            {infoModalVisible && (
                          <View style={styles.infoModal}>
                            <View style={styles.infoModalContent}>
                              <Text style={styles.infoModalTitle}>Payment Instructions</Text>
                              <Text style={styles.infoModalText}>
                              Please scan the QR code to pay the exact amount of your pre-order that was Declined. After payment, upload your proof of payment. Thank you!
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#1B3A28',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    qrcode: {
        width: 200,
        height: 400,
        alignSelf: 'center',
        marginBottom: 16,
    },
    imagePicker: {
        backgroundColor: '#fff',
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
    },container: {
        flex: 1,
        backgroundColor: '#1B3A28',
        padding: 20,
        alignItems: 'center',
    },
    imagePickerText: {
        color: '#000',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    uploadButton: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default UserPreOrderProofOfPayment;
