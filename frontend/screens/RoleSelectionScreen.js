import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RoleSelectionScreen = ({ navigation }) => {
  const { selectRole } = useAuth();

  const handleRoleSelection = (role) => {
    selectRole(role);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to UdhaarNet</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyerButton]}
            onPress={() => handleRoleSelection('buyer')}
          >
            <Text style={styles.buttonTitle}>Buyer</Text>
            <Text style={styles.buttonDescription}>
              Browse and purchase products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sellerButton]}
            onPress={() => handleRoleSelection('seller')}
          >
            <Text style={styles.buttonTitle}>Seller</Text>
            <Text style={styles.buttonDescription}>
              Sell products and manage inventory
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  buyerButton: {
    backgroundColor: '#007AFF',
  },
  sellerButton: {
    backgroundColor: '#FF9500',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  buttonDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;
