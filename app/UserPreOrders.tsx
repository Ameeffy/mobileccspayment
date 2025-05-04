import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const UserPreOrders = () => {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [preOrders, setPreOrders] = useState<any[]>([]);
    const [selectedOrderLogs, setSelectedOrderLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchPreOrders();
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert("Error", "User not authenticated.");
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
            setUserId(data.id);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert("Error", "Failed to fetch user data.");
        }
    };

    const fetchPreOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`https://finalccspayment.onrender.com/api/auth/pre-ordersusers?user_id=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch Pre-Orders");

            const data = await response.json();
            setPreOrders(data);
        } catch (error) {
            console.error('Error fetching pre-orders:', error);
            Alert.alert("Error", "Failed to load pre-orders.");
        }
    };

    const fetchPreOrderLogs = async (pre_order_id: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`https://finalccspayment.onrender.com/api/auth/pre-orders/${pre_order_id}/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch Pre-Order Logs");

            const data = await response.json();
            setSelectedOrderLogs(data);
            setShowLogs(true);
            setSelectedOrderId(pre_order_id);
        } catch (error) {
            console.error('Error fetching logs:', error);
            Alert.alert("Error", "Failed to load logs.");
        }
    };

    const removePreOrder = async (pre_order_id: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            Alert.alert(
                "Remove Pre-Order",
                "Are you sure you want to remove this Pre-Order? The stock limit will be restored.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Yes, Remove",
                        onPress: async () => {
                            try {
                                const response = await fetch("https://finalccspayment.onrender.com/api/auth/remove-preorder", {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ pre_order_id })
                                });

                                const data = await response.json();
                                if (response.ok) {
                                    Alert.alert("Success", data.message);
                                    fetchPreOrders(); // Refresh Pre-Orders List
                                } else {
                                    Alert.alert("Error", data.message);
                                }
                            } catch (error) {
                                console.error("Error removing Pre-Order:", error);
                                Alert.alert("Error", "Failed to remove Pre-Order.");
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error("Error:", error);
        }
    };
    const handleNavigateToProofUpload = (preOrderId: number) => {
        router.push(`/UserPreOrderProofOfPayment?preOrderId=${preOrderId}`);
    };
    const RhandleNavigateToProofUpload = (preOrderId: number) => {
        router.push(`/UserPreOrderProofOfPaymentR?preOrderId=${preOrderId}`);
    };
    const BalancehandleNavigateToProofUpload = (preOrderId: number) => {
        router.push(`/UserBalancePreOrderProofOfPayment?preOrderId=${preOrderId}`);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Your Pre-Orders</Text>

            <ScrollView style={styles.listContainer}>
                {preOrders.length === 0 ? (
                    <Text style={styles.emptyText}>No Pre-Orders found.</Text>
                ) : (
                    preOrders.map(order => (
                        <View key={order.id} style={styles.orderCard}>
                            <Text style={styles.productName}>{order.product_name}</Text>
                            <Text style={styles.orderDetails}>Status: {order.status}</Text>
                            <Text style={styles.orderDetails}>Total Amount: ₱{order.total_amount}</Text>
                            <Text style={styles.orderDetails}>Payment: {order.payment_method}</Text>

                            {order.payment_method === 'Gcash' && !order.proof_of_payment && (
                            <TouchableOpacity
                                style={styles.viewLogsButton}
                                onPress={() => handleNavigateToProofUpload(order.id)}
                            >
                                <Text style={styles.buttonText}>Send Proof of Payment</Text>
                            </TouchableOpacity>
                        )}
                         {order.payment_method === 'Gcash'  && 
 order.status === 'Declined' && (
    <TouchableOpacity
        style={styles.viewLogsButton}
        onPress={() => RhandleNavigateToProofUpload(order.id)}
    >
        <Text style={styles.buttonText}>Send Proof of Payment Declined</Text>
    </TouchableOpacity>
)}

{order.payment_method === 'Gcash'  && 
 order.status === 'Balance' && (
    <TouchableOpacity
        style={styles.viewLogsButton}
        onPress={() => BalancehandleNavigateToProofUpload(order.id)}
    >
        <Text style={styles.buttonText}>Send Proof of Payment Balance</Text>
    </TouchableOpacity>
)}


                            <TouchableOpacity
                                style={styles.viewLogsButton}
                                onPress={() => fetchPreOrderLogs(order.id)}
                            >
                                <Text style={styles.buttonText}>View Logs</Text>
                            </TouchableOpacity>

                            {order.status === "Pending" && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removePreOrder(order.id)}
                                >
                                    <Text style={styles.buttonText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {showLogs && (
                <View style={styles.logsContainer}>
                    <Text style={styles.logsTitle}>Pre-Order Logs (Order #{selectedOrderId})</Text>
                    <ScrollView>
                        {selectedOrderLogs.length === 0 ? (
                            <Text style={styles.emptyText}>No logs available.</Text>
                        ) : (
                            selectedOrderLogs.map(log => (
                                <Text key={log.id} style={styles.logEntry}>{log.action} - {log.status}</Text>
                            ))
                        )}
                    </ScrollView>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowLogs(false)}>
                        <Text style={styles.buttonText}>Close Logs</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
   
    viewLogsButton: { backgroundColor: '#ff6347', padding: 8, marginTop: 10, borderRadius: 5, alignItems: 'center' },
    removeButton: { backgroundColor: '#d9534f', padding: 8, marginTop: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16 },
    
    emptyText: {
        color: '#004d00',
    },
    backButton: { 
        marginBottom: 10, 
        width: 80, 
        backgroundColor: '#004d00', 
        borderRadius: 10, 
        alignItems: 'center', 
        padding: 10 
    },
    backButtonText: { 
        color: '#fff', 
        fontSize: 16 
    },
    container: { 
        flex: 1, 
        backgroundColor: '#1B3A28', 
        padding: 20, 
        alignItems: 'center' 
    },
    title: { 
        fontSize: 24, 
        color: '#fff', 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    listContainer: { 
        width: '100%' 
    },
    orderCard: { 
        backgroundColor: '#fff', 
        padding: 15, 
        marginBottom: 10, 
        borderRadius: 10 
    },
    productName: { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    orderDetails: { 
        fontSize: 14, 
        marginTop: 5 
    },
    actionButton: { 
        backgroundColor: '#004d00', 
        paddingVertical: 12, 
        paddingHorizontal: 20, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 10, 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 3 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4 
    },
    actionButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    disabledButton: { 
        backgroundColor: '#004d00', 
        opacity: 0.6 
    },
    logsContainer: { 
        backgroundColor: '#fff', 
        padding: 15, 
        marginTop: 20, 
        borderRadius: 10 
    },
    logsTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    logEntry: { 
        fontSize: 14, 
        paddingVertical: 5 
    },
    closeButton: { 
        backgroundColor: '#004d00', 
        padding: 10, 
        marginTop: 10, 
        borderRadius: 5, 
        alignItems: 'center' 
    }
});

export default UserPreOrders;
