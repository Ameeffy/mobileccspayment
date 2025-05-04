import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
//import * as Print from 'expo-print';
//import * as Sharing from 'expo-sharing';
//import * as FileSystem from 'expo-file-system';

const TransactionDetailsScreen = () => {
  const [transactionDetails, setTransactionDetails] = useState({
    transaction_id: '',
    payment_name: '',
    payment_method: '',
    payment_price: 0,
    organization_name: '',
    semester_name: '',
    total_amount: 0,
    payment_status: '',
    created_at: '',
  });
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const router = useRouter();
  const { transactionId } = route.params as { transactionId: string };




  const fetchTransactionDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found. Redirecting to login.');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/get-transaction-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: transactionId,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch transaction details');
      }

      const data = await response.json();
      setTransactionDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    } else {
      console.error('Transaction ID is not available.');
      setLoading(false);
    }
  }, [transactionId]);

  
  
  const handleViewTransactions = (transactionId: number) => {
    router.push(`/TransactionHistoryScreen?transactionId=${transactionId}`);
  };
  
  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.screenContainer}>
      {transactionDetails ? (
        <>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Transaction Details</Text>
          <View style={styles.transactionContainer}>
            <Text style={styles.semester}>{transactionDetails.semester_name}</Text>
            <Text style={styles.paymentMethod}>Organization: {transactionDetails.organization_name}</Text>
            <Text style={styles.paymentMethod}>Payment Name: {transactionDetails.payment_name}</Text>
            <Text style={styles.paymentMethod}>Transaction ID: {transactionDetails.transaction_id}</Text>
            <Text style={styles.paymentMethod}>Amount: ₱{transactionDetails.total_amount}</Text>
            <Text style={styles.paymentMethod}>Date: {new Date(transactionDetails.created_at).toLocaleDateString()}</Text>
            <Text style={styles.paymentMethod}>Status: {transactionDetails.payment_status}</Text>
            <Text style={styles.paymentMethod}>Payment Method: {transactionDetails.payment_method}</Text>
            <Text style={styles.paymentMethod}>Payment Price: ₱{transactionDetails.payment_price}</Text>
          </View>

          
        {/* <TouchableOpacity onPress={handleDownloadPDF} style={styles.downloadButton}>
  <MaterialIcons name="download" size={24} color="white" />
  <Text style={styles.downloadText}>Download Details</Text>
</TouchableOpacity> */}
          <TouchableOpacity
  onPress={() => handleViewTransactions(Number(transactionDetails.transaction_id))}
  style={styles.iconButtonContainer}
>
  <MaterialIcons name="history" size={24} color="#fff" />
  <Text style={styles.buttonText}>View History</Text>
</TouchableOpacity>

        </>
      ) : (
        <Text>Transaction details not found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconButtonContainer: {
    marginTop: 20,
    backgroundColor: '#004d00',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    marginRight: 10, // Space between icon and text
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
  screenContainer: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    alignSelf: 'center',
  },
  paymentMethod: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
  },
  transactionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
  },
  semester: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'left',
  },
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#004d00',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',

  },
  downloadText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default TransactionDetailsScreen;
