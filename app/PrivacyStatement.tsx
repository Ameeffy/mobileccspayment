import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PrivacyStatement = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logo} />
      </View>
      
      <Text style={styles.header}>Privacy Statement</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Data Collection</Text>
        <Text style={styles.text}>
          1. We collect user data only to facilitate app functionalities such as transactions, account management, and personalized services.
        </Text>
        <Text style={styles.text}>
          2. All collected data is handled with strict confidentiality and stored securely to prevent unauthorized access.
        </Text>
        
        <Text style={styles.title}>Data Usage</Text>
        <Text style={styles.text}>
          3. User data is used solely for operational purposes, including improving app performance, facilitating transactions, and ensuring security.
        </Text>
        <Text style={styles.text}>
          4. No user data will be shared with third parties without explicit consent, except where required by law or for fraud prevention.
        </Text>
        
        <Text style={styles.title}>User Rights</Text>
        <Text style={styles.text}>
          5. Users have the right to access, modify, or delete their personal data. Requests can be made through the app or by contacting support.
        </Text>
        <Text style={styles.text}>
          6. Users can withdraw consent for data processing at any time, which may impact app functionalities.
        </Text>
        
        <Text style={styles.title}>Cookies and Tracking</Text>
        <Text style={styles.text}>
          7. Cookies and similar technologies are used to enhance user experience, such as remembering preferences and providing relevant content.
        </Text>
        <Text style={styles.text}>
          8. Users can manage cookie settings through their device or browser preferences.
        </Text>
        
        <Text style={styles.title}>Security</Text>
        <Text style={styles.text}>
          9. We implement industry-standard security measures to protect user data from breaches and unauthorized access.
        </Text>
        <Text style={styles.text}>
          10. In the event of a data breach, affected users will be notified promptly with guidance on protecting their information.
        </Text>
        
        <Text style={styles.title}>Changes to This Policy</Text>
        <Text style={styles.text}>
          11. This Privacy Statement may be updated periodically to reflect changes in laws, regulations, or app functionalities.
        </Text>
        <Text style={styles.text}>
          12. Users will be notified of significant updates through the app or via email.
        </Text>
      </View>
    </ScrollView>
  );
};

export default PrivacyStatement;

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
