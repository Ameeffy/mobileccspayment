import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ProductTransactionDetailsScreen = () => {
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null); // Track selected product ID
  const route = useRoute();
  const router = useRouter();
  const { orderTransactionId } = route.params as { orderTransactionId: string };

  const fetchProductTransactionDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/product-transaction-details', {
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

      // Automatically select the first product (or you can choose any other logic to select)
      if (data && data.length > 0) {
        setSelectedProductId(data[0].order_transaction_id); // Automatically select the first product
      }
    } catch (error) {
      console.error('Error fetching product transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTransactionDetails();
  }, [orderTransactionId]);

  const handleViewProdcutTransaction = () => {
    if (selectedProductId) {
      router.push(`/ProductTransactionDetailsScreenHistory?orderTransactionId=${selectedProductId}`);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Calculate total amount based on all quantities
  const totalAmount = productDetails.reduce((acc, product) => {
    const totalQuantity =
      product.quantity +
      product.smallquantity +
      product.mediumquantity +
      product.largequantity +
      product.xlargequantity;

    return acc + (product.price * totalQuantity);
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Order Transaction Details</Text>
      {productDetails.length > 0 ? (
        productDetails.map((product, index) => (
          <View key={index} style={styles.productContainer}>
            <Text style={styles.productName}>{product.product_name}</Text>

            {/* Render quantity-related text only if the value is greater than 0 */}
            {product.quantity > 0 && <Text style={styles.quantityText}>Quantity: {product.quantity}</Text>}
            {product.smallquantity > 0 && <Text style={styles.quantityText}>Small: {product.smallquantity}</Text>}
            {product.mediumquantity > 0 && <Text style={styles.quantityText}>Medium: {product.mediumquantity}</Text>}
            {product.largequantity > 0 && <Text style={styles.quantityText}>Large: {product.largequantity}</Text>}
            {product.xlargequantity > 0 && <Text style={styles.quantityText}>Xlarge: {product.xlargequantity}</Text>}

            <Text style={styles.productPrice}>₱{product.price}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noProductsText}>No products available.</Text>
      )}

      {/* Display total amount of all products */}
      <Text style={styles.totalAmount}>Total Amount: ₱{totalAmount}</Text>

      <TouchableOpacity
  style={[styles.customButton, selectedProductId === null && styles.disabledButton]} // Apply disabled style if no product is selected
  onPress={handleViewProdcutTransaction}
  disabled={selectedProductId === null} // Disable the button until a product is selected
>
  <Text style={[styles.customButtonText, selectedProductId === null && styles.disabledText]}>
    Order history
  </Text>
</TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  customButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  disabledText: {
    color: '#7F8C8D',
  },
  container: {
    padding: 16,
    backgroundColor: '#1B3A28', // Set background color to #1B3A28
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF', // Title text color
  },
  productContainer: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff', // Product container background color
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e', // Product name text color
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 16,
    color: '#34495e', // Quantity text color
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60', // Product price color
    marginTop: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // Total amount text color
    marginTop: 16,
  },
  noProductsText: {
    fontSize: 16,
    color: '#fff', // Color when there are no products
    marginTop: 16,
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
});

export default ProductTransactionDetailsScreen;
