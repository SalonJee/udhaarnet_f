import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const { login, userRole, loading } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both phone number and password');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      await login(phoneNumber, password);
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    }
  };

  const handleBackToRoles = () => {
    setPhoneNumber('');
    setPassword('');
    navigation.navigate('RoleSelection');
  };

  const getRoleColor = () => {
    return userRole === 'buyer' ? '#007AFF' : '#FF9500';
  };

  const getRoleText = () => {
    return userRole === 'buyer' ? 'Buyer' : 'Seller';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.roleLabel}>
            Logging in as{' '}
            <Text style={{ color: getRoleColor() }}>{getRoleText()}</Text>
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: getRoleColor(), opacity: loading ? 0.6 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLinkContainer}
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          >
            <Text style={styles.signupLinkText}>Don't have an account? </Text>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToRoles}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Back to Role Selection</Text>
          </TouchableOpacity>
        </View>

        {/* Optional: update/remove test credentials */}
        <View style={styles.credentialsContainer}>
          <Text style={styles.credentialsTitle}>Test Credentials:</Text>
          <Text style={styles.credentialsText}>
            Buyer: 98XXXXXXXX / buyer123
          </Text>
          <Text style={styles.credentialsText}>
            Seller: 97XXXXXXXX / seller123
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#1a1a1a',
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signupLinkContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  credentialsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  credentialsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default LoginScreen;
