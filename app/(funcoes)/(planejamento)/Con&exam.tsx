import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal, 
  TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/src/constants/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getData, saveData } from '@/src/services/database';
import { getCurrentUser } from '@/src/services/auth';

interface Consulta {
  id: string | number;
  tipo: 'Consulta' | 'Exame';
  titulo: string;
  data: string;
  hora: string;
  localMedico: string;
  notas: string;
}

export default function ConsultasScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoAtual, setTipoAtual] = useState<'Consulta' | 'Exame'>('Consulta');
  const [tituloAtual, setTituloAtual] = useState("");
  const [dataAtual, setDataAtual] = useState("");
  const [horaAtual, setHoraAtual] = useState("");
  const [localAtual, setLocalAtual] = useState("");
  const [notasAtual, setNotasAtual] = useState("");
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      carregarConsultas();
    }, [])
  );

  const carregarConsultas = async () => {
    try {
      const dados = await getData();
      if (dados?.consultas) {
        setConsultas(dados.consultas);
      }
    } catch (e) {
      console.log("Erro ao carregar consultas", e);
    }
  };

  const abrirNovoAgendamento = () => {
    setTipoAtual('Consulta');
    setTituloAtual("");
    setDataAtual("");
    setHoraAtual("");
    setLocalAtual("");
    setNotasAtual("");
    setDateObj(new Date());
    setModalVisivel(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // No iOS o modal de calendário fica aberto
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDataAtual(`${day}/${month}/${year}`);
      
      // Fecha o picker no Android após selecionar
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      setHoraAtual(`${hours}:${minutes}`);

      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
    }
  };

  const salvarAgendamento = async () => {
    if (tituloAtual.trim() === "" || dataAtual.trim() === "") {
      if (Platform.OS === 'web') {
        window.alert("Atenção: O título e a data são obrigatórios!");
      } else {
        Alert.alert("Atenção", "O título e a data são obrigatórios!");
      }
      return;
    }

    const novaConsulta: Consulta = {
      id: Date.now().toString(),
      tipo: tipoAtual,
      titulo: tituloAtual.trim(),
      data: dataAtual.trim(),
      hora: horaAtual.trim(),
      localMedico: localAtual.trim(),
      notas: notasAtual.trim(),
    };

    const novasConsultas = [novaConsulta, ...consultas];
    setConsultas(novasConsultas);
    
    try {
      const dados = await getData() || {};
      await saveData({ ...dados, consultas: novasConsultas });
      setModalVisivel(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Erro: Não foi possível guardar o agendamento.");
      } else {
        Alert.alert("Erro", "Não foi possível guardar o agendamento.");
      }
    }
  };

  const confirmarExclusao = (id: string | number) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm("Tem a certeza que deseja cancelar e apagar este agendamento?");
      if (confirmou) {
        apagarConsulta(id);
      }
    } else {
      Alert.alert("Apagar Agendamento", "Tem a certeza que deseja cancelar e apagar este agendamento?", [
        { text: "Não", style: "cancel" },
        { text: "Sim, apagar", style: "destructive", onPress: () => apagarConsulta(id) }
      ]);
    }
  };

  const apagarConsulta = async (idParaApagar: string | number) => {
    try {
      const novaLista = consultas.filter(c => String(c.id) !== String(idParaApagar));
      setConsultas(novaLista);

      const dados = await getData() || {};
      await saveData({ ...dados, consultas: novaLista });
    } catch (error) {
      console.log("Erro ao apagar: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/inicio')} style={styles.headerLeft}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.tituloHeader}>Consultas & Exames</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          onPress={abrirNovoAgendamento} 
          activeOpacity={0.8}
          style={styles.button}>
            <MaterialCommunityIcons name="calendar-plus" size={22} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Novo Agendamento</Text>
        </TouchableOpacity>

        <FlatList
          data={consultas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={70} color="#CBD5E1" />
              <Text style={styles.emptyText}>Nenhuma consulta ou exame agendado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: item.tipo === 'Consulta' ? '#E0F2FE' : '#F3E8FF' }]}>
                <MaterialCommunityIcons 
                  name={item.tipo === 'Consulta' ? "stethoscope" : "flask-outline"} 
                  size={28} 
                  color={item.tipo === 'Consulta' ? '#0284C7' : '#9333EA'} 
                />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardTipo}>{item.tipo.toUpperCase()}</Text>
                <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
                
                <View style={styles.rowInfo}>
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="#64748B" />
                  <Text style={styles.cardData}> {item.data} {item.hora ? `às ${item.hora}` : ''}</Text>
                </View>

                {item.localMedico ? (
                  <View style={styles.rowInfo}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748B" />
                    <Text style={styles.cardData} numberOfLines={1}> {item.localMedico}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity 
                onPress={() => confirmarExclusao(item.id)} 
                style={styles.lixeira}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
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
              <Text style={styles.modalTitulo}>Novo Agendamento</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.tipoContainer}>
                <TouchableOpacity 
                  style={[styles.tipoBotao, tipoAtual === 'Consulta' && styles.tipoAtivoConsulta]}
                  onPress={() => setTipoAtual('Consulta')}
                >
                  <Text style={[styles.tipoTexto, tipoAtual === 'Consulta' && { color: '#FFF' }]}>Consulta Médico</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tipoBotao, tipoAtual === 'Exame' && styles.tipoAtivoExame]}
                  onPress={() => setTipoAtual('Exame')}
                >
                  <Text style={[styles.tipoTexto, tipoAtual === 'Exame' && { color: '#FFF' }]}>Realizar Exame</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Título (Ex: Ultrassom Morfológico)</Text>
              <TextInput style={styles.input} placeholder="O que vai fazer?" value={tituloAtual} onChangeText={setTituloAtual} />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Data</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputPicker}>
                    <Text style={{ color: dataAtual ? '#1E293B' : '#94A3B8', fontSize: 16 }}>
                      {dataAtual || "Selecionar Data"}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Hora</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputPicker}>
                    <Text style={{ color: horaAtual ? '#1E293B' : '#94A3B8', fontSize: 16 }}>
                      {horaAtual || "Selecionar Hora"}
                    </Text>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={onChangeTime}
                />
              )}

              <Text style={styles.label}>Médico ou Local (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Nome do médico ou clínica" value={localAtual} onChangeText={setLocalAtual} />

              <Text style={styles.label}>Notas / Perguntas para o médico</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Ex: Perguntar sobre as vitaminas..." 
                multiline value={notasAtual} onChangeText={setNotasAtual} 
              />

              <TouchableOpacity onPress={salvarAgendamento} activeOpacity={0.8} style={[{ backgroundColor: theme.colors.cards,marginTop: 10 },styles.saveButton]}>
                  <Text style={styles.saveButtonText}>Guardar Agendamento</Text>
              </TouchableOpacity>
            </ScrollView>
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
    flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20,backgroundColor: theme.colors.cards,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  emptyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyText: { marginTop: 15, color: '#64748B', fontSize: 16, textAlign: 'center' },
  
  card: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 15, marginBottom: 12, borderRadius: 16,
    borderWidth: 1, borderColor: '#e2e8f0' 
  },
  iconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardInfo: { flex: 1, paddingRight: 10 }, 
  cardTipo: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1, marginBottom: 2 },
  cardTitulo: { fontWeight: 'bold', color: '#1E293B', fontSize: 17, marginBottom: 6 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardData: { color: '#64748B', fontSize: 13 },
  lixeira: { padding: 5, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  
  tipoContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20 },
  tipoBotao: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tipoAtivoConsulta: { backgroundColor: '#0284C7' },
  tipoAtivoExame: { backgroundColor: '#9333EA' },
  tipoTexto: { fontWeight: 'bold', color: '#64748B' },

  label: { fontWeight: '600', color: '#334155', marginBottom: 5, marginTop: 10, fontSize: 14 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 15, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#e2e8f0' },
  
  inputPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },

  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
