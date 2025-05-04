import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  smallquantity: number;
  mediumquantity: number;
  largequantity: number;
  xlargequantity: number;
  product_image: string;
  organization_name: string;
  product_id: number;
}

const OrderDetails = () => {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); 
  const [confirmOrderVisible, setConfirmOrderVisible] = useState(false); // Added state for delete confirmation dialog
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
          return;
        }

        const response = await fetch('https://finalccspayment.onrender.com/api/auth/reviewordersusers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrderItems(data);
        } else {
          const errorData = await response.json();
          setDialogMessage(errorData.error || 'Failed to fetch order details.');
          setDialogVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setDialogMessage('An error occurred while fetching order details.');
        setDialogVisible(true);
      }
    };

    fetchOrderDetails();
  }, []);

  useEffect(() => {
    // Calculate the total price based on order items
    const calculateTotalPrice = () => {
      const total = orderItems.reduce((sum, item) => {
        let itemTotal = 0;

        // Add prices based on quantity
        if (item.quantity > 0) itemTotal += item.quantity * item.price;
        if (item.smallquantity > 0) itemTotal += item.smallquantity * item.price;
        if (item.mediumquantity > 0) itemTotal += item.mediumquantity * item.price;
        if (item.largequantity > 0) itemTotal += item.largequantity * item.price;
        if (item.xlargequantity > 0) itemTotal += item.xlargequantity * item.price;

        return sum + itemTotal;
      }, 0);

      setTotalPrice(total);
    };

    if (orderItems.length > 0) {
      calculateTotalPrice();
    }
  }, [orderItems]);


const handleDeleteOrder = async () => {
    setConfirmDeleteVisible(false);  // Close confirmation dialog

    try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
            setDialogMessage('User not authenticated.');
            setDialogVisible(true);
            return;
        }

        const response = await fetch('https://finalccspayment.onrender.com/api/auth/reviewordersdeleteusers', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
        });

        if (response.ok) {
            // On success, navigate back without showing a dialog
            setOrderItems([]); // Clear the order items from the state
            router.back(); // Navigate back to the previous screen
        } else {
            const errorData = await response.json();
            setDialogMessage(errorData.error || 'Failed to delete review orders.');
            setDialogVisible(true);
        }
    } catch (error) {
        console.error('Error:', error);
        setDialogMessage('An error occurred while deleting orders.');
        setDialogVisible(true);
    }
};
const handlePlaceOrder = async () => {
  if (isSubmitting) return;

  setIsSubmitting(true); 

  const userToken = await AsyncStorage.getItem('userToken');
  if (!userToken) {
    setDialogMessage('User not authenticated.');
    setDialogVisible(true);
    setIsSubmitting(false);
    return;
  }

  const orderData = {
    cartItems: orderItems.map(item => {
      // Only include quantities that are greater than zero and add the product_id
      const filteredItem = {
        product_id: item.product_id,  // Include product_id
        quantity: item.quantity > 0 ? item.quantity : undefined,
        smallquantity: item.smallquantity > 0 ? item.smallquantity : undefined,
        mediumquantity: item.mediumquantity > 0 ? item.mediumquantity : undefined,
        largequantity: item.largequantity > 0 ? item.largequantity : undefined,
        xlargequantity: item.xlargequantity > 0 ? item.xlargequantity : undefined,
      };

      return filteredItem;
    }),
    totalAmount: totalPrice,  // Ensure this is the correct total amount
    paymentMethod: 'Gcash',   // Update based on user selection or default
  };

  try {
    const response = await fetch('https://finalccspayment.onrender.com/api/auth/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      Alert.alert('Success', 'Order placed successfully.');

      // Corrected router push with proper closing quote
      router.push('/Orderpayment');

    } else {
      const errorData = await response.json();
      setDialogMessage(errorData.message || 'Failed to place order');
      setDialogVisible(true);
    }
  } catch (error) {
    console.error('Error:', error);
    setDialogMessage('An error occurred while placing the order.');
    setDialogVisible(true);
  } finally {
    setIsSubmitting(false); // Stop loading
  }
};






const handleDialogClose = () => {
  setDialogVisible(false); // Navigate back after closing the dialog
};


  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>Price: {item.price} PHP</Text>

      <View style={styles.quantityContainer}>
        {item.quantity > 0 && <Text style={[styles.quantityItem]}>{item.quantity} Quantity</Text>}
        {item.smallquantity > 0 && <Text style={[styles.quantityItem, styles.smallQuantity]}>{item.smallquantity} Small</Text>}
        {item.mediumquantity > 0 && <Text style={[styles.quantityItem, styles.mediumQuantity]}>{item.mediumquantity} Medium</Text>}
        {item.largequantity > 0 && <Text style={[styles.quantityItem, styles.largeQuantity]}>{item.largequantity} Large</Text>}
        {item.xlargequantity > 0 && <Text style={[styles.quantityItem, styles.xlargeQuantity]}>{item.xlargequantity} Extra Large</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setConfirmDeleteVisible(true)} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Order Details</Text>

      <FlatList
        data={orderItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyOrderText}>No order details available.</Text>}
        contentContainerStyle={styles.scrollContent}
      />

      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceText}>Total Price: {totalPrice} PHP</Text>
      </View>

      <TouchableOpacity 
  style={[styles.placeOrderButton, isSubmitting && styles.disabledButton]} 
  onPress={handlePlaceOrder} 
  disabled={isSubmitting} 
>
  {isSubmitting ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <Text style={styles.placeOrderButtonText}>Place Order</Text>
  )}
</TouchableOpacity>



      {dialogVisible && (
        <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>Error</Dialog.Title>
          <Dialog.Description>{dialogMessage}</Dialog.Description>
          <Dialog.Button label="OK" onPress={handleDialogClose} />
        </Dialog.Container>
      )}

      {confirmDeleteVisible && (
        <Dialog.Container visible={confirmDeleteVisible}>
          <Dialog.Title>Wanna go back to your CCS Cart?</Dialog.Title>
          <Dialog.Description>
          This action cannot be undone.
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={() => setConfirmDeleteVisible(false)} />
          <Dialog.Button label="Yes" onPress={handleDeleteOrder} />
        </Dialog.Container>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#004d00', // Ensure disabled button is dark green
    opacity: 0.6, // Slight transparency to indicate disabled state
  },
  
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 20,
    justifyContent: 'space-between', // To keep the button at the bottom
  },
  scrollContent: {
    flexGrow: 1, // Ensures the content fills up the screen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  backButton: {
    position: 'relative',
    marginBottom: 10,
    width: 50,
    height: 50,
    backgroundColor: '#004d00',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },

  quantityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },

  quantityItem: {
    backgroundColor: '#004d00', // Green for medium
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    fontSize: 16,
    fontWeight: 'normal',
    color: 'white',
    textAlign: 'center',
  },

  smallQuantity: {
    backgroundColor: '#004d00',
  },

  mediumQuantity: {
    backgroundColor: '#004d00',
  },

  largeQuantity: {
    backgroundColor: '#004d00',
  },

  xlargeQuantity: {
    backgroundColor: '#004d00',
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
  },
  totalPriceContainer: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyOrderText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  placeOrderButton: {
    backgroundColor: '#004d00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'normal',
  },
});

export default OrderDetails;
