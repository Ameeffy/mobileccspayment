import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const AboutUs = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/ccsdeptlogo.png')} style={styles.logo} />
      </View>

      <Text style={styles.header}>College of Computing Studies</Text>

      <View style={styles.formContainer}>
        <Text style={styles.title}>About Us</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.subHeading}>Categories:</Text>
          <Text style={styles.text}>College & University</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.subHeading}>Contact Info:</Text>
          <Text style={styles.text}>Normal Road, Baliwasan, 7000</Text>
          <Text style={styles.text}>Email: <Text style={styles.link}>ics@wmsu.edu.ph</Text></Text>
          <Text style={styles.text}>Website: <Text style={styles.link}>http://www.wmsu.edu.ph/</Text></Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.subHeading}>Programs Offered:</Text>
          <Text style={styles.text}>- Bachelor of Science in Information Technology (BSIT)</Text>
          <Text style={styles.text}>- Bachelor of Science in Computer Science (BSCS)</Text>
          <Text style={styles.text}>- Associate in Computer Technology (ACT)</Text>
          <Text style={styles.text}>- Master of Information Technology (MIT)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A28', // Dark green background for a professional look
  },
  contentContainer: {
    justifyContent: 'flex-start',
    padding: 14,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 15,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
