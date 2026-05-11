import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/src/constants/theme';

const itens = [
  { 
  title: 'Consultas & Exames', 
  icon: 'calendar-month', 
  color: theme.colors.quaternary,
  iconColor: '#2196F3',
  route: '/cons&exam',
  },
  {
  title: 'Checklist do Enxoval', 
  icon: 'shopping-outline', 
  color: theme.colors.quaternary, 
  iconColor: '#E91E63',
  route: '/enxoval',
  },
  { 
  title: 'Plano de Parto', 
  icon: 'file-document-outline', 
  color: theme.colors.quaternary, 
  iconColor: '#9C27B0',
  route: '/planoParto',
    
  },
];

export default function Planejamento() {
  
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {itens.map((item, index) => (
        <TouchableOpacity 
        key={index} 
        style={styles.listItem}
        onPress={()=>router.push(item.route as any)}
        >
          <View 
          style={[styles.iconBox, 
          { backgroundColor: item.color }]}>
            
            <MaterialCommunityIcons 
            name={item.icon as any} 
            size={24} 
            color={item.iconColor} />
            
          </View>
          
          <Text 
          style={styles.itemText}>
            {item.title}
          </Text>
          <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color="#CCC" />
          
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.terceary,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  iconBox: { 
  padding: 10, 
  borderRadius: 10, 
  marginRight: 15 
  },
  itemText: { 
  flex: 1, 
  fontSize: 16, 
  color: '#333', 
  fontWeight: '500', 
  },
});
