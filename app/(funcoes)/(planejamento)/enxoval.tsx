import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  TextInput, FlatList, Platform, KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '@/src/constants/theme';
import { getData, saveData } from '@/src/services/database';

interface ItemEnxoval {
  id: string;
  nome: string;
  marcado: boolean;
}

const LISTA_PADRAO: ItemEnxoval[] = [
  { id: '1', nome: 'Berço', marcado: false },
  { id: '2', nome: 'Carrinho', marcado: false },
  { id: '3', nome: 'Cadeirinha para carro', marcado: false },
  { id: '4', nome: 'Roupinhas (RN e P)', marcado: false },
  { id: '5', nome: 'Fraldas', marcado: false },
  { id: '6', nome: 'Produtos de higiene', marcado: false },
  { id: '7', nome: 'Mamadeiras', marcado: false },
  { id: '8', nome: 'Lençóis e cobertores', marcado: false },
];

export default function EnxovalScreen() {
  const router = useRouter();
  
  const [itens, setItens] = useState<ItemEnxoval[]>([]);
  const [novoItemNome, setNovoItemNome] = useState("");

  useFocusEffect(
    useCallback(() => {
      carregarEnxoval();
    }, [])
  );

  const carregarEnxoval = async () => {
    try {
      const dados = await getData();
      if (dados?.enxoval && dados.enxoval.length > 0) {
        setItens(dados.enxoval);
      } else {
        setItens(LISTA_PADRAO);
        await saveData({ ...dados, enxoval: LISTA_PADRAO });
      }
    } catch (e) {
      console.log("Erro ao carregar enxoval", e);
    }
  };

  const atualizarBanco = async (novaLista: ItemEnxoval[]) => {
    setItens(novaLista);
    try {
      const dados = await getData() || {};
      await saveData({ ...dados, enxoval: novaLista });
    } catch (error) {
      console.log("Erro ao salvar enxoval", error);
    }
  };

  const alternarItem = (id: string) => {
    const novaLista = itens.map(item => 
      item.id === id ? { ...item, marcado: !item.marcado } : item
    );
    atualizarBanco(novaLista);
  };

  const adicionarItem = () => {
    if (novoItemNome.trim() === "") return;

    const novo: ItemEnxoval = {
      id: Date.now().toString(),
      nome: novoItemNome.trim(),
      marcado: false
    };

    atualizarBanco([...itens, novo]);
    setNovoItemNome(""); 
  };

  const confirmarExclusao = (id: string, nome: string) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Tem a certeza que deseja apagar "${nome}" da lista?`);
      if (confirmou) apagarItem(id);
    } else {
      Alert.alert("Apagar Item", `Deseja apagar "${nome}" do enxoval?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => apagarItem(id) }
      ]);
    }
  };

  const apagarItem = (idParaApagar: string) => {
    const novaLista = itens.filter(i => i.id !== idParaApagar);
    atualizarBanco(novaLista);
  };

  const totalItens = itens.length;
  const itensMarcados = itens.filter(i => i.marcado).length;
  const progressoPorcentagem = totalItens === 0 ? 0 : (itensMarcados / totalItens) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/inicio')} style={styles.headerLeft}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Enxoval</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          
          <Text style={styles.tituloSecao}>Checklist do Enxoval</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Adicionar item..."
              placeholderTextColor="#94A3B8"
              value={novoItemNome}
              onChangeText={setNovoItemNome}
              onSubmitEditing={adicionarItem}
            />
            <TouchableOpacity onPress={adicionarItem} activeOpacity={0.8} style={[styles.addButton, { backgroundColor: theme.colors.cards }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={itens}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => alternarItem(item.id)}
                onLongPress={() => confirmarExclusao(item.id, item.nome)}
                style={[
                  styles.itemCard, 
                  item.marcado && styles.itemCardMarcado 
                ]}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.checkbox, item.marcado && { backgroundColor: theme.colors.cards, borderColor: theme.colors.cards }]}>
                    {item.marcado && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
                  </View>
                  
                  <Text style={[styles.itemTexto, item.marcado && styles.itemTextoMarcado]}>
                    {item.nome}
                  </Text>
                </View>

                {item.marcado && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.cards} />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Progresso</Text>
              <Text style={[styles.progressValue, { color: theme.colors.cards }]}>{itensMarcados}/{totalItens}</Text>
            </View>
            
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressoPorcentagem}%`, backgroundColor: theme.colors.cards }
                ]} 
              />
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9FA' },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerLeft: { width: 40, alignItems: 'flex-start' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  tituloHeader: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  content: { flex: 1, padding: 20, backgroundColor: '#FFF', margin: 15, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  
  tituloSecao: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 15 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, color: '#1E293B' },
  addButton: { borderRadius: 12, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

  itemCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 10 
  },
  itemCardMarcado: { backgroundColor: '#F9F5FF', borderColor: '#E9D5FF' }, 
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  
  itemTexto: { fontSize: 16, color: '#334155', flex: 1 },
  itemTextoMarcado: { color: '#94A3B8', textDecorationLine: 'line-through' },

  progressContainer: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 16, fontWeight: '600', color: '#475569' },
  progressValue: { fontSize: 16, fontWeight: 'bold' },
  
  progressBarBackground: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 10 },
});
