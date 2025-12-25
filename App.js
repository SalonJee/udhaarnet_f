import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './frontend/context/AuthContext';
import BuyerHomeScreen from './frontend/screens/BuyerHomeScreen';
import LoginScreen from './frontend/screens/LoginScreen';
import RoleSelectionScreen from './frontend/screens/RoleSelectionScreen';
import SellerHomeScreen from './frontend/screens/SellerHomeScreen';
import SignupScreen from './frontend/screens/SignupScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { userRole, isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
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
              options={{ animationEnabled: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animationEnabled: true,
                cardStyle: { backgroundColor: '#f5f5f5' },
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                animationEnabled: true,
                cardStyle: { backgroundColor: '#f5f5f5' },
              }}
            />
          </>
        ) : (
          <>
            {userRole === 'buyer' ? (
              <Stack.Screen
                name="Home"
                component={BuyerHomeScreen}
                options={{ animationEnabled: false }}
              />
            ) : (
              <Stack.Screen
                name="Home"
                component={SellerHomeScreen}
                options={{ animationEnabled: false }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
