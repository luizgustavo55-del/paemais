import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal, 
  TextInput, FlatList, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { getData, saveData } from '@/src/services/database';
import { getCurrentUser } from '@/src/services/auth';

interface EntradaDiario {
  id: string | number;
  titulo: string;
  data: string;
  hora: string;
  texto: string;
  userId: string | null;
  ultimaEdicao?: string; 
}

export default function DiarioScreen() {
  const router = useRouter();
  const user = getCurrentUser();

  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  
  const [idEditando, setIdEditando] = useState<string | number | null>(null);
  const [tituloAtual, setTituloAtual] = useState("");
  const [textoAtual, setTextoAtual] = useState("");

  useFocusEffect(
    useCallback(() => {
      carregarDiario();
    }, [])
  );

  const carregarDiario = async () => {
    try {
      const dados = await getData();
      if (dados?.diario) {
        setEntradas(dados.diario);
      }
    } catch (e) {
      console.log("Erro ao carregar diário", e);
    }
  };

  const abrirNovaEntrada = () => {
    setIdEditando(null);
    setTituloAtual("");
    setTextoAtual("");
    setModalVisivel(true);
  };

  const abrirParaVer = (item: EntradaDiario) => {
    setIdEditando(item.id);
    setTituloAtual(item.titulo || "");
    setTextoAtual(item.texto);
    setModalVisivel(true);
  };

  const salvarEntrada = async () => {
    if (textoAtual.trim() === "") {
      if (Platform.OS === 'web') {
        window.alert("Atenção: O conteúdo do diário não pode estar vazio!");
      } else {
        Alert.alert("Atenção", "O conteúdo do diário não pode estar vazio!");
      }
      return;
    }

    const dataAtual = new Date();
    const dataStr = dataAtual.toLocaleDateString('pt-BR');
    const horaStr = dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let novasEntradas = [];

    if (idEditando) {
      novasEntradas = entradas.map(e => {
        if (String(e.id) === String(idEditando)) {
          return { 
            ...e, 
            titulo: tituloAtual.trim() || "Sem Título", 
            texto: textoAtual.trim(), 
            ultimaEdicao: `${dataStr} às ${horaStr}` 
          };
        }
        return e;
      });
    } else {
      const novaEntrada: EntradaDiario = {
        id: Date.now().toString(),
        titulo: tituloAtual.trim() || "Sem Título",
        data: dataStr,
        hora: horaStr,
        texto: textoAtual.trim(),
        ultimaEdicao: `${dataStr} às ${horaStr}`, 
        userId: user ? user.id : null,
      };
      novasEntradas = [novaEntrada, ...entradas];
    }

    setEntradas(novasEntradas);
    
    try {
      const dados = await getData() || {};
      await saveData({ ...dados, diario: novasEntradas });
      setModalVisivel(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Erro: Não foi possível guardar o seu diário.");
      } else {
        Alert.alert("Erro", "Não foi possível guardar o seu diário.");
      }
    }
  };

  const confirmarExclusaoItem = (id: string | number) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm("Tem a certeza que deseja apagar esta entrada?");
      if (confirmou) {
        apagarEntrada(id);
      }
    } else {
      Alert.alert("Apagar Página", "Tem a certeza que deseja apagar esta entrada?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => apagarEntrada(id) }
      ]);
    }
  };

  const apagarEntrada = async (idParaApagar: string | number) => {
    try {
      const novasEntradas = entradas.filter(e => String(e.id) !== String(idParaApagar));
      setEntradas(novasEntradas);

      const dados = await getData() || {};
      await saveData({ ...dados, diario: novasEntradas });
    } catch (error) {
      console.log("Erro ao apagar: ", error);
    }
  };

  const confirmarApagarTodos = () => {
    if (entradas.length === 0) return;
    
    if (Platform.OS === 'web') {
      const confirmou = window.confirm("Tem a certeza que deseja APAGAR TODAS as entradas? Esta ação não pode ser desfeita.");
      if (confirmou) {
        apagarTodos();
      }
    } else {
      Alert.alert("Limpar Diário", "Tem a certeza que deseja APAGAR TODAS as entradas? Esta ação não pode ser desfeita.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, apagar tudo", style: "destructive", onPress: apagarTodos }
      ]);
    }
  };

  const apagarTodos = async () => {
    try {
      setEntradas([]);
      const dados = await getData() || {};
      await saveData({ ...dados, diario: [] });
    } catch (error) {
      console.log("Erro ao limpar tudo: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/inicio')} style={styles.headerLeft}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.tituloHeader}>Meu Diário</Text>
        
        <TouchableOpacity 
          onPress={confirmarApagarTodos} 
          style={styles.headerRight}
          disabled={entradas.length === 0}
        >
          {entradas.length > 0 && (
            <MaterialCommunityIcons name="delete-sweep-outline" size={28} color="#e11d48" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={abrirNovaEntrada} activeOpacity={0.8}>
          <LinearGradient colors={['#EC4899', '#A855F7']} style={styles.button}>
            <MaterialCommunityIcons name="fountain-pen-tip" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Escrever no Diário</Text>
          </LinearGradient>
        </TouchableOpacity>

        <FlatList
          data={entradas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="book-heart-outline" size={70} color="#CBD5E1" />
              <Text style={styles.emptyText}>O seu diário está vazio.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => abrirParaVer(item)}
                style={styles.cardInfo}
              >
                <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
                
                <View style={styles.dataContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                  <Text style={styles.cardData}> Atualizado em {item.ultimaEdicao || `${item.data} às ${item.hora}`}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => confirmarExclusaoItem(item.id)} 
                style={styles.lixeira}
                hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={26} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <Modal animationType="slide" transparent visible={modalVisivel} onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{idEditando ? "Página do Diário" : "Nova Página"}</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputTitulo}
              placeholder="Dê um título (ex: Primeiro ultrassom!)"
              placeholderTextColor="#94A3B8"
              value={tituloAtual}
              onChangeText={setTituloAtual}
              maxLength={50}
            />

            <TextInput
              style={styles.inputArea}
              placeholder="Escreva sobre o seu dia, sentimentos..."
              placeholderTextColor="#94A3B8"
              multiline
              autoFocus={!idEditando} 
              textAlignVertical="top"
              value={textoAtual}
              onChangeText={setTextoAtual}
            />

            <TouchableOpacity onPress={salvarEntrada} activeOpacity={0.8}>
              <LinearGradient colors={['#EC4899', '#A855F7']} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>{idEditando ? "Atualizar Diário" : "Guardar no Diário"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerLeft: { width: 40, alignItems: 'flex-start' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  tituloHeader: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 20 },
  button: { 
    flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyText: { marginTop: 15, color: '#64748B', fontSize: 16, textAlign: 'center' },
  card: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0' 
  },
  cardInfo: { flex: 1, paddingRight: 15 }, 
  cardTitulo: { fontWeight: 'bold', color: '#1E293B', fontSize: 17, marginBottom: 6 },
  dataContainer: { flexDirection: 'row', alignItems: 'center' },
  cardData: { color: '#64748B', fontSize: 13 },
  lixeira: { padding: 5, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  inputTitulo: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 15, fontSize: 18, color: '#1E293B', marginBottom: 15, fontWeight: 'bold' },
  inputArea: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, fontSize: 16, color: '#334155', marginBottom: 20 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
