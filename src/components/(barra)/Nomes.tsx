import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getData, saveData } from '@/src/services/database';
import { auth } from '@/src/services/firebase';

export default function Nomes() {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  // 🔥 Carregar nomes ao iniciar
  useEffect(() => {
    async function carregarNomes() {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        console.log("Usuário não logado");
        return;
      }

      try {
        const dados = await getData(uid);

        if (dados?.nomesFavoritos) {
          setFavoritos(dados.nomesFavoritos);
        }
      } catch (error) {
        console.log("Erro ao carregar dados:", error);
      }
    }

    carregarNomes();
  }, []);

  // 🔥 Favoritar / desfavoritar
  async function favoritar(nome: string) {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }

    let novaLista = [...favoritos];

    if (novaLista.includes(nome)) {
      novaLista = novaLista.filter(n => n !== nome);
    } else {
      novaLista.push(nome);
    }

    setFavoritos(novaLista);

    try {
      const dados = await getData(uid);

      await saveData(uid, {
        ...dados,
        nomesFavoritos: novaLista
      });
    } catch (error) {
      console.log("Erro ao salvar:", error);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🔍 Busca */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={24} color="#BBB" />
        <TextInput placeholder="Buscar nomes..." style={styles.input} />
      </View>

      {/* ⭐ Favoritos */}
      <TouchableOpacity style={styles.favBtn}>
        <MaterialCommunityIcons name="star-outline" size={20} color="#555" />
        <Text style={styles.favBtnText}>
          Meus Favoritos ({favoritos.length})
        </Text>
      </TouchableOpacity>

      {/* 👶 Card exemplo */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => favoritar("Arthur")}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>Arthur</Text>

          <MaterialCommunityIcons
            name={
              favoritos.includes("Arthur")
                ? "heart"
                : "heart-outline"
            }
            size={24}
            color="#D81B60"
          />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },

  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },

  input: {
    marginLeft: 10,
    flex: 1
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },

  filterBtnActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },

  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0'
  },

  filterTextActive: {
    color: '#FFF',
    fontWeight: 'bold'
  },

  favBtn: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 20
  },

  favBtnText: {
    marginLeft: 8,
    fontWeight: '500'
  },

  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 15
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between'
  },

  nameText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  genderTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },

  genderTagText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold'
  },

  infoText: {
    color: '#666',
    marginBottom: 4
  },

  bold: {
    fontWeight: 'bold',
    color: '#333'
  }
});