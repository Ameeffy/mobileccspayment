import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
    Image, ActivityIndicator 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const PayBalanceScreen = () => {
    const [orderDetails, setOrderDetails] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [infoModalVisible, setInfoModalVisible] = useState(true); // Default to visible on screen load

    const route = useRoute();
    const router = useRouter();
    const { orderTransactionId } = route.params as { orderTransactionId: string };

    // Fetch Order Details and Latest QR Code
    const fetchOrderDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                router.push('/');
                return;
            }

            const response = await fetch('https://finalccspayment.onrender.com/api/auth/product-transaction-detailsBalance', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ orderTransactionId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            setOrderDetails(data[0]); // Assuming API returns an array
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderTransactionId]);

    // Calculate Remaining Balance
    const remainingBalance =
        orderDetails?.total_amount && orderDetails?.total_pay
            ? parseFloat(orderDetails.total_amount) - parseFloat(orderDetails.total_pay)
            : 0;

    // Handle Image Selection for Proof of Payment
    const handleSelectImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Allow access to select an image.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'An error occurred while selecting an image.');
        }
    };

    // Handle Payment Submission with Proof of Payment
    const handleSubmitPayment = async () => {
        if (!selectedImage) {
            Alert.alert('No Image Selected', 'Please upload a proof of payment before submitting.');
            return;
        }
    
        if (!orderDetails || !orderDetails.id) {
            Alert.alert('Error', 'GCash order ID not found. Please try again.');
            return;
        }
    
        setIsSubmitting(true); // Show loading indicator
    
        const token = await AsyncStorage.getItem('userToken');
        const formData = new FormData();
        formData.append('order_transaction_id', orderTransactionId);
        formData.append('gcashorder_id', orderDetails.id); // Correctly reference the GCash ID
        formData.append('proof_of_payment', {
            uri: selectedImage,
            name: `payment_proof_${Date.now()}.jpg`,
            type: 'image/jpeg',
        } as any);
    
        try {
            const response = await fetch('https://finalccspayment.onrender.com/api/auth/update-proof-of-paymentBalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                Alert.alert('Success', 'Payment proof uploaded successfully.', [
                    { text: 'OK', onPress: () => router.push('/ccspaymenthome') }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit proof of payment.');
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            Alert.alert('Error', 'An error occurred while submitting the payment.');
        } finally {
            setIsSubmitting(false); // Hide loading indicator
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FF7F" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Payment Instructions Modal */}
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

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Pay Balance</Text>

            {/* Order Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.label}>Order ID:</Text>
                <Text style={styles.value}>{orderDetails.order_transaction_id}</Text>

                <Text style={styles.label}>Total Amount:</Text>
                <Text style={styles.value}>₱{orderDetails.total_amount}</Text>

                <Text style={styles.label}>Total Paid:</Text>
                <Text style={styles.value}>₱{orderDetails.total_pay}</Text>

                <Text style={styles.label}>Remaining Balance:</Text>
                <Text style={styles.balanceAmount}>- ₱{remainingBalance.toFixed(2)}</Text>
            </View>

            {/* QR Code */}
            {orderDetails.latest_qrcode && (
                <View style={styles.qrContainer}>
                    <Text style={styles.label}>Scan QR Code:</Text>
                    <Image source={{ uri: orderDetails.latest_qrcode }} style={styles.qrcodeImage} />
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
                <Text style={styles.buttonText}>Upload Proof of Payment</Text>
            </TouchableOpacity>

            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.proofImage} />}

            <TouchableOpacity style={styles.button} onPress={handleSubmitPayment} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Submit Payment</Text>
                )}
            </TouchableOpacity>
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
    qrcodeImage: {
        width: 200,
        height: 400,
        alignSelf: 'center',
        marginBottom: 16,
        marginTop: 10,
      },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1B3A28',
    },
    loadingText: {
        fontSize: 18,
        color: '#FFFFFF',
        marginTop: 10,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#1B3A28',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#004d00',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    detailsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#1976d2',
        marginBottom: 10,
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 10,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    qrCode: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    proofImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    button: {
        backgroundColor: '#004d00',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default PayBalanceScreen;
