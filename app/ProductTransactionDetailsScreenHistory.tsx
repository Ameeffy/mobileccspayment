import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ProductTransactionDetailsScreen = () => {
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const router = useRouter();
  const { orderTransactionId } = route.params as { orderTransactionId: string };

  const fetchProductTransactionDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/product-transaction-detailsHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderTransactionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product transaction details');
      }

      const data = await response.json();
      setProductDetails(data);
    } catch (error) {
      console.error('Error fetching product transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTransactionDetails();
  }, [orderTransactionId]);

  const handleViewProdcutTransaction = (orderTransactionId: number) => {
    router.push(`/ProductTransactionDetailsScreen?orderTransactionId=${orderTransactionId}`);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Order Transaction History</Text>

      {productDetails.length > 0 ? (
        productDetails.map((product, index) => (
          <View key={index} style={styles.productContainer}>
            <Text style={styles.statusText}>Status: {product.status}</Text>
            <Text style={styles.actionText}>Action: {product.action_message}</Text>

            {/* Check for "Received by" */}
            {product.accepted_by_firstname && product.accepted_by_lastname ? (
              <Text style={styles.receivedByText}>
                Received by: {product.accepted_by_firstname} {product.accepted_by_lastname}
              </Text>
            ) : (
              <Text style={[styles.receivedByText, styles.italicText]}>No receiver yet</Text>
            )}

            {/* Check for "Order Status" */}
            {product.order_status !== 'Not yet received' && (
              <Text style={styles.orderStatusText}>Order Status: {product.order_status}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No product details found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1B3A28', // Set the background color of the container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Title text color
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productContainer: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff', // Product container background color
  },
  statusText: {
    fontSize: 16,
    color: '#34495e', // Dark gray color for status
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
     // Blue color for action message
    marginBottom: 8,
  },
  receivedByText: {
    fontSize: 16,
    color: '#27ae60', // Green color for receiver text
    marginBottom: 8,
  },
  italicText: {
    fontStyle: 'italic',
  },
  orderStatusText: {
    fontSize: 16,
    color: '#e67e22', // Orange color for order status
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#fff', // White color for no data message
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProductTransactionDetailsScreen;
