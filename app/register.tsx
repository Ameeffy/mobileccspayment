import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, ScrollView, TouchableOpacity,Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




const RegisterScreen = () => {
  const router = useRouter();

  // State for registration form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idnumber, setIdnumber] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [contactnumber, setContactnumber] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [blocklotstreetnumber, setBlocklotstreetnumber] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipcode, setZipcode] = useState('');

  // State for validations
  const [emailValid, setEmailValid] = useState(true);
  const [usernameValid, setUsernameValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [idnumberValid, setIdnumberValid] = useState(true);
  const [contactnumberValid, setContactnumberValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for slides and date picker
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(true); // State to control modal visibility

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal when the button is clicked
  };

  // Handle when the user accepts the privacy policy
 


  // Validation functions
  const validateEmail = (email: string) => {
    const isValid = email.endsWith('@wmsu.edu.ph');
    setEmailValid(isValid);
  };

  const validateUsername = (username: string) => {
    const isValid = /^[A-Za-z]{5,}$/.test(username); // Only letters, minimum 5 characters
    setUsernameValid(isValid);
  };

  const validateIdnumber = (idnumber: string) => {
    // Check if the ID number is at least 6 digits long and only contains digits
    const isValid = /^\d{6,}$/.test(idnumber); 
    setIdnumberValid(isValid);
  };
  

  const validateContactnumber = (contactnumber: string) => {
    const isValid = /^\d{11}$/.test(contactnumber); // Exactly 11 digits
    setContactnumberValid(isValid);
  };

  const checkPasswordMatch = (password: string, confirmPassword: string) => {
    setPasswordsMatch(password === confirmPassword);
  };
  const validatePassword = (password: string) => {
    // Regex to validate password with at least 8 characters, an uppercase letter, and a digit
    const isValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    setPasswordValid(isValid);
  };

  // Handle change in the confirm password field
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    checkPasswordMatch(password, text);
  };

  const handleRegister = async () => {
    // Check all validations
    if (!emailValid) {
      Alert.alert('Invalid email', 'Please use an @wmsu.edu.ph email address.');
      return;
    }
    if (!usernameValid) {
      Alert.alert('Invalid username', 'Username must be at least 5 characters long and contain only letters.');
      return;
    }
    if (!passwordValid) {
      Alert.alert('Invalid password', 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!idnumberValid) {
      Alert.alert('Invalid ID Number', 'ID Number should contain only numbers.');
      return;
    }
    if (!contactnumberValid) {
      Alert.alert('Invalid Contact Number', 'Contact Number must be exactly 11 digits long.');
      return;
    }
    if (!course) {
      Alert.alert('Missing Course', 'Please select a course.');
      return;
    }
    if (!section) {
      Alert.alert('Missing Section', 'Please select a section.');
      return;
    }

    try {
      const response = await fetch('https://finalccspayment.onrender.com/api/auth/registers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          idnumber, 
          course, 
          section, 
          firstname, 
          lastname, 
          middlename, 
          contactnumber, 
          gender, 
          
        }),
      });

      const data = await response.json();
      if (response.ok && data.msg === 'User registered successfully') {
        Alert.alert('Registration successful!');
        await AsyncStorage.setItem('userEmail', email);
        router.push('/otpVerification');
      } else {
        Alert.alert(data.msg || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('An error occurred. Please try again.');
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthday;
  setShowDatePicker(Platform.OS === 'ios');
  setBirthday(currentDate);
  };

  const goToLogin = () => {
    router.push('/'); 
  };

  const goToNextSlide = () => {
    switch (currentSlide) {
      case 0:
        if (username && email && password && confirmPassword) {
          if (emailValid && usernameValid && passwordsMatch && passwordValid) {
            setCurrentSlide(1);
          } else {
            Alert.alert('Please fix the errors on the current slide.');
          }
        } else {
          Alert.alert('Please fill all required fields.');
        }
        break;
      case 1:
        if (idnumber && contactnumber ) {
          if (idnumberValid && contactnumberValid ) {
            setCurrentSlide(2);
          } else {
            Alert.alert('Please fix the errors on the current slide.');
          }
        } else {
          Alert.alert('Please fill all required fields.');
        }
        break;
      case 2:
        if (course && section ) {
          setCurrentSlide(3);
        } else {
          Alert.alert('Please select both course and section.');
        }
        break;
      case 3:
        if (firstname && lastname && gender) {
          handleRegister();
        } else {
          Alert.alert('Please fill all address fields.');
        }
        break;
      default:
        break;
    }
  };

  
  
  
  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
<>


<View style={styles.inputContainer}>
  <MaterialIcons name="account-circle" size={20} color="white"style={styles.icon} />
  <TextInput
    style={[styles.input, { borderColor: usernameValid ? 'green' : 'red' }]}
    placeholder="Enter Username"
    placeholderTextColor="gray"
    value={username}
    onChangeText={(text) => {
      setUsername(text);
      validateUsername(text);
    }}
  />
</View>
{!usernameValid && (
  <Text style={styles.errorText}>
    Username must be at least 5 characters long and contain only letters.
  </Text>
)}


<View style={styles.inputContainer}>
  <MaterialIcons name="email" size={20} color="white"style={styles.icon} />
  <TextInput
    style={[styles.input, { borderColor: emailValid ? 'green' : 'red' }]}
    placeholder="Enter Email"
    placeholderTextColor="gray"
    value={email}
    onChangeText={(text) => {
      setEmail(text);
      validateEmail(text);
    }}
    keyboardType="email-address"
  />
</View>
{!emailValid && (
  <Text style={styles.errorText}>Email must end with @wmsu.edu.ph.</Text>
)}


<View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="white" style={styles.icon} />
        <TextInput
          style={[styles.input, { borderColor: passwordValid ? 'green' : 'red' }]}
          placeholder="Enter Password"
          placeholderTextColor="gray"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
          }}
          secureTextEntry={!showPassword}  // Toggle visibility based on state
        />
        {/* Toggle Eye Icon to Show/Hide Password */}
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="white"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {!passwordValid && (
        <Text style={styles.errorText}>
          Include an uppercase letter, a number, and ensure the password is at least 8 characters long.
        </Text>
      )}


<View style={styles.inputContainer}>
        <MaterialIcons name="lock-outline" size={20} color="white" style={styles.icon} />
        <TextInput
          style={[
            styles.input,
            { borderColor: confirmPassword ? (passwordsMatch ? 'green' : 'red') : 'green' },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor="gray"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!showConfirmPassword}  // Toggle visibility based on state
        />
        {/* Toggle Eye Icon to Show/Hide Confirm Password */}
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <MaterialIcons
            name={showConfirmPassword ? "visibility" : "visibility-off"}
            size={20}
            color="white"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {confirmPassword && !passwordsMatch && (
        <Text style={styles.errorText}>Passwords do not match.</Text>
      )}

</>
        );
      case 1:
        return (
          <>
            <View style={styles.inputContainer}>
  <MaterialIcons name="credit-card" size={20} color="white" style={styles.icon} />
  <TextInput
    style={[styles.input, { borderColor: idnumberValid ? 'green' : 'red' }]}
    placeholder="Enter ID Number"
    placeholderTextColor="gray"
    value={idnumber}
    onChangeText={(text) => {
      setIdnumber(text);
      validateIdnumber(text);
    }}
    keyboardType="numeric"
  />
</View>
{!idnumberValid && (
  <Text style={styles.errorText}>ID Number should be at least 6 digits long.</Text>
)}

<View style={styles.inputContainer}>
  <MaterialIcons name="phone" size={20} color="white" style={styles.icon} />
  <TextInput
    style={[styles.input, { borderColor: contactnumberValid ? 'green' : 'red' }]}
    placeholder="Enter Contact Number"
    placeholderTextColor="gray"
    value={contactnumber}
    onChangeText={(text) => {
      setContactnumber(text);
      validateContactnumber(text);
    }}
    keyboardType="numeric"
  />
</View>
{!contactnumberValid && (
  <Text style={styles.errorText}>
    Contact Number must be exactly 11 digits long.
  </Text>
)}

  
            
          </>
        );
      case 2:
        return (
          <>
            <MaterialIcons name="school" size={20} color="white" style={styles.icons} />
           <View style={styles.pickerContainer}>

           <Picker
  selectedValue={course}
  style={styles.picker}
  onValueChange={(itemValue) => setCourse(itemValue)}
  dropdownIconColor="white"  // Optional: to change the dropdown icon color
  itemStyle={{ fontSize: 16 }} // This will set the font size of all items
>
  <Picker.Item label="Select Course" value="" />
  <Picker.Item label="Bachelor of Science in Computer Science" value="BSCS" />
  <Picker.Item label="Bachelor of Science in Information Technology" value="BSIT" />
  <Picker.Item label="Associate in Computer Technology" value="ACT" />
  <Picker.Item label="Master of Information Technology" value="MIT" />
</Picker>

</View>


<MaterialIcons name="assignment" size={20} color="white" style={styles.icons} />
<View style={styles.pickerContainer}>
  
  <Picker
    selectedValue={section}
    style={styles.picker}
    onValueChange={(itemValue) => setSection(itemValue)}
  >
    <Picker.Item label="Select Section" value="" />
    <Picker.Item label="1st Year - Section A" value="1A" />
    <Picker.Item label="1st Year - Section B" value="1B" />
    <Picker.Item label="1st Year - Section C" value="1C" />
    <Picker.Item label="2nd Year - Section A" value="2A" />
    <Picker.Item label="2nd Year - Section B" value="2B" />
    <Picker.Item label="2nd Year - Section C" value="2C" />
    <Picker.Item label="3rd Year - Section A" value="3A" />
    <Picker.Item label="3rd Year - Section B" value="3B" />
    <Picker.Item label="3rd Year - Section C" value="3C" />
    <Picker.Item label="4th Year - Section A" value="4A" />
    <Picker.Item label="4th Year - Section B" value="4B" />
    <Picker.Item label="4th Year - Section C" value="4C" />
  </Picker>
</View>

          </>
        );
      case 3:
        return (
          <>
            <View style={styles.inputContainer}>
  <MaterialIcons name="person" size={20} color="white" style={styles.icon} />
  <TextInput
    style={[styles.input]}  // Add padding for the icon
    placeholder="Enter First Name"
    placeholderTextColor="gray"
    value={firstname}
    onChangeText={setFirstname}
  />
</View>

<View style={styles.inputContainer}>
  <MaterialIcons name="person" size={20} color="white" style={styles.icon} />
  <TextInput
    style={[styles.input]}  // Add padding for the icon
    placeholder="Enter Last Name"
    placeholderTextColor="gray"
    value={lastname}
    onChangeText={setLastname}
  />
</View>

<View style={styles.inputContainer}>
  <MaterialIcons name="person" size={20} color="white" style={styles.icon} />
  <TextInput
    style={[styles.input]}  // Add padding for the icon
    placeholder="Enter Middle Name (Optional only)"
    placeholderTextColor="gray"
    value={middlename}
    onChangeText={setMiddlename}
  />
</View>



  <MaterialIcons name="wc" size={20} color="white" style={styles.icons} />
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={gender}
      style={styles.picker}
      onValueChange={(itemValue) => setGender(itemValue)}
    >
      <Picker.Item label="Select Sex" value="" />
      <Picker.Item label="Male" value="Male" />
      <Picker.Item label="Female" value="Female" />
    </Picker>
  
  
</View>
  
            
          </>
        );
      default:
        return null;
    }
  };
  

  const renderHeader = () => (
    
      <View>
        {/* Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Welcome to the Registration Process!</Text>
              <Text style={styles.modalText}>
                Please complete all fields starting from Account Details to Personal Details.
              </Text>
              <Text style={styles.modalText}>
                You must input all information, including your personal data, before proceeding.
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Got It!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Header Container */}
      <View style={styles.headerContainer}>
        {currentSlide === 0 && (
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        <Text style={styles.headerTitle}>
          {currentSlide === 0 ? 'Account Details' :
            currentSlide === 1 ? 'Student Number' :
            currentSlide === 2 ? 'Course and Section' :
            currentSlide === 3 ? 'Personal Details' :
            'Registration'}
        </Text>

        <Text style={styles.slideIndicator}>
          {currentSlide + 1} / 4
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderHeader()}
      {getSlideContent()}
      <View style={styles.buttonContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity style={styles.button} onPress={goToPreviousSlide}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={goToNextSlide}>
          <Text style={styles.buttonText}>{currentSlide === 3 ? 'Register' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  eyeIcon: {
    marginLeft: 10,
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
  container: {
    flex: 1,
    backgroundColor: '#1B3A28',
    padding: 16,
  },
  headerContainer: {
    backgroundColor: '#1B3A28',
    padding: 20,
    borderRadius: 5,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#004d00',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    padding: 10,
    backgroundColor: '#004d00',
    borderRadius: 20,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  slideIndicator: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'white',
  },
  icon: {
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    color: 'black',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderColor: '#004d00',
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
    height: 150,
    overflow: 'hidden',
  },
  picker: {
    height: '100%',
    width: '100%',
    color: 'white',
  },
  button: {
    backgroundColor: '#004d00',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#2C4F3B',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: 'skyblue',
  },
  datePickerWrapper: {
    alignItems: 'center',
    marginVertical: 30,
  },
  icons: {
    marginTop: 20,
    marginRight: 10,
    marginBottom: 4,
  },
});

export default RegisterScreen;
