import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CartItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  smallquantity: number;
  mediumquantity: number;
  largequantity: number;
  xlargequantity: number;
  product_image: string;
  organization_name: string;
  product_id: number;
  photo: string;
  
}

interface GroupedCartItems {
  [key: string]: CartItem[];
}

const AddToCart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [confirmReviewVisible, setConfirmReviewVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0); // Track the total price
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);

  

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setDialogMessage('User not authenticated.');
          setDialogVisible(true);
          return;
        }

        const response = await fetch('https://finalccspayment.onrender.com/api/auth/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
          calculateTotalPrice(data); // Calculate total price after fetching data
        } else {
          const errorData = await response.json();
          setDialogMessage(errorData.error || 'Failed to fetch cart items.');
          setDialogVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setDialogMessage('An error occurred while fetching cart items.');
        setDialogVisible(true);
      }
    };

    fetchCartItems();
  }, []);

  

  const handleCheckboxToggle = (id: number, organization_name: string) => {
    // If the current item is already selected, unselect it and clear organization if it's the only item from that organization selected
    if (selectedItems[id]) {
      setSelectedItems((prevSelected) => {
        const newSelected = { ...prevSelected };
        delete newSelected[id]; // Deselect the item
        return newSelected;
      });
  
      // If no other items are selected from the organization, clear the selected organization
      if (Object.values(selectedItems).filter((selected) => selected).length === 1) {
        setSelectedOrganization(null); // Deselect organization if no items from it are selected
      }
      return; // Exit after deselecting
    }
  
    // If an organization is already selected and the current one is different, show an alert
    if (selectedOrganization && selectedOrganization !== organization_name) {
      Alert.alert(
        "Selection Error",
        `You can only select items from one organization at a time. Selected organization: ${selectedOrganization}`
      );
      return; // Prevent selecting this item if it belongs to a different organization
    }
  
    // If no organization is selected yet, set the selected organization
    if (!selectedOrganization) {
      setSelectedOrganization(organization_name);
    }
  
    // Toggle the selected state for this item
    setSelectedItems((prevSelected) => ({
      ...prevSelected,
      [id]: !prevSelected[id], // Toggle the selected state for this item
    }));
  };
  
  

  // Calculate total price based on selected items and quantities
  const calculateTotalPrice = (items: CartItem[]) => {
    const total = items.reduce((acc, item) => {
      // Only include items that are selected
      if (selectedItems[item.id]) {
        const itemTotal = item.price * item.quantity;
        const smallTotal = item.price * item.smallquantity;
        const mediumTotal = item.price * item.mediumquantity;
        const largeTotal = item.price * item.largequantity;
        const xlargeTotal = item.price * item.xlargequantity;

        // Sum up all sizes and quantities
        return acc + itemTotal + smallTotal + mediumTotal + largeTotal + xlargeTotal;
      }
      return acc;
    }, 0);

    setTotalPrice(total); // Update the total price state
  };

  // Recalculate total price whenever selectedItems or cartItems change
  useEffect(() => {
    calculateTotalPrice(cartItems);
  }, [selectedItems, cartItems]);

  const groupCartItemsByOrganization = (): GroupedCartItems => {
    return cartItems.reduce((grouped, item) => {
      if (!grouped[item.organization_name]) {
        grouped[item.organization_name] = [];
      }
      grouped[item.organization_name].push(item);
      return grouped;
    }, {} as GroupedCartItems);
  };

  const groupedCartItems = groupCartItemsByOrganization();

  const handleDialogClose = () => {
    setDialogVisible(false);
    
  };

  const checkUserStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        alert('User not authenticated.');
        return null;
      }
  
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/checkUserStatus', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // If the user status is 'Pending', show the alert and prevent further action
        if (data.status === 'Pending') {
          alert('Your account is pending. Please proceed to your account and upload the latest semester and section');
          router.push('/profileStatus');  // Navigate back if the user status is pending
          return false; // Return false to indicate the user cannot proceed
        }
        return true; // If not pending, the user can proceed
      } else {
        alert(data.error || 'Error checking user status.');
        router.push('/profileStatus');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while checking user status.');
      return false; // Return false in case of an error
    }
  };
  
  // Handle review payment after checking user status
  const handleReviewPayment = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
  
    if (!userToken) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
  
    // First, check the user status before proceeding with the payment review
    const canProceed = await checkUserStatus();
    if (!canProceed) {
      return; // If user status is pending or there's an error, stop the function here
    }
  
    const selectedCartItems = cartItems.filter(item => selectedItems[item.id]);
  
    if (selectedCartItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item.');
      return;
    }
  
    // Check if all product IDs in the selected items are valid
    const invalidProduct = selectedCartItems.some(item => !cartItems.some(cartItem => cartItem.id === item.id));
    if (invalidProduct) {
      Alert.alert('Error', 'One or more products do not exist.');
      return;
    }
  
    // Calculate total price for the selected items
    calculateTotalPrice(selectedCartItems);
  
    const orderData = {
      cartItems: selectedCartItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        smallQuantity: item.smallquantity,
        mediumQuantity: item.mediumquantity,
        largeQuantity: item.largequantity,
        xlargeQuantity: item.xlargequantity,
      })),
      totalPrice,  // Total price of the selected items
    };
  
    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/revieworder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Send the userToken in the Authorization header
        },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
  
      // Check for success based on backend response
      if (response.ok && data.message === 'Review orders added successfully') {
        Alert.alert('Success', 'Order review successfully.');
        router.push('/OrderDetails');
      } else {
        // If the response was not successful, display the error message
        Alert.alert('Cannot processed', data.message || 'Failed to review order.');
      }
    } catch (error) {
      console.error('Error submitting review order:', error);
      Alert.alert('Error', 'An error occurred while processing your order.');
    }
  };
  
  


  const handleConfirmReview = () => {
    setConfirmReviewVisible(false);
    const cartItemsString = JSON.stringify(cartItems);
    router.push(`/OrderDetails?cartItems=${encodeURIComponent(cartItemsString)}`);
  };

  const handleDeleteCartItem = async (cartItemId: number) => {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      setDialogMessage('User not authenticated.');
      setDialogVisible(true);
      return;
    }

    try {
      const response = await fetch(`https://finalccspayment.onrender.com/api/auth/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
        Alert.alert('Success', 'Cart item deleted successfully.');
      } else {
        const errorData = await response.json();
        setDialogMessage(errorData.message || 'Failed to delete cart item.');
        setDialogVisible(true);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      setDialogMessage('An error occurred while deleting the cart item.');
      setDialogVisible(true);
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, size: string, quantity: number) => {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      setDialogMessage('User not authenticated.');
      setDialogVisible(true);
      return;
    }
  
    try {
      const response = await fetch(`https://finalccspayment.onrender.com/api/auth/cartusersupdate/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          size,
          quantity,
        }),
      });
  
      if (response.ok) {
        const updatedItem = await response.json();
        
        // Update the cartItems state to reflect the new quantity and item data
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === cartItemId
              ? { ...item, [size]: quantity } // Update the specific size's quantity
              : item
          )
        );
  
        
        setTimeout(() => calculateTotalPrice(cartItems), 0); // To ensure fresh data when updating the total price
      } else {
        const errorData = await response.json();
        setDialogMessage(errorData.message || 'Failed to update cart item quantity.');
        setDialogVisible(true);
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      setDialogMessage('An error occurred while updating cart item quantity.');
      setDialogVisible(true);
    }
  };
  

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.checkboxWrapper}>
      {/* Checkbox (specific to each item) */}
      <TouchableOpacity onPress={() => handleCheckboxToggle(item.id, item.organization_name)} style={styles.checkbox}>
        {selectedItems[item.id] ? (
          <MaterialIcons name="check-box" size={24} color="green" />
        ) : (
          <MaterialIcons name="check-box-outline-blank" size={24} color="gray" />
        )}
      </TouchableOpacity>
    </View>
    
      {item.product_image && <Image source={{ uri: item.product_image }} style={styles.productImage} />}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.product_name}</Text>
        <Text style={styles.itemPrice}>Price: {item.price} PHP</Text>
        
        
        {item.quantity > 0 && (
  <View style={styles.quantityWrapper}>
    <Text style={styles.quantityWrapper}>Quantity: {item.quantity}</Text>
    <TouchableOpacity
      onPress={() => handleUpdateQuantity(item.id, 'quantity', item.quantity + 1)}
    >
      <MaterialIcons name="add" size={20} color="green" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        if (item.quantity > 1) {
          handleUpdateQuantity(item.id, 'quantity', item.quantity - 1);
        }
      }}
      disabled={item.quantity <= 1} // Disable the button if quantity is 1 or lower
    >
      <MaterialIcons name="remove" size={20} color="red" />
    </TouchableOpacity>
  </View>
)}

{/* Small Size */}
{item.smallquantity > 0 && (
  <View style={styles.quantityWrapper}>
    <Text style={styles.quantityWrapper}>Small: {item.smallquantity}</Text>
    <TouchableOpacity
      onPress={() => handleUpdateQuantity(item.id, 'smallquantity', item.smallquantity + 1)}
    >
      <MaterialIcons name="add" size={20} color="green" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        if (item.smallquantity > 1) {
          handleUpdateQuantity(item.id, 'smallquantity', item.smallquantity - 1);
        }
      }}
      disabled={item.smallquantity <= 1} // Disable the button if quantity is 1 or lower
    >
      <MaterialIcons name="remove" size={20} color="red" />
    </TouchableOpacity>
  </View>
)}

{/* Medium Size */}
{item.mediumquantity > 0 && (
  <View style={styles.quantityWrapper}>
    <Text style={styles.quantityWrapper}>Medium: {item.mediumquantity}</Text>
    <TouchableOpacity
      onPress={() => handleUpdateQuantity(item.id, 'mediumquantity', item.mediumquantity + 1)}
    >
      <MaterialIcons name="add" size={20} color="green" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        if (item.mediumquantity > 1) {
          handleUpdateQuantity(item.id, 'mediumquantity', item.mediumquantity - 1);
        }
      }}
      disabled={item.mediumquantity <= 1} // Disable the button if quantity is 1 or lower
    >
      <MaterialIcons name="remove" size={20} color="red" />
    </TouchableOpacity>
  </View>
)}

{/* Large Size */}
{item.largequantity > 0 && (
  <View style={styles.quantityWrapper}>
    <Text style={styles.quantityWrapper}>Large: {item.largequantity}</Text>
    <TouchableOpacity
      onPress={() => handleUpdateQuantity(item.id, 'largequantity', item.largequantity + 1)}
    >
      <MaterialIcons name="add" size={20} color="green" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        if (item.largequantity > 1) {
          handleUpdateQuantity(item.id, 'largequantity', item.largequantity - 1);
        }
      }}
      disabled={item.largequantity <= 1} // Disable the button if quantity is 1 or lower
    >
      <MaterialIcons name="remove" size={20} color="red" />
    </TouchableOpacity>
  </View>
)}

{/* X-Large Size */}
{item.xlargequantity > 0 && (
  <View style={styles.quantityWrapper}>
    <Text style={styles.quantityWrapper}>X-Large: {item.xlargequantity}</Text>
    <TouchableOpacity
      onPress={() => handleUpdateQuantity(item.id, 'xlargequantity', item.xlargequantity + 1)}
    >
      <MaterialIcons name="add" size={20} color="green" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        if (item.xlargequantity > 1) {
          handleUpdateQuantity(item.id, 'xlargequantity', item.xlargequantity - 1);
        }
      }}
      disabled={item.xlargequantity <= 1} // Disable the button if quantity is 1 or lower
    >
      <MaterialIcons name="remove" size={20} color="red" />
    </TouchableOpacity>
  </View>
)}

        {/* Delete Button */}
        <TouchableOpacity onPress={() => handleDeleteCartItem(item.id)}>
          <MaterialIcons name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
  

  const renderOrganizationSection = ({ item: [organizationName, items] }: { item: [string, CartItem[]] }) => (
    <View key={organizationName} style={styles.organizationSection}>
      {/* Organization Logo & Name in a Row */}
      <View style={styles.organizationHeader}>
        <Image 
          source={items[0].photo ? { uri: items[0].photo } : require('../assets/images/ccsdeptlogo.png')}
          style={styles.logoss}
        />
        <Text style={styles.organizationTitle}>{organizationName}</Text>
      </View>
  
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
  


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>CCS Shopping Cart</Text>
      <FlatList
        data={Object.entries(groupedCartItems)}
        renderItem={renderOrganizationSection}
        keyExtractor={(item) => item[0]}
        showsVerticalScrollIndicator={false}
      />

      <Text style={styles.totalPrice}>Total Price: {totalPrice} PHP</Text>

      <TouchableOpacity style={styles.reviewButton} onPress={handleReviewPayment}>
        <Text style={styles.reviewButtonText}>Review Order</Text>
      </TouchableOpacity>

      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Description>{dialogMessage}</Dialog.Description>
        <Dialog.Button label="Close" onPress={handleDialogClose} />
      </Dialog.Container>

      <Dialog.Container visible={confirmReviewVisible}>
        <Dialog.Title>Confirm Review</Dialog.Title>
        <Dialog.Description>Do you want to proceed with the review?</Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => setConfirmReviewVisible(false)} />
        <Dialog.Button label="Confirm" onPress={handleConfirmReview} />
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  organizationSection: {
    marginBottom: 20,
    padding: 15,
    
    borderRadius: 8,
  },
  organizationHeader: {
    flexDirection: 'row',
    alignItems: 'center', // Ensures proper vertical alignment
    marginBottom: 10,
  },
  logoss: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ffffff', // White background for better visibility
    padding: 5, // Optional: adds some space inside the logo
  },
  organizationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  checkboxWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkbox: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: '#1B3A28',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    color: 'white',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  itemDetails: {
    marginLeft: 10,
    justifyContent: 'center',
    color: 'white',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  itemPrice: {
    fontSize: 14,
    color: 'white',
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    color: 'white',
    
  },
  
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: 'white',
  },
  reviewButton: {
    backgroundColor: '#004d00',
    padding: 15,
    borderRadius: 5,
  },
  reviewButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AddToCart;
