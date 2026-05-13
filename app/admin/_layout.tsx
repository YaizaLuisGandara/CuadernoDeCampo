import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#D32F2F', headerStyle: { backgroundColor: '#f8f8f8' } }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Global', tabBarIcon: ({color}) => <MaterialCommunityIcons name="chart-bar" size={26} color={color} /> }} 
      />
      <Tabs.Screen 
        name="fincas" 
        options={{ title: 'Fincas', tabBarIcon: ({color}) => <MaterialCommunityIcons name="map" size={26} color={color} /> }} 
      />
      <Tabs.Screen 
        name="tratamientos" 
        options={{ title: 'Tratamientos', tabBarIcon: ({color}) => <MaterialCommunityIcons name="medical-bag" size={26} color={color} /> }} 
      />
      <Tabs.Screen 
        name="config" 
        options={{ title: 'Usuarios', tabBarIcon: ({color}) => <MaterialCommunityIcons name="account-group" size={26} color={color} /> }} 
      />
    </Tabs>
  );
}