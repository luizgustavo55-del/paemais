import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#007AFF', 
        tabBarInactiveTintColor: 'gray',  
        headerShown: false,                
      }}
    >
      <Tabs.Screen
        name="inicio" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="mapa" 
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map" size={24} color={color} />
          ),
        }}
      />
    
      <Tabs.Screen
        name="dicas" 
        options={{
          title: 'Dicas',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="lightbulb-o" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="comunidades" 
        options={{
          title: 'Comunidade',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
