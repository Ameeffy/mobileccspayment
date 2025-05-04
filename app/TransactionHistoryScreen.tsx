import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]); // Initial state as an array
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

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/get-transaction-detailsHistory', {
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
      setTransactions(data); // Set the fetched data into transactions array
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionDetails();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.transactionContainer}>
      <TouchableOpacity>
        <Text style={styles.paymentMethod}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={styles.paymentMethod}>Status: {item.payment_status}</Text>
        <Text style={styles.paymentMethod}>Action: {item.action}</Text>
        {item.received_by_firstname && item.received_by_lastname && (
          <Text style={styles.receivedByText}>
            Received by: {item.received_by_firstname} {item.received_by_lastname}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.containerloading}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logos} />
        <Text style={styles.message}>Loading transaction history, please wait...</Text>
        <ActivityIndicator size="large" color="#00FF7F" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Transaction History</Text>

      {transactions.length > 0 ? (
  <FlatList
    data={transactions}
    renderItem={renderItem}
    keyExtractor={(item, index) => `${item.transaction_id}-${index}`} // Combine transaction_id with index to ensure uniqueness
  />
) : (
  <Text style={styles.noTransactions}>No transactions found.</Text>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  containerloading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B3A28',
  },
  logos: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
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
    color: '#34495e',
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
  },
  receivedByText: {
    color: '#27ae60',
    fontSize: 18, // Green color for receiver text
  },
  noTransactions: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
