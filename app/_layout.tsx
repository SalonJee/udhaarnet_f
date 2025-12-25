import { AuthProvider, useAuth } from '@/frontend/context/AuthContext';
import BuyerHomeScreen from '@/frontend/screens/BuyerHomeScreen';
import LoginScreen from '@/frontend/screens/LoginScreen';
import RoleSelectionScreen from '@/frontend/screens/RoleSelectionScreen';
import SellerHomeScreen from '@/frontend/screens/SellerHomeScreen';
import SignupScreen from '@/frontend/screens/SignupScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { userRole, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        </>
      ) : (
        <>
          {userRole === 'buyer' ? (
            <Stack.Screen
              name="Home"
              component={BuyerHomeScreen}
            />
          ) : (
            <Stack.Screen
              name="Home"
              component={SellerHomeScreen}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
