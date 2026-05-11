import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/src/constants/theme';

export default function Diario() {
  
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={()=>router.push('(funcoes)/diario' as any)}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>+ Nova Entrada no Diário</Text>
        </View>
      </TouchableOpacity>

      
        </View>
  );
}
// ... mantenha os seus styles originais aqui embaixo ...


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: { 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: theme.colors.cards,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyText: { marginTop: 15, color: '#888', fontSize: 16, textAlign: 'center' },
});