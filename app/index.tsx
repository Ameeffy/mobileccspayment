import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const IndexScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Section with Logo */}
      <View style={styles.topSection}>
        <Image
          source={require('../assets/images/ccsdeptlogo.png')}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.collegeText}>College of Computing Studies</Text>
        <Text style={styles.descriptionText}>
        We are excited to introduce an efficient payment platform dedicated to our department. Our system ensures a smooth and hassle-free experience. Explore our platform, designed to meet the unique needs of students and staff in the College of Computing Studies.
        </Text>
      </View>

      {/* Bottom Section with Buttons */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
  },
  topSection: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 4,
    borderColor: '#1B3A28',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    color: '#1B3A28',
    fontWeight: 'bold',
  },
  collegeText: {
    fontSize: 22,
    color: '#1B3A28',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  bottomSection: {
    flex: 3,
    backgroundColor: '#1B3A28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    marginBottom: 15,
    backgroundColor: '#004d00', // Aesthetic dark green
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default IndexScreen;
