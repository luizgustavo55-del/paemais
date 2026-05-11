import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/src/constants/theme';
import { getData, saveData } from '@/src/services/database';
import { getCurrentUser } from '@/src/services/auth';

interface Contracao {
  id: string;
  data: string;
  hora: string;
  duracao: number;
  intervalo: number | null;
  duracaoFormatada: string;
}

export default function CronometroContracoes() {
  const router = useRouter();
  const user = getCurrentUser();
  const [ativo, setAtivo] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [inicioAtual, setInicioAtual] = useState<number | null>(null);
  const [ultimoInicio, setUltimoInicio] = useState<number | null>(null);
  const [historico, setHistorico] = useState<Contracao[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [alertaInteligente, setAlertaInteligente] = useState("Aguardando início");


  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [])
  );

  const carregarHistorico = async () => {
    try {
      const dbData = await getData();
      const lista = dbData?.historicoContracoes || [];
      setHistorico(lista);
      
      if (lista.length > 0) {
        analisarPadrao(lista);
      }
    } catch (e) {
      console.log("Erro ao carregar histórico", e);
    }
  };

 
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ativo && inicioAtual) {
      interval = setInterval(() => {
        const segundosDecorridos = Math.floor((Date.now() - inicioAtual) / 1000);
        setTempo(segundosDecorridos);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ativo, inicioAtual]);

  const mostrarAviso = (texto: string) => {
    setMensagemAviso(texto);
    setTimeout(() => setMensagemAviso(""), 3000);
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };


  const analisarPadrao = (lista: Contracao[]) => {
    if (lista.length < 3) {
      setAlertaInteligente("Continue registrando para analisarmos o padrão.");
      return;
    }

    const ultimas = lista.slice(0, 3);
    const mediaIntervalo = ultimas.reduce((acc, curr) => acc + (curr.intervalo || 0), 0) / 3;
    const mediaDuracao = ultimas.reduce((acc, curr) => acc + curr.duracao, 0) / 3;

    if (mediaIntervalo > 0 && mediaIntervalo <= 300 && mediaDuracao >= 50) {
      setAlertaInteligente("ATENÇÃO: Padrão 5-1-1 detectado! Contate seu médico ou vá à maternidade.");
    } else {
      setAlertaInteligente("Padrão irregular. Fase latente ou alarme falso.");
    }
  };


  const toggleContracao = async () => {
    if (!ativo) {
      
      const agora = Date.now();
      setInicioAtual(agora);
      setTempo(0);
      setAtivo(true);
      setAlertaInteligente("Contração em andamento...");
    } else {
      
      setAtivo(false);

      let intervalo = null;
      if (ultimoInicio && inicioAtual) {
        intervalo = Math.floor((inicioAtual - ultimoInicio) / 1000);
      }

      const novaContracao: Contracao = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        duracao: tempo,
        intervalo,
        duracaoFormatada: formatarTempo(tempo)
      };

      const novaLista = [novaContracao, ...historico];
      setHistorico(novaLista);
      setUltimoInicio(inicioAtual);
      setInicioAtual(null);
      setTempo(0);
      analisarPadrao(novaLista);

      try {
        const dbData = await getData() || {};
        await saveData({ ...dbData, historicoContracoes: novaLista });
        mostrarAviso("Contração salva no histórico!");
      } catch (e) {
        mostrarAviso("Erro ao guardar.");
      }
    }
  };

  const cancelarContagem = () => {
    setAtivo(false);
    setTempo(0);
    setInicioAtual(null);
    analisarPadrao(historico);
    mostrarAviso("Contagem cancelada.");
  };


  const apagarItem = async (id: string) => {
    try {
      const novoHistorico = historico.filter(item => item.id !== id);
      setHistorico(novoHistorico);
      
      const dbData = await getData() || {};
      await saveData({ ...dbData, historicoContracoes: novoHistorico });
      
      analisarPadrao(novoHistorico);
      mostrarAviso("Registo apagado!");
    } catch (error) {
      mostrarAviso("Erro ao apagar.");
    }
  };

  const apagarTodos = async () => {
    try {
      setHistorico([]);
      setUltimoInicio(null);
      setAlertaInteligente("Aguardando início");
      
      const dbData = await getData() || {};
      await saveData({ ...dbData, historicoContracoes: [] });
      
      mostrarAviso("Todo o histórico foi limpo!");
    } catch (error) {
      mostrarAviso("Erro ao limpar histórico.");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER IDENTICO AO CONTADOR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(gestante)/(tabs)/gestação')} style={[styles.back, { left: 20 }]}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.title} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Contrações</Text>
        <TouchableOpacity onPress={() => setModalVisivel(true)} style={[styles.back, { right: 20 }]}>
          <MaterialCommunityIcons name="history" size={28} color={theme.colors.title} />
        </TouchableOpacity>
      </View>


      {mensagemAviso !== "" && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoTexto}>{mensagemAviso}</Text>
        </View>
      )}


      <View style={styles.main}>

        <Text style={[
          styles.status, 
          alertaInteligente.includes("ATENÇÃO") && { color: theme.colors.textPrimary, fontWeight: 'bold' }
        ]}>
          {alertaInteligente}
        </Text>
        
        <Text style={styles.tempo}>{formatarTempo(tempo)}</Text>
        

        <TouchableOpacity 
          activeOpacity={0.8}
          style={[
            styles.botaoChute, 
            ativo ? { backgroundColor: theme.colors.textPrimary } : { backgroundColor: theme.colors.primary }
          ]} 
          onPress={toggleContracao}
        >
          <Text style={styles.botaoTexto}>{ativo ? "PARAR" : "INICIAR"}</Text>
        </TouchableOpacity>

        {ativo && (
          <TouchableOpacity onPress={cancelarContagem} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.colors.title, fontSize: 16, textDecorationLine: 'underline' }}>
              Cancelar contagem atual
            </Text>
          </TouchableOpacity>
        )}
      </View>

  
  
      <Modal animationType="slide" transparent visible={modalVisivel} onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Histórico</Text>
              
              <View style={styles.modalAcoesTopo}>
                {historico.length > 0 && (
                  <TouchableOpacity onPress={apagarTodos} style={{marginRight: 15}}>
                    <Text style={styles.apagarTudoTexto}>Limpar Tudo</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisivel(false)}>
                  <MaterialCommunityIcons name="close" size={28} color={theme.colors.title} />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: theme.colors.title}}>Nenhum histórico encontrado.</Text>}
              renderItem={({ item }) => (
                <View style={styles.cardHistorico}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardData}>{item.data} - {item.hora}</Text>
                    <Text style={{color: theme.colors.title}}>Duração: <Text style={{fontWeight: 'bold'}}>{item.duracaoFormatada}</Text></Text>
                    <Text style={{color: theme.colors.title, fontSize: 13, marginTop: 4, opacity: 0.8}}>
                      Intervalo desde a última: {item.intervalo ? formatarTempo(item.intervalo) : "--"}
                    </Text>
                  </View>
                  
                  <TouchableOpacity onPress={() => apagarItem(item.id)} style={styles.iconeLixeira}>
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.terceary },
  header: { height: 110, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 60 },
  titulo: { fontSize: theme.texts.title, fontWeight: 'bold', color: theme.colors.title },
  
  avisoContainer: {
    backgroundColor: theme.colors.primary, padding: 10, marginHorizontal: 20, borderRadius: 8,
    alignItems: 'center', position: 'absolute', top: 110, width: '90%', zIndex: 10,
  },
  avisoTexto: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  status: { fontSize: 16, color: theme.colors.title, textAlign: 'center', marginBottom: 10, paddingHorizontal: 20, opacity: 0.7 },
  tempo: { fontSize: 80, fontWeight: 'bold', color: theme.colors.title, marginBottom: 20 },
  
  botaoChute: { 
    width: 220, 
    height: 220, 
    borderRadius: 110, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  botaoTexto: { color: theme.colors.textSecondary, fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.terceary, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: theme.colors.title },
  modalAcoesTopo: { flexDirection: 'row', alignItems: 'center' },
  apagarTudoTexto: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16 },
  
  cardHistorico: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 15, backgroundColor: theme.colors.secondary, borderRadius: 15, marginBottom: 10, // Rosa bebe
    borderWidth: 1, borderColor: theme.colors.primary
  },
  cardData: { fontWeight: 'bold', marginBottom: 5, fontSize: 16, color: theme.colors.title },
  iconeLixeira: { padding: 10 }
});
