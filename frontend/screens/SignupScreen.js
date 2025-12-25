import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { signup, loading, error, userRole } = useAuth();

  // Common fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Buyer fields
  const [buyerName, setBuyerName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [buyerWard, setBuyerWard] = useState('');

  // Seller fields
  const [sellerName, setSellerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [sellerWard, setSellerWard] = useState('');

  const handleSignup = async () => {
    if (!phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    let userData;

    if (userRole === 'buyer') {
      if (!buyerName || !municipality || !buyerWard) {
        Alert.alert('Error', 'Please fill in all buyer details');
        return;
      }

      userData = {
        name: buyerName,
        municipality,
        wardNumber: Number(buyerWard),
      };
    } else {
      if (!sellerName || !shopName || !sellerWard) {
        Alert.alert('Error', 'Please fill in all seller details');
        return;
      }

      userData = {
        name: sellerName,
        shopName,
        wardNumber: Number(sellerWard),
      };
    }

    try {
      await signup(phoneNumber, password, userRole, userData);

      Alert.alert(
        'Success',
        `${userRole === 'buyer' ? 'Buyer' : 'Seller'} account created successfully`
      );

      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Signup Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subTitle}>
          as {userRole === 'buyer' ? 'Buyer' : 'Seller'}
        </Text>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      {/* Buyer Info */}
      {userRole === 'buyer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={buyerName}
            onChangeText={setBuyerName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Municipality"
            value={municipality}
            onChangeText={setMunicipality}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Ward Number"
            value={buyerWard}
            onChangeText={setBuyerWard}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>
      )}

      {/* Seller Info */}
      {userRole === 'seller' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={sellerName}
            onChangeText={setSellerName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Shop Name"
            value={shopName}
            onChangeText={setShopName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Ward Number"
            value={sellerWard}
            onChangeText={setSellerWard}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Login */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('RoleSelection')}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Back to Role Selection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subTitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default SignupScreen;
