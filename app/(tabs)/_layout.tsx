import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CREAM = '#F7F4EE';
const INK = '#2C2A26';
const MUTED = '#9E9A93';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: CREAM,
          borderTopColor: '#E8E4DC',
        },
        tabBarActiveTintColor: INK,
        tabBarInactiveTintColor: MUTED,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
