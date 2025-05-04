import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TermsAndConditions = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logo} />
      </View>
      
      <Text style={styles.header}>Terms and Conditions</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>General Terms</Text>
        <Text style={styles.text}>
          1. Users must provide accurate and truthful information when registering, placing orders, or making payments. Any false or misleading information may result in account suspension or termination.
        </Text>
        <Text style={styles.text}>
          2. Unauthorized access, system tampering, or misuse of any functionality is prohibited and will be penalized under applicable laws.
        </Text>
        <Text style={styles.text}>
          3. The College of Computing Studies reserves the right to amend these terms and conditions at any time. Users will be informed of significant updates.
        </Text>
        
        <Text style={styles.title}>Transactions (Clearance Fees)</Text>
        <Text style={styles.text}>
          4. Payments for clearance fees must be verified before submission. Once confirmed, these payments are considered final and non-refundable unless a proven error has occurred.
        </Text>
        <Text style={styles.text}>
          5. All transactions related to clearance fees will be recorded and can be used for verification purposes in case of discrepancies.
        </Text>

        <Text style={styles.title}>Product Transactions (Orders and Products)</Text>
        <Text style={styles.text}>
          6. Orders for products, such as merchandise or services, must be reviewed carefully before confirmation. Changes or cancellations are only allowed before finalizing the order.
        </Text>
        <Text style={styles.text}>
          7. Availability of products is subject to stock and pricing updates. Users will be informed of any changes during the ordering process.
        </Text>
        <Text style={styles.text}>
          8. Any disputes regarding orders or product-related issues must be reported within seven (7) days of the transaction for resolution.
        </Text>
        
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.text}>
          9. Payments processed through this system are secured. Any issues related to payments must be reported immediately to the support team for investigation.
        </Text>       
        <Text style={styles.title}>System Monitoring</Text>
        <Text style={styles.text}>
          10. All user activities within the system are monitored to ensure compliance and security. Any suspicious or unauthorized actions will be flagged for review.
        </Text>
        <Text style={styles.text}>
          11. The system undergoes regular audits to maintain accuracy and security. Users are encouraged to report any inconsistencies they encounter while using the platform.
        </Text>
      </View>
    </ScrollView>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1B3A28', // Dark green background for a professional look
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 16,
    padding: 10,
    backgroundColor: '#004d00', // Darker green for consistency
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 120,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
});
