import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ProductDetails = () => {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params as { productId: number }; // Get productId from route params

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
const [productCategory, setProductCategory] = useState('');
const [productCreatedAt, setProductCreatedAt] = useState('');
const [productUpdatedAt, setProductUpdatedAt] = useState('');
const [productXSmallQuantity, setProductXSmallQuantity] = useState(0);
const [productSmallQuantity, setProductSmallQuantity] = useState(0);
const [productMediumQuantity, setProductMediumQuantity] = useState(0);
const [productLargeQuantity, setProductLargeQuantity] = useState(0);
const [productXLargeQuantity, setProductXLargeQuantity] = useState(0);
const [productXXLargeQuantity, setProductXXLargeQuantity] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null); // State to store userId

  // State to handle modal and size/quantity selection
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const [preOrderModalVisible, setPreOrderModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Gcash' | null>(null);
  const [preOrderQuantity, setPreOrderQuantity] = useState(0);
  const [productStatus, setProductStatus] = useState('');
  const [productPreOrderLimit, setProductPreOrderLimit] = useState(0);

  const [preOrderSmall, setPreOrderSmall] = useState(0);
  const [preOrderMedium, setPreOrderMedium] = useState(0);
  const [preOrderLarge, setPreOrderLarge] = useState(0);
  const [preOrderXLarge, setPreOrderXLarge] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
          return;
        }

        // Assuming productId is available
        const response = await fetch(`https://finalccspayment.onrender.com/api/auth/get-product-details?productId=${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProductPreOrderLimit(data.pre_order_limit);
          setProductStatus(data.status);
          setProductName(data.name);
          setProductPrice(data.price);
          setProductImage(data.product_image);
          setProductDescription(data.description || 'No description available');
          setProductQuantity(data.quantity);  // Set quantity as "meow"
          setProductCategory(data.category);
          setProductCreatedAt(data.created_at);
          setProductUpdatedAt(data.updated_at);
          setProductXSmallQuantity(data.xsmallquantity);
          setProductSmallQuantity(data.smallquantity);
          setProductMediumQuantity(data.mediumquantity);
          setProductLargeQuantity(data.largequantity);
          setProductXLargeQuantity(data.xlargequantity);
          setProductXXLargeQuantity(data.xxlargequantity); // Default message if no description
        } else {
          const errorData = await response.json();
          setDialogMessage(errorData.error || 'Failed to fetch product details.');
          setDialogVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setDialogMessage('An error occurred while fetching product details.');
        setDialogVisible(true);
      }
    };

    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
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
        setUserId(data.id); // Set userId from the fetched user data
      } catch (error) {
        console.error('Error:', error);
        setDialogMessage('Failed to fetch user data.');
        setDialogVisible(true);
      }
    };

    fetchProductDetails();
    fetchUserData();
  }, [productId]); // Dependency on productId to refetch when it changes

  const handleAddToCart = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID is missing.');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId, // Use userId from the fetched user data
          product_id: productId,
          addtocart_totalnumber: quantity,
          size: selectedSize, // Include selected size
          quantity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message);
        setModalVisible(false); // Close the modal after adding to cart
        router.push('/ccspaymenthome');
      } else {
        const errorData = await response.json();
        Alert.alert('Cannot add to cart', errorData.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart.');
    }
  };

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  const handlePreOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User is not authenticated.');
        return;
      }
  
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/products/pre-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          total_amount: productPrice,
          total_pay: 0,
          payment_method: paymentMethod,
          quantity: preOrderQuantity,
          small: preOrderSmall,
          medium: preOrderMedium,
          large: preOrderLarge,
          xlarge: preOrderXLarge,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message);
        setPreOrderModalVisible(false);
        router.push('/ccspaymenthome');
      } else {
        const errorData = await response.json();
        Alert.alert('Pre-Order Failed', errorData.message);
      }
    } catch (error) {
      console.error('Error processing pre-order:', error);
      Alert.alert('Error', 'Failed to place pre-order.');
    }
  };
  
  return (
    
    <View style={styles.container}>
       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>{productName || 'Product Name'}</Text>
<Text style={styles.price}>₱{productPrice || 0}</Text>

{productImage && (
  <Image source={{ uri: productImage }} style={styles.image} />
)}

<Text style={styles.description}>{productDescription}</Text>




<View style={styles.quantityContainermeow}>

  {productQuantity > 0 && (
    <Text style={styles.quantityTexta}>Quantity: {productQuantity} stock{productQuantity > 1 ? 's' : ''}</Text>
  )}
  {productSmallQuantity > 0 && (
    <Text style={styles.quantityTexta}>Small: {productSmallQuantity} stock{productSmallQuantity > 1 ? 's' : ''}</Text>
  )}
  {productMediumQuantity > 0 && (
    <Text style={styles.quantityTexta}>Medium: {productMediumQuantity} stock{productMediumQuantity > 1 ? 's' : ''}</Text>
  )}
  {productLargeQuantity > 0 && (
    <Text style={styles.quantityTexta}>Large: {productLargeQuantity} stock{productLargeQuantity > 1 ? 's' : ''}</Text>
  )}
  {productXLargeQuantity > 0 && (
    <Text style={styles.quantityTexta}>X-Large: {productXLargeQuantity} stock{productXLargeQuantity > 1 ? 's' : ''}</Text>
  )}
</View>

 




      {/* Add to cart button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addToCartButton}>
        <MaterialIcons name="shopping-cart" size={24} color="white" />
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
      {productStatus === 'Pre-Order' && (
        <TouchableOpacity onPress={() => setPreOrderModalVisible(true)} style={styles.preOrderButton}>
          <MaterialIcons name="shopping-cart" size={24} color="white" />
          <Text style={styles.preOrderText}>Pre-Order</Text>
        </TouchableOpacity>
      )}

      {/* Go back button */}
     

      {/* Modal for size and quantity selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
  {['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory)
    ? 'Select Size and Quantity' // Title for size categories
    : 'Select Quantity' // Title for other categories
  }
</Text>

<View style={styles.sizeButtons}>
  {['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory) && (
    ['small', 'medium', 'large', 'xlarge'].map((size) => (
      <TouchableOpacity
        key={size}
        style={[
          styles.sizeButton,
          selectedSize === size && styles.selectedSizeButton,
        ]}
        onPress={() => setSelectedSize(size)}
      >
        <Text style={styles.sizeText}>{size.charAt(0).toUpperCase() + size.slice(1)}</Text>
      </TouchableOpacity>
    ))
  )}
</View>



            <View style={styles.quantityContainer}>
              <Button title="-" onPress={decreaseQuantity} />
              <Text style={styles.quantityText}>{quantity}</Text>
              <Button title="+" onPress={increaseQuantity} />
            </View>

            <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#f44336" />
            <Button
  title="Add to Cart"
  onPress={handleAddToCart}
  color="#4CAF50"
  disabled={['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory) && !selectedSize} // Disable if size button is shown and no size is selected
/>
              
              
              
            </View>
          </View>
        </View>
      </Modal>

      {/* Dialog for error or other messages */}
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Description>{dialogMessage}</Dialog.Description>
        <Dialog.Button label="OK" onPress={() => setDialogVisible(false)} />
      </Dialog.Container>
      
      {/* Pre-Order Modal */}
      <Modal visible={preOrderModalVisible} transparent animationType="slide">
  <View style={styles.modalContainerer}>
    <View style={styles.modalContenter}>
      <Text style={styles.modalTitleer}>Pre-Order Product</Text>
      <Text>Available Pre-Order Limit: {productPreOrderLimit}</Text>

      <Text>
        {['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory)
          ? 'Select Size and Quantity' // Title for size categories
          : 'Select Quantity' // Title for other categories
        }
      </Text>

      {/* Show only Regular Quantity if NOT in clothing categories */}
      {!['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory) && (
        <View style={styles.sizeSelectioners}>
          <Text>Quantity:</Text>
          <Button title="-" onPress={() => setPreOrderQuantity(prev => Math.max(0, prev - 1))} />
          <Text>{preOrderQuantity}</Text>
          <Button title="+" onPress={() => setPreOrderQuantity(prev => prev + 1)} />
        </View>
      )}

      {/* Show Small to X-Large if in clothing categories */}
      {['T-Shirt', 'Longsleeve', 'Jacket', 'Pants'].includes(productCategory) && (
        <>
          <View style={styles.sizeSelectioners}>
            <Text>Small:</Text>
            <Button title="-" onPress={() => setPreOrderSmall(prev => Math.max(0, prev - 1))} />
            <Text>{preOrderSmall}</Text>
            <Button title="+" onPress={() => setPreOrderSmall(prev => prev + 1)} />
          </View>

          <View style={styles.sizeSelectioners}>
            <Text>Medium:</Text>
            <Button title="-" onPress={() => setPreOrderMedium(prev => Math.max(0, prev - 1))} />
            <Text>{preOrderMedium}</Text>
            <Button title="+" onPress={() => setPreOrderMedium(prev => prev + 1)} />
          </View>

          <View style={styles.sizeSelectioners}>
            <Text>Large:</Text>
            <Button title="-" onPress={() => setPreOrderLarge(prev => Math.max(0, prev - 1))} />
            <Text>{preOrderLarge}</Text>
            <Button title="+" onPress={() => setPreOrderLarge(prev => prev + 1)} />
          </View>

          <View style={styles.sizeSelectioners}>
            <Text>X-Large:</Text>
            <Button title="-" onPress={() => setPreOrderXLarge(prev => Math.max(0, prev - 1))} />
            <Text>{preOrderXLarge}</Text>
            <Button title="+" onPress={() => setPreOrderXLarge(prev => prev + 1)} />
          </View>
        </>
      )}

<Text style={styles.label}>Select Payment Method:</Text>
<View style={styles.paymentMethodContainer}>
  <TouchableOpacity 
    style={[styles.paymentMethodButton, paymentMethod === 'Cash' && styles.selectedPaymentButton]}
    onPress={() => setPaymentMethod('Cash')}
  >
    <Text style={styles.buttonText}>Cash</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.paymentMethodButton, paymentMethod === 'Gcash' && styles.selectedPaymentButton]}
    onPress={() => setPaymentMethod('Gcash')}
  >
    <Text style={styles.buttonText}>Gcash</Text>
  </TouchableOpacity>
</View>

{/* Updated Button Layout - Left: Cancel, Right: Confirm */}
<View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.cancelButton} onPress={() => setPreOrderModalVisible(false)}>
    <Text style={styles.buttonText}>Cancel</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.confirmButton} onPress={handlePreOrder}>
    <Text style={styles.buttonText}>Confirm</Text>
  </TouchableOpacity>
</View>

    </View>
  </View>
</Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  modalContainerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContenter: {
    width: '85%',
    backgroundColor: '#ffffff', // White background
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
  modalTitleer: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#004d00', // Dark green title for consistency
    textAlign: 'center',
  },
  sizeSelectioners: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white', // Dark green background
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginVertical: 8,
    color: "#004d00",
  },
 
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d00',
    marginTop: 10,
    textAlign: 'center',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  selectedPaymentButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: '#004d00', // Dark green for confirmation
    flex: 1, // Ensures equal width for both buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5, // Adds spacing between buttons
  },
  cancelButton: {
    backgroundColor: '#d9534f', // Red for cancel
    flex: 1, // Ensures equal width for both buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5, // Adds spacing between buttons
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sizeSelection: {
    backgroundColor: 'white',padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center'
  },
  preOrderButton: { 
    backgroundColor: '#004d00', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center',
    marginTop: 10, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  preOrderText: { 
    color: '#fff', 
    marginLeft: 8, 
    fontSize: 18, 
    fontWeight: 'bold' 
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
  container: {
    flex: 2,
    backgroundColor: '#1B3A28', // Dark green background
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    fontSize: 22,
    color: '#ff6347', 
    marginBottom: 10,
  },
  image: {
    width: '70%',
    height: '35%',
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    fontStyle: 'italic', // Makes the text italic
},

addToCartButton: {
  backgroundColor: '#004d00', 
  paddingVertical: 12, 
  paddingHorizontal: 20, 
  borderRadius: 8, 
  alignItems: 'center', 
  flexDirection: 'row', 
  justifyContent: 'center',
  marginTop: 10, 
  elevation: 4, 
  shadowColor: '#000', 
  shadowOffset: { width: 0, height: 3 }, 
  shadowOpacity: 0.3, 
  shadowRadius: 4 
},
addToCartText: {
  color: '#fff',
  marginLeft: 8,
  fontSize: 18,
  fontWeight: 'bold'
},
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 20,
  },
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    
  },
  sizeButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedSizeButton: {
    backgroundColor: '#4CAF50',
  },
  sizeText: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  quantityContainermeow: {
    padding: 6,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  
  quantityTexta: {
    fontSize: 16,
  color: '#fff',
  fontWeight: '500',
  marginBottom: 8,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ProductDetails;
