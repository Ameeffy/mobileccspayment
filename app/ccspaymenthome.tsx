import React, { useEffect, useState, useCallback, ReactNode  } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image,FlatList,  Animated ,RefreshControl, Button,TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, Keyboard, TextInput   } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';





const Tab = createBottomTabNavigator();

const CcspaymentHome = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<any[]>([]);
  const [semesterPayments, setSemesterPayments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false); // Refresh control state

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productId, setProductId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
   // To store details of multiple orders
   const [modalVisible, setModalVisible] = useState<boolean[]>([]);  // Array to track visibility of each modal
   const [transactionCount, setTransactionCount] = useState(0);
  const [productTransactionCount, setProductTransactionCount] = useState(0);


   // Define modalVisible as an array of booleans
  interface OrderDetails {
    order_transaction_id: string;
    message: string;
    organization_id: string;
    firstname: string;
    lastname: string;
    organization_name: string;
  }
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]); 


  const closeModal = (index: number) => {
    setModalVisible((prevVisibility) => {
      const updatedVisibility = [...prevVisibility];  // Copy previous state
      updatedVisibility[index] = false;  // Close the specific modal
      return updatedVisibility;
    });
  };
  

  

  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };

  const handleSearchPress = () => {
    // Navigate to the SearchProduct screen
    router.push('/SearchProduct');
  };
  
 
  


  useEffect(() => {
    const loadUnreadCount = async () => {
      const savedUnreadCount = await AsyncStorage.getItem('unreadCount');
      if (savedUnreadCount) {
        setUnreadCount(parseInt(savedUnreadCount, 10));
      }
    };

    loadUnreadCount();
  }, []);

  const router = useRouter();

  const fetchTransactionCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/user/transaction-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTransactionCount(data.transactionCount);
    } catch (error) {
      console.error('Error fetching transaction count:', error);
    }
  };

  const fetchProductTransactionCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/user/product-transaction-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setProductTransactionCount(data.productTransactionCount);
    } catch (error) {
      console.error('Error fetching product transaction count:', error);
    }
  };


  fetchTransactionCount();
  fetchProductTransactionCount();
 
  





  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
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
      router.push('/');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/products/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });https://finalccspayment.onrender.com/

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data); // Store the list of products
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleProductClick = (productId: number) => {
    if (!productId) {
      console.error('Product ID is undefined');
      return;
    }
    router.push(`/ProductDetails?productId=${productId}`);
  };
  

  const fetchPaymentsBySemester = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/payments/by-semester', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch payments by semester');
      }

      const data = await response.json();
      setSemesterPayments(data); // Store the list of payments by semester
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkCartAvailability = async () => {
  try {
    setIsLoading(true); // Start loading state

    const userToken = await AsyncStorage.getItem('userToken');
    
    if (!userToken) {
      Alert.alert('User Not Authenticated', 'Please log in to proceed.');
      setIsLoading(false); // Hide loading state
      return;
    }

    const response = await fetch('https://finalccspayment.onrender.com/api/auth/carthome', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.message === "No items in cart") {
        Alert.alert('No Cart Available', 'There are no items in your cart.');
      } else if (data.cart && data.cart.length > 0) {
        
      } else {
       
        router.push('/AddToCart');
      }
    } else {
      Alert.alert('Error', 'Failed to check the cart availability.');
    }
  } catch (error) {
    console.error('Error checking cart:', error);
    Alert.alert('Error', 'An error occurred while checking the cart.');
  } finally {
    setIsLoading(false); // Hide loading state
  }
};




  
  
  

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  setLoading(true); // Start loading
  
  try {
    // Fetch user data, products, and payments
    await Promise.all([fetchUserData(), fetchProducts(), fetchPaymentsBySemester()]);

    // Load unread count from AsyncStorage
    const savedUnreadCount = await AsyncStorage.getItem('unreadCount');
    if (savedUnreadCount) {
      setUnreadCount(parseInt(savedUnreadCount, 10));
    }

    // Wait for 3.8 seconds after the fetches are done
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false); // End loading after 3.8 seconds
    }, 3800);
  } catch (error) {
    console.error('Error fetching data:', error);
    setRefreshing(false);
    setLoading(false);
  }
}, []);

// Use useEffect to call onRefresh on initial load
useEffect(() => {
  onRefresh(); // Fetch data initially
}, [onRefresh]);

if (loading) {
  return (
    <View style={styles.containerloading}>
      {/* Logo */}
      <Image 
        source={require('../assets/images/ccsdeptlogo.png')} 
        style={styles.logos} 
      />
      
      {/* Message */}
      <Text style={styles.message}>Loading pythons, please wait...</Text>
      
      {/* Aesthetic Animation */}
      <ActivityIndicator size="large" color="#00FF7F" />
    </View>
  );
}
  

  const HomeScreen: React.FC<{ firstName?: string; lastName?: string; products?: any[] }> = ({ firstName, lastName, products }) => (
    <ScrollView
      contentContainerStyle={styles.screenContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logo} />
        <Text style={styles.header}>College of Computing Studies</Text>
      </View>
      {firstName && lastName ? (
        <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={styles.welcomeText}>Welcome Pythons, {firstName} {lastName} !</Text>
        <View style={styles.iconRowContainer}>
        <TouchableOpacity
  onPress={checkCartAvailability}
  style={styles.addToCartButton}
  disabled={isLoading} 
>
<Text style={styles.addToCartText}>
    {isLoading ? 'Checking Cart...' : ''}
  </Text>
  <MaterialIcons
    name="shopping-cart" 
    size={24} 
    color="darkgreen" 
    style={styles.icon} 
  />
</TouchableOpacity>
<View style={styles.iconSpacer} />
<TouchableOpacity
  onPress={() => {
    setIsLoading(true);
    router.push('/UserPreOrders'); // Navigate to UserPreOrders.tsx
  }}
  style={styles.addToCartButton}
  disabled={isLoading} 
>
  <Text style={styles.addToCartText}>
    {isLoading ? 'Loading Pre-Orders...' : ''}
  </Text>
  <MaterialIcons
    name="list-alt" 
    size={24} 
    color="darkgreen" 
    style={styles.icon} 
  />
</TouchableOpacity>

</View>
      </TouchableOpacity>
      ) : (
        <Text>Loading...</Text>
      )}
      <View style={styles.searchContainer}>
    <TouchableOpacity onPress={handleSearchPress}>
      <Text style={styles.searchText}>Search Products...</Text>
    </TouchableOpacity>
  </View>
      
      

 
    <View>
      {/* Render modals for each order */}
      {orderDetails.map((orderDetail, index) => (
        <Modal
          key={orderDetail.order_transaction_id} // Unique key for each modal
          visible={modalVisible[index]} // Use array index to control visibility
          onRequestClose={() => closeModal(index)} // Close specific modal
          animationType="slide"
          transparent={true}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => closeModal(index)}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View>
                <View style={styles.modalContent}>
                  {loading ? (
                    <ActivityIndicator size="large" color="#00FF7F" />
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>Order Transaction ID: {orderDetail.order_transaction_id}</Text>
                      <Text style={styles.modalText}>Message: {orderDetail.message}</Text>
                      <Text style={styles.modalText}>By: {orderDetail.organization_name}</Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => closeModal(index)}
                      >
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      ))}
    </View>


    
    {products && products.length > 0 ? (
  <View style={styles.productsGrid}>
    {products.map((product, index) => (
      <TouchableOpacity 
        key={product.product_id ? `product-${product.product_id}` : `product-${index}`} 
        style={styles.productContainer} // Remove the logic for margin between items
        onPress={() => handleProductClick(product.product_id)}
      >
        {product.product_image ? (
        <Image 
          source={{ uri: product.product_image }} 
          style={styles.productImage} 
          onError={() => console.error(`Failed to load image: ${product.product_image}`)}
        />
      ) : (
        <Text >Image not available</Text>
      )}
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.price}>Price: ₱{product.price}</Text>
      </TouchableOpacity>
    ))}
  </View>
) : (
  <Text style={styles.noProductsText}>No products available.</Text>
)}



      
    </ScrollView>
  );


  const PaymentScreen = () => {
    const [semesterPayments, setSemesterPayments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [filter, setFilter] = useState('All'); // Default filter
    const router = useRouter();
  
    const fetchPaymentsBySemester = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.push('/');
          return;
        }
  
        const response = await fetch('https://finalccspayment.onrender.com/api/auth/payments/by-semester', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorDetails = await response.json();
          console.error('Server error details:', errorDetails);
          throw new Error('Failed to fetch payments by semester');
        }
  
        const data = await response.json();
        setSemesterPayments(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchPaymentsBySemester();
      setRefreshing(false);
    }, []);
  
    useEffect(() => {
      onRefresh();
    }, [onRefresh]);
  
    const handleAddPayment = (paymentId: number) => {
      router.push(`/AddPaymentMobile?paymentId=${paymentId}`);
    };
  
    const handleFilterChange = (filterType: string) => {
      setFilter(filterType);
    };
  
    const filteredPayments = semesterPayments.map((semester: any) => {
      return {
        ...semester,
        payments: semester.payments.filter((payment: any) => {
          if (filter === 'Mandatory') return payment.payment_type === 'Mandatory';
          if (filter === 'Not mandatory') return payment.payment_type === 'Not mandatory';
          if (filter === 'Other fees') return payment.payment_type === 'Other fees';
          return true;
        }),
      };
    });
  
    return (
      <ScrollView
        contentContainerStyle={styles.screenContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Clearance Fees</Text>
  
        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
  <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('All')}>
    <Text style={styles.filterButtonText}>All</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Mandatory')}>
    <Text style={styles.filterButtonText}>Mandatory</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Not mandatory')}>
    <Text style={styles.filterButtonText}>Not Mandatory</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.filterButton} onPress={() => handleFilterChange('Other fees')}>
    <Text style={styles.filterButtonText}>Other Fees</Text>
  </TouchableOpacity>
</View>


  
        {filteredPayments.length > 0 ? (
          filteredPayments.map((semester: any, index: number) => (
            <View key={index} style={styles.semesterContainer}>
              <Text style={styles.semesterName}>{semester.semester}</Text>
              {semester.payments.length > 0 ? (
                semester.payments.map((payment: any, paymentIndex: number) => (
                  <View key={paymentIndex} style={styles.paymentContainer}>
                    <View style={styles.paymentRow}>
                    <Image
                      source={payment.organization.photo ? { uri: payment.organization.photo } : require('../assets/images/ccsdeptlogo.png')}
                      style={styles.logoss}
                    />
                      <Text style={styles.paymentName}>{payment.name}</Text>
                      <Text style={styles.paymentPrice}>₱{payment.price}</Text>
                      
                      <Button
                        title=">>"
                        onPress={() => handleAddPayment(payment.id)} // Navigate with payment ID
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text>No payments found for this semester.</Text>
              )}
            </View>
          ))
        ) : (
          <Text>No semester payments available.</Text>
        )}
      </ScrollView>
    );
  };
  const TransactionScreen = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter();
  
    // Get status style for transaction
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'Paid':
          return { color: 'green' };
        case 'Decline':
          return { color: 'pink' };
        case 'Processing':
          return { color: 'blue' };
        case 'Balance':
          return { color: 'red' };
        default:
          return { color: 'black' };  // Default color if no match
      }
    };
  
    // Function to fetch transactions
    const fetchTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.push('/');
          return;
        }
  
        const response = await fetch('https://finalccspayment.onrender.com/api/auth/transactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          // Handle error
        }
  
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        // Handle error
      }
    };
  
    // Handle refresh action
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchTransactions();
      setRefreshing(false);
    }, []);
  
    useEffect(() => {
      onRefresh();
    }, [onRefresh]);
  
    // Handle view transaction details
    const handleViewTransactions = (transactionId: number) => {
      router.push(`/TransactionDetailsScreen?transactionId=${transactionId}`);
    };
  
    // Handle Add Balance Payment button press
    const handleAddBalancePayment = (transactionId: number) => {
      router.push(`/AddBalancePayment?transactionId=${transactionId}`);
    };
  
    return (
      <ScrollView
        contentContainerStyle={styles.screenContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Transactions</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionContainer}>
              <Text style={styles.transactionId}>Transaction ID: {transaction.transaction_id}</Text>
              <Text style={styles.transactionAmount}>Amount: ₱{transaction.total_amount}</Text>
              <Text style={styles.transactionAmount}>Payment method: {transaction.payment_method}</Text>
              <Text style={styles.transactionDate}>Date: {new Date(transaction.created_at).toLocaleDateString()}</Text>
  
              <Text style={[styles.transactionStatus, getStatusStyle(transaction.payment_status)]}>
                Status: {transaction.payment_status}
              </Text>
  
              <TouchableOpacity 
  style={styles.transactionButton} 
  onPress={() => handleViewTransactions(transaction.transaction_id)}
>
  <Text style={styles.transactionButtonText}>View Details</Text>
</TouchableOpacity>

{transaction.payment_method === 'Gcash' && transaction.payment_status === 'Balance' && (
        <TouchableOpacity 
          style={styles.transactionButton} 
          onPress={() => handleAddBalancePayment(transaction.transaction_id)}
        >
          <Text style={styles.transactionButtonText}>Add Balance Payment</Text>
        </TouchableOpacity>
      )}

            </View>
          ))
        ) : (
          <Text>No transactions available.</Text>
        )}
      </ScrollView>
    );
  };

  const RecentOrdersScreen = () => {
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter();
  
    // Fetch recent orders by calling the backend API
    const fetchRecentOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.push('/');
          return;
        }
  
        const response = await fetch('https://finalccspayment.onrender.com/api/auth/recent-orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          
        }
  
        const data = await response.json();
        setRecentOrders(data);
      } catch (error) {
        
      }
    };
  
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchRecentOrders();
      setRefreshing(false);
    }, []);
  
    useEffect(() => {
      onRefresh();
    }, [onRefresh]);

    const handleViewProdcutTransaction = (orderTransactionId: number) => {
      router.push(`/ProductTransactionDetailsScreen?orderTransactionId=${orderTransactionId}`);
    };

    const handlePayBalance = (orderTransactionId: number) => {
      router.push(`/PayBalance?orderTransactionId=${orderTransactionId}`);
  };
  
    return (
      <ScrollView
  contentContainerStyle={styles.screenContainer}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
>
  <Text style={styles.title}>Orders</Text>
  {recentOrders.length > 0 ? (
    recentOrders.map((order: any, index: number) => (
      <View key={index} style={styles.orderContainer}>
        <Text style={styles.orderId}>Order ID: {order.order_transaction_id}</Text>
        
        <Text style={styles.amount}>Total Amount: ₱{order.total_amount}</Text>
        <Text style={styles.orderStatus}>Status: {order.status}</Text>
        
        <Text style={styles.orderStatus}>Order Status: {order.order_status}</Text>
        <TouchableOpacity 
  style={styles.transactionButton} 
  onPress={() => handleViewProdcutTransaction(order.order_transaction_id)}
>
  <Text style={styles.transactionButtonText}>View Details</Text>
</TouchableOpacity>

{order.status === 'Balance' && (
  <TouchableOpacity 
    style={styles.transactionButton} 
    onPress={() => handlePayBalance(order.order_transaction_id)}
  >
    <Text style={styles.transactionButtonText}>Pay Balance</Text>
  </TouchableOpacity>
)}


      </View>
    ))
  ) : (
    <Text style={styles.noOrdersText}>No orders found.</Text>
  )}
</ScrollView>

    );
  };

  const MoreScreen = () => {
    const handleLogoutConfirmation = () => {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: handleLogout },
        ],
        { cancelable: false }
      );
    };
  
    const handleLogout = async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        Alert.alert('Logged out successfully!');
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
        Alert.alert('Logout failed. Please try again.');
      }
    };
    const fadeAnim = new Animated.Value(0); // Fade in animation
    const scaleAnim = new Animated.Value(0.8); // Scale effect
    const translateYAnim = new Animated.Value(20); // Move upwards on mount
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  

    return (
      <View style={styles.screenContainer}>
      <View style={styles.headerContainers}>
        <Text style={styles.title}>User Dashboard</Text>

        {/* More Icon Button */}
        <TouchableOpacity onPress={() => router.push('/MoreOptions')} style={styles.moreButton}>
          <MaterialIcons name="more-horiz" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {userData ? (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>
            {userData.firstname} {userData.middlename} {userData.lastname}
          </Text>

          <View style={styles.emailContainer}>
            <MaterialIcons name="email" size={24} color="darkgreen" style={styles.emailIcon} />
            <Text style={styles.emailText}>{userData.email}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading user data...</Text>
      )}

      {/* Dashboard Boxes with Animation */}
      <Animated.View
        style={[
          styles.dashboardContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <View style={styles.box}>
          <MaterialIcons name="receipt" size={40} color="darkgreen" />
          <Text style={styles.boxTitle}>Payments</Text>
          <Text style={styles.boxValue}>{transactionCount}</Text>
        </View>

        <View style={styles.box}>
          <MaterialIcons name="store" size={40} color="darkgreen" />
          <Text style={styles.boxTitle}>Orders</Text>
          <Text style={styles.boxValue}>{productTransactionCount}</Text>
        </View>
      </Animated.View>
    </View>

    );
  };

  
  interface Log {
    id: number;
    action: string;
    action_message?: string;
    created_at: string;
    status: string;
    order_status: string;
    payment_method?: string;
    transaction_id?: string;
    order_transaction_id?: string;
    read: boolean; // Track whether the notification has been read
  }
  
  interface NotificationsProps {
    onUnreadCountChange: (count: number) => void; // Function that takes a number and returns void
  }
  
  const Notifications: React.FC<NotificationsProps> = ({ onUnreadCountChange }) => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
  
    useEffect(() => {
      const fetchLogs = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
    
          if (!token) {
            console.error('No user token found, redirecting to login.');
            setLoading(false);
            return;
          }
    
          const response = await fetch('https://finalccspayment.onrender.com/api/auth/getAllLogs', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
    
          const responseData = await response.json();
    
          if (responseData.success && Array.isArray(responseData.logs)) {
            const serverLogs: Log[] = responseData.logs;
    
            // Get local logs
            const savedLogsString = await AsyncStorage.getItem('logs');
            const savedLogs: Log[] = savedLogsString ? JSON.parse(savedLogsString) : [];
    
            // Update local logs with server logs
            const updatedLogs = serverLogs.map((serverLog) => {
              const existingLog = savedLogs.find((log) => log.id === serverLog.id);
              return existingLog ? { ...existingLog, ...serverLog } : serverLog; // Update or add
            });
    
            // Remove logs that are no longer on the server
            const filteredLogs = updatedLogs.filter((log) =>
              serverLogs.some((serverLog) => serverLog.id === log.id)
            );
    
            // Count unread notifications
            const unreadNotifications = filteredLogs.filter((log) => !log.read).length;
    
            // Update state and AsyncStorage
            setLogs(filteredLogs);
            setUnreadCount(unreadNotifications);
            onUnreadCountChange(unreadNotifications);
            await AsyncStorage.setItem('logs', JSON.stringify(filteredLogs));
            await AsyncStorage.setItem('unreadCount', unreadNotifications.toString());
          } else {
            console.error('Invalid response format:', responseData);
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchLogs();
    }, []);
    const markAllAsRead = async () => {
      const updatedLogs = logs.map((log) => ({ ...log, read: true }));
    
      setLogs(updatedLogs);
      setUnreadCount(0);
      onUnreadCountChange(0);
    
      // Save to AsyncStorage
      await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
      await AsyncStorage.setItem('unreadCount', '0');
    };
    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case 'processing':
          return { color: 'blue' };
        case 'paid':
          return { color: 'green' };
        case 'balance':
          return { color: 'pink' };
        case 'declined':
          return { color: 'red' };
        case 'pending':
          return { color: 'orange' };
        case 'accepted':
          return { color: 'green' };
        case 'pending balance':
            return { color: 'orange' };
        default:
          return { color: 'black' };
      }
    };

    
    
  
    if (loading) {
      return (
        <View style={styles.containerloading}>
          <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logos} />
          <Text style={styles.message}>Loading pythons, please wait...</Text>
          <ActivityIndicator size="large" color="#00FF7F" />
        </View>
      );
    }
  
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Text style={styles.unreadCount}>You have {unreadCount} unread notifications</Text>
        )}
        <TouchableOpacity style={styles.buttonr} onPress={markAllAsRead}>
        <Text style={styles.buttonTextr}>Mark All as Read</Text>
      </TouchableOpacity>
  
        {logs.length > 0 ? (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
  <Text style={styles.logText}>
    {new Date(item.created_at).toLocaleString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    })}
  </Text>

 
  {!item.order_transaction_id && !item.transaction_id && (
    <Text style={styles.logText}>
      your status {item.action}
      {item.action_message ? ` - ${item.action_message}` : ''}
    </Text>
  )}

{item.transaction_id && (
    <>
      <Text style={styles.logText}>
        Transaction ID: {item.transaction_id}
      </Text>
      <Text style={[styles.logText]}>
          {item.action}
        </Text>
     
    </>
  )}


  {item.order_transaction_id && (
    <>
      <Text style={styles.logText}>
        Order Transaction ID: {item.order_transaction_id}
      </Text>
      <Text style={[styles.logText]}>
          {item.action_message}
        </Text>
     
      
    </>
  )}

  {/* Other content */}
  {!item.read && (
    <Text style={styles.newNotificationText}>New !!</Text>
  )}
</View>

            )}
          />
        ) : (
          <Text style={styles.noLogsText}>No notifications available.</Text>
        )}
      </View>
    );
  };
  
  
  return (
    
    <Tab.Navigator
    screenOptions={{
      headerShown: false, // Hides the upper header
      tabBarStyle: {
        backgroundColor: '#ffffff',
        height: 70,
        paddingBottom: 10,
        paddingTop: 5,
        borderTopWidth: 0,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'normal',
        color: 'black',
      },
      tabBarActiveTintColor: 'green',
      tabBarInactiveTintColor: 'black',
      tabBarIconStyle: { marginTop: -5 },
    }}
    >
      <Tab.Screen 
        name="Home" 
        children={() => <HomeScreen firstName={userData?.firstname} lastName={userData?.lastname} products={products} />} 
        options={{ 
          tabBarLabel: 'Home', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Payment" 
        component={PaymentScreen} 
        options={{ 
          tabBarLabel: 'Payment', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="payment" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Transaction" 
        component={TransactionScreen} 
        options={{ 
          tabBarLabel: 'Transaction', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Orders" 
        component={RecentOrdersScreen} 
        options={{ 
          tabBarLabel: 'Orders', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="store" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen
        name="Notifications"
        children={() => <Notifications onUnreadCountChange={handleUnreadCountChange} />}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined, // Show badge with unread count
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={MoreScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  transactionButton: {
    backgroundColor: '#004d00', // Dark green color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10, // Rounded corners for better aesthetics
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%', // Ensures full width appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, 
  },
  transactionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  moreButton: {
    padding: 8,
    backgroundColor: '#004d00',
    borderRadius: 8,
  },
  iconRowContainer: {
    flexDirection: 'row', // Align icons in a row (left to right)
    
    marginTop: 10,
  },
  addToCartButton: {
    flexDirection: 'row', // Align icon and text in a row
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6, // Add spacing between icon and text
  },
  addToCartText: {
    fontSize: 16,
    color: '#333',
  },
  iconSpacer: {
    width: 10, // Adjust spacing between the two buttons
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  userInfoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailText: {
    fontSize: 18,
    color: 'white',
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  box: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  boxValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 5,
  },
  logoss: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  preOrderButton: {
    backgroundColor: '#004d00',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  preOrderText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },

  payBalanceButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
},
payBalanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
},
  filterButtonsContainer: {
    
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',  // Allow buttons to wrap to the next line
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginVertical: 5,
    width: '45%', // Adjust width to fit two buttons per row
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#004d00',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#034b03',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonr: {
    backgroundColor: '#004d00', // Green color for the background
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonTextr: {
    color: '#fff', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadCount: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'normal',
    
  },
  statusTexta: {
    fontSize: 16,
    fontWeight: 'normal',
    color: 'red'
    
  },
  newNotificationText: {
    fontSize: 12,
    color: 'orange',
    fontWeight: 'bold',
  },
  noLogsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // For Android shadow
  },
  logDetailContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  logText: {
    fontSize: 16,
    color: '#333',
    
  },
  
  transactionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  containerloading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B3A28',
  },
  logos: {
    width: 120, // Adjust based on your logo size
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
  slide: {
    width: 350,
    padding: 6,
    marginRight: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    backgroundColor: '#1B3A28',
    borderWidth: 2,
    borderColor: '#ddd',
    color: '#1B3A28',

  },
  titleContainer: {
    marginBottom: 0,
    fontWeight: 'bold',
    color: '#1B3A28',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 12,
    color: '#1B3A28',
    fontSize: 20,
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    elevation: 2, // Adds shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 24,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 22,
    color: '#333',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700', 
    marginTop: 10,
    paddingVertical: 5, 
    paddingHorizontal: 10,

    textAlign: 'center', 
    color: '#333',
    
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: '700', 
    marginTop: 10,
    paddingVertical: 5, 
    paddingHorizontal: 10,
    borderRadius: 20, 
    textAlign: 'center', 
    backgroundColor: '#f0f0f0', 
    color: '#333', 
  },
  amount: {
    fontSize: 16,
    fontWeight: '700', 
    marginTop: 10,
    paddingVertical: 5, 
    paddingHorizontal: 10,

    textAlign: 'center', 
    color: '#1976d2',
  
  },
  paymentMethod: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
  
  transactionContainer: {
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0', 
    borderRadius: 10, 
    backgroundColor: '#f9f9f9', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 4, 
  },

 
  transactionId: {
    fontSize: 18,
    fontWeight: '600', 
    color: '#333', 
  },


  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold', 
    marginTop: 10, 
    color: '#2e7d32',
  },


  transactionDate: {
    fontSize: 14,
    marginTop: 5,
    color: '#757575', 
  },

 
  transactionStatus: {
    fontSize: 16,
    fontWeight: '700', 
    marginTop: 10,
    paddingVertical: 5, 
    paddingHorizontal: 10,
    borderRadius: 20, 
    textAlign: 'center', 
    backgroundColor: '#f0f0f0', 
    color: '#333', 
  },
 
  
  
  productsGrid: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  productContainer: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 250,
    marginBottom: 10,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: "#1B3A28",
  },
  price: {
    fontSize: 12,
    color: '#1B3A28',
  },
  cartItemContainer: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  semesterContainer: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  semesterName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
    textTransform: 'capitalize',
  },
  paymentContainer: {
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f5f5f5',  // Light off-white color for subtle contrast
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  paymentName: {
    flex: 1,
    color: '#333333',
    fontSize: 16,
    fontWeight: '400',
  },
  paymentPrice: {
    flex: 1,
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    marginRight: 10,
  },
    screenContainer: {
      backgroundColor: '#1B3A28',
      padding: 20,
      flexGrow: 1,
    },headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    headerContainers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
    logo: {
      width: 50,
      height: 50,
      backgroundColor: 'white',
      borderRadius: 30, // Optional: adds rounded corners to the image
      marginRight: 5, // Space between logo and text
    },
    header: {
      fontSize: 20,
      color: 'white',
      fontWeight: 'bold',
      
    },
    welcomeText: {
      color: 'white',
      fontSize: 17,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 15,
      textAlign: 'center',
    },
    
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    reviewButton: {
      backgroundColor: 'lightgray',
      padding: 5,
      borderRadius: 5,
      alignItems: 'center',
    },
    reviewText: {
      color: 'green',
    },
    searchContainer: {
      marginVertical: 20,
    },
    
    searchText: {
      backgroundColor: '#fff',
      color: '#000',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,  // Match text color to your app's theme
       // Optional, makes it look like a link
    },
});

export default CcspaymentHome;
