import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';

// Screens
import LoginScreen from './screens/LoginScreen';
import WorkshopHomeScreen from './screens/WorkshopHomeScreen';
import VendorFeedScreen from './screens/VendorFeedScreen';
import CreateRFQScreen from './screens/CreateRFQScreen';
import RFQDetailsScreen from './screens/RFQDetailsScreen';
import AddItemScreen from './screens/AddItemScreen';
import VendorRFQDetailsScreen from './screens/VendorRFQDetailsScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';
import ServicesScreen from './screens/ServicesScreen';
import AccountScreen from './screens/AccountScreen';
import MyGarageScreen from './screens/MyGarageScreen';
import RecentActivityScreen from './screens/RecentActivityScreen';
import ActiveRFQsScreen from './screens/ActiveRFQsScreen';
import { getAuthToken } from './lib/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Ionicons } from '@expo/vector-icons';

// ... (other imports)

const TabBarIcon = ({ focused, label }: { focused: boolean, label: string }) => {
  let iconName: any = 'home-outline';

  switch (label) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Garage':
      iconName = focused ? 'car-sport' : 'car-sport-outline';
      break;
    case 'Activity':
      iconName = focused ? 'time' : 'time-outline';
      break;
    case 'Orders':
      iconName = focused ? 'receipt' : 'receipt-outline';
      break;
    case 'Account':
      iconName = focused ? 'person' : 'person-outline';
      break;
  }

  return <Ionicons name={iconName} size={24} color={focused ? 'black' : '#9CA3AF'} />;
};

const screenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 90, // Slightly taller for better touch target
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 5,
  },
  tabBarShowLabel: true,
  tabBarActiveTintColor: '#000000',
  tabBarInactiveTintColor: '#9CA3AF',
  tabBarLabelStyle: {
    fontSize: 12, // Larger, more readable
    fontWeight: '600' as '600', // Medium-Bold
    marginTop: 4,
    marginBottom: 0
  },
  tabBarIcon: ({ focused }: any) => <TabBarIcon focused={focused} label={route.name} />,
});

function WorkshopTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Tab.Screen name="Home" component={WorkshopHomeScreen} />
      <Tab.Screen name="Garage" component={MyGarageScreen} />
      <Tab.Screen name="Activity" component={RecentActivityScreen} />
      <Tab.Screen name="Orders" component={OrderTrackingScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function VendorTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Tab.Screen name="Home" component={VendorFeedScreen} />
      <Tab.Screen name="Orders" component={OrderTrackingScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // In a real app we'd validate token and role to decide initial route
      // For now we just go to Login always to be safe or check token existence
      const token = await getAuthToken();
      setInitialRoute('Login');
    };
    checkAuth();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          headerBackTitle: ' ' // Using space to force hide text on iOS
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Main Tabs */}
        <Stack.Screen
          name="WorkshopTabs"
          component={WorkshopTabs}
          options={{ headerBackTitle: ' ' }}
        />
        <Stack.Screen
          name="VendorTabs"
          component={VendorTabs}
          options={{ headerBackTitle: ' ' }}
        />

        {/* Modal/Stacked Screens */}
        <Stack.Screen
          name="CreateRFQ"
          component={CreateRFQScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="RFQDetails"
          component={RFQDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ActiveRFQs"
          component={ActiveRFQsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen
          name="VendorRFQDetails"
          component={VendorRFQDetailsScreen}
          options={{ headerShown: false }}
        />
        {/* Accessible Order Tracking for deep links/push logic if needed, but it's now a Tab too */}
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
