import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getData } from '@/src/services/database';
import { theme } from '@/src/constants/theme'

export default function Compartilhar() {
  const [nomeUser, setNomeUser] = useState("Carregando...");
  const [codigo, setCodigo] = useState("------");

  useEffect(() => {
    async function carregar() {
      const dados = await getData();
      if (dados?.user) {
        setNomeUser(dados.user.nome || "Usuário");
        setCodigo((dados.user.nome ? dados.user.nome.substring(0,3).toUpperCase() : "ABC") + Math.floor(1000 + Math.random() * 9000));
      }
    }
    carregar();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}><Ionicons name="share-social" size={30} color="#ff5fa2"/></View>
        <Text style={styles.title}>Compartilhar Gravidez</Text>
        <Text style={styles.desc}>Permita que familiares acompanhem sua jornada</Text>
        
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{codigo}</Text>
          <View style={styles.copyBtn}><Ionicons name="copy" size={20} color="white" /></View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Pessoas Com Acesso</Text>
      <View style={styles.personCard}>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View>
            <Text style={{fontWeight:'bold'}}>{nomeUser} (Você)</Text>
            <Text style={{color: '#999'}}>Gestante Principal</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { 
    backgroundColor: theme.colors.terceary, 
    padding: 30, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginBottom: 20,
  },
  iconCircle: { 
   padding: 15, 
   //backgroundColor: theme.colors.cards, 
   borderRadius: 50, 
   marginBottom: 15
   },
  title: { 
  fontSize: theme.texts.title, 
  fontWeight: 'bold'
  },
  desc: { 
    textAlign: 'center', 
    color: theme.colors.title, 
    fontSize: theme.texts.text,
    marginVertical: 10 
  },
  codeRow: { 
    flexDirection: 'row', 
    backgroundColor: theme.colors.quaternary, 
    padding: 15, 
    borderRadius: 15, 
    width: '100%', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  codeText: { 
    fontWeight: 'bold',
    fontSize: theme.texts.title,
    
  },
  copyBtn: { 
    backgroundColor: theme.colors.primary, 
    padding: 8, 
    borderRadius: 8,
  },
  sectionLabel: { fontWeight: 'bold', marginBottom: 10 },
  personCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#DDD' },
  tag: { backgroundColor: '#E8F5E9', padding: 5, borderRadius: 5 },
  infoCard: { padding: 20, borderRadius: 20, marginTop: 20 },
  infoText: { color: 'white', marginBottom: 5 }
});
