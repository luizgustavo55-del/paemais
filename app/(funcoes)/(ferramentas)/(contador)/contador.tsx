import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from "react-native";
import { theme } from '@/src/constants/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getData, saveData } from '@/src/services/database';

export default function Contador() {
  const router = useRouter();
  const [chutes, setChutes] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [ativo, setAtivo] = useState(false);
  
  const [modalVisivel, setModalVisivel] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);

  const [mensagemAviso, setMensagemAviso] = useState("");
  const [meta, setMeta] = useState(10); 

  useFocusEffect(
    useCallback(() => {
      const carregarMeta = async () => {
        try {
          const dbData = await getData();
          const hist = dbData?.historicoChutes || [];
          
          if (hist.length >= 3) {
            const totalChutes = hist.reduce((acc: number, curr: any) => acc + curr.chutes, 0);
            const media = Math.round(totalChutes / hist.length);
            setMeta(media > 0 ? media : 10);
          } else {
            setMeta(10); 
          }
        } catch (e) {
          console.log("Erro ao carregar meta", e);
        }
      };

      carregarMeta();
    }, [])
  );

  useEffect(() => {
    let interval: any;
    if (ativo) {
      interval = setInterval(() => {
        setTempo((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ativo]);

  const mostrarAviso = (texto: string) => {
    setMensagemAviso(texto);
    setTimeout(() => {
      setMensagemAviso("");
    }, 3000);
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };

  const abrirHistorico = async () => {
    try {
      const dbData = await getData();
      setHistorico(dbData?.historicoChutes || []);
      setModalVisivel(true);
    } catch (e) {
      console.log("Erro ao carregar histórico", e);
    }
  };

  const adicionarChute = () => {
    if (!ativo) {
      mostrarAviso("Toque em 'Iniciar' primeiro!");
      return;
    }
    setChutes((prev) => prev + 1);
  };

  const finalizar = async () => {
    if (tempo === 0 && chutes === 0) {
      mostrarAviso(" Não há dados para salvar.");
      return;
    }
    
    setAtivo(false);

    try {
      const dbData = await getData() || {};
      const listaAnterior = dbData.historicoChutes || [];
      const novaSessao = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        chutes,
        tempo: formatarTempo(tempo)
      };

      await saveData({ 
        ...dbData, 
        historicoChutes: [novaSessao, ...listaAnterior] 
      });

      mostrarAviso("Sessão guardada no histórico!");
      setChutes(0); 
      setTempo(0);
    } catch (e) { 
      mostrarAviso("Erro ao guardar.");
    }
  };

  const apagarItem = async (id: string) => {
    try {
      const novoHistorico = historico.filter(item => item.id !== id);
      setHistorico(novoHistorico);

      const dbData = await getData() || {};
      await saveData({ ...dbData, historicoChutes: novoHistorico });

      mostrarAviso("Registo apagado!");
    } catch (error) {
      mostrarAviso("Erro ao apagar.");
    }
  };

  const apagarTodos = async () => {
    try {
      setHistorico([]);

      const dbData = await getData() || {};
      await saveData({ ...dbData, historicoChutes: [] });

      mostrarAviso("Todo o histórico foi limpo!");
    } catch (error) {
      mostrarAviso("Erro ao limpar histórico.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(gestante)/(tabs)/gestação')} style={[styles.back, { left: 20 }]}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={theme.colors.title} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Contador de Chutes</Text>
        <TouchableOpacity onPress={abrirHistorico} style={[styles.back, { right: 20 }]}>
          <MaterialCommunityIcons name="history" size={28} color={theme.colors.title} />
        </TouchableOpacity>
        
        <TouchableOpacity 
        onPress={()=>router.push('/(funcoes)/(contador)/padroes' as any)} 
        style={[styles.back, { right: 60 }]}>
          <MaterialCommunityIcons name="chart-bell-curve" size={28} color={theme.colors.title} />
        </TouchableOpacity>
      </View>

      {mensagemAviso !== "" && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoTexto}>{mensagemAviso}</Text>
        </View>
      )}

      <View style={styles.main}>
        <Text style={styles.status}>
            {chutes >= meta ? "Meta atingida"  : `Faltam ${meta - chutes} chutes`}
        </Text>
        <Text style={styles.tempo}>{formatarTempo(tempo)}</Text>
        <Text style={styles.progresso}>{chutes} / {meta}</Text>
        
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.botaoChute, !ativo && { backgroundColor: theme.colors.secondary }]} 
          onPress={adicionarChute}
        >
          <Text style={styles.botaoTexto}>+ CHUTE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.bot, { backgroundColor: theme.colors.quaternary }]} onPress={() => {setAtivo(false); setChutes(0); setTempo(0);}}>
          <Text style={styles.botText}>Zerar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.bot, { backgroundColor: theme.colors.primary }]} onPress={() => setAtivo(true)}>
          <Text style={styles.botText}>Iniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bot, { backgroundColor: theme.colors.cards }]} onPress={finalizar}>
          <Text style={styles.botText}>Finalizar</Text>
        </TouchableOpacity>
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
              ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Nenhum histórico encontrado.</Text>}
              renderItem={({ item }) => (
                <View style={styles.cardHistorico}>
                  <View>
                    <Text style={styles.cardData}>{item.data} - {item.hora}</Text>
                    <Text style={{color: '#666'}}>{item.chutes} chutes em {item.tempo}</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 110, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 60 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: theme.colors.title },
  avisoContainer: {
    backgroundColor: '#333', padding: 10, marginHorizontal: 20, borderRadius: 8,
    alignItems: 'center', position: 'absolute', top: 110, width: '90%', zIndex: 10,
  },
  avisoTexto: { color: '#fff', fontWeight: 'bold' },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  status: { fontSize: 16, color: '#666' },
  tempo: { fontSize: 70, fontWeight: 'bold', color: theme.colors.title },
  progresso: { fontSize: 22, color: '#999', marginBottom: 20 },
  botaoChute: { width: 200, height: 200, borderRadius: 100, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  botaoTexto: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  footer: { flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 40 },
  bot: { flex: 1, height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: theme.colors.title },
  modalAcoesTopo: { flexDirection: 'row', alignItems: 'center' },
  apagarTudoTexto: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16 },
  
  cardHistorico: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 15, backgroundColor: theme.colors.terceary, borderRadius: 15, marginBottom: 10 
  },
  cardData: { fontWeight: 'bold', marginBottom: 5, fontSize: 16, color: theme.colors.title },
  iconeLixeira: { padding: 5 } 
});
