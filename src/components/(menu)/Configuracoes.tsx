import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch, Alert } from 'react-native'; 
import { Feather, Ionicons } from "@expo/vector-icons";
import { theme } from '@/src/constants/theme';
import { saveData, getData } from '@/src/services/database';
import { deleteUserAccount, getCurrentUser } from '@/src/services/auth';

export function Configuracoes() {
  const [visivel, setVisivel] = useState(false);
  const [situacao, setSituacao] = useState<'gestante' | 'filhos'>('gestante'); 
  const [modoEscuro, setModoEscuro] = useState(false);
  const [sonsDoApp, setSonsDoApp] = useState(true);

  useEffect(() => {
    const carregarPreferencias = async () => {
      const userLogado = await getCurrentUser();
      if (!userLogado) return;

      const dados = await getData(userLogado.uid);
      if (dados && dados.perfil) {
        setSituacao(dados.perfil);
      }
    };
    carregarPreferencias();
  }, []);

  const ativarFuncao = () => {
    setVisivel(!visivel);
  };

  const handleMudarPerfil = async (novoPerfil: 'gestante' | 'filhos') => {
    setSituacao(novoPerfil);
    try {
      const userLogado = await getCurrentUser();
      if (!userLogado) return;

      const dadosAtuais = await getData(userLogado.uid) || {};
      await saveData(userLogado.uid, { ...dadosAtuais, perfil: novoPerfil });
    } catch (error) {
      console.error("Erro ao salvar o perfil", error);
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      "Excluir Conta",
      "Tem certeza? Esta ação é permanente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            await deleteUserAccount();
          } 
        }
      ]
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={ativarFuncao}>
        <Feather name="settings" size={20} color="#333" />
        <Text style={styles.menuItemText}>Configurações</Text>
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seu Perfil Atual</Text>
                <TouchableOpacity 
                  style={[styles.situacaoItem, situacao === 'gestante' && styles.situacaoItemAtiva]}
                  onPress={() => handleMudarPerfil('gestante')}
                >
                  <Ionicons name="heart" size={24} color={situacao === 'gestante' ? '#fff' : theme.colors.cards} />
                  <View style={styles.situacaoTextContainer}>
                    <Text style={[styles.situacaoTextMain, situacao === 'gestante' && {color: '#fff'}]}>Estou Gestante</Text>
                    <Text style={[styles.situacaoTextSub, situacao === 'gestante' && {color: '#eee'}]}>Acompanhe sua gravidez</Text>
                  </View>
                  {situacao === 'gestante' && <Feather name="check" size={20} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.situacaoItem, situacao === 'filhos' && styles.situacaoItemAtiva]}
                  onPress={() => handleMudarPerfil('filhos')}
                >
                  <Ionicons name="people" size={24} color={situacao === 'filhos' ? '#fff' : theme.colors.cards} />
                  <View style={styles.situacaoTextContainer}>
                    <Text style={[styles.situacaoTextMain, situacao === 'filhos' && {color: '#fff'}]}>Já tenho Filhos</Text>
                    <Text style={[styles.situacaoTextSub, situacao === 'filhos' && {color: '#eee'}]}>Dicas para os pequenos</Text>
                  </View>
                  {situacao === 'filhos' && <Feather name="check" size={20} color="#fff" />}
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferências</Text>
                <View style={styles.settingItemRow}>
                  <View style={styles.textColumn}>
                    <Text style={styles.settingItemMain}>Modo Escuro</Text>
                    <Text style={styles.settingItemSub}>Visual mais confortável</Text>
                  </View>
                  <Switch value={modoEscuro} onValueChange={setModoEscuro} trackColor={{ true: theme.colors.cards }} />
                </View>

                <View style={styles.settingItemRow}>
                  <View style={styles.textColumn}>
                    <Text style={styles.settingItemMain}>Sons do App</Text>
                    <Text style={styles.settingItemSub}>Alertas e notificações</Text>
                  </View>
                  <Switch value={sonsDoApp} onValueChange={setSonsDoApp} trackColor={{ true: theme.colors.cards }} />
                </View>
              </View>

              <View style={[styles.section, { borderBottomWidth: 0 }]}>
                <Text style={[styles.sectionTitle, { color: '#ff4d4d' }]}>Zona de Perigo</Text>
                <TouchableOpacity style={styles.settingLinkItem} onPress={handleExcluirConta}>
                  <Feather name="trash-2" size={20} color="#ff4d4d" />
                  <Text style={[styles.settingItemMain, { color: '#ff4d4d', marginLeft: 15 }]}>Excluir minha conta</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 15,
    letterSpacing: 1,
  },
  situacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  situacaoItemAtiva: {
    backgroundColor: theme.colors.cards,
    borderColor: theme.colors.cards,
  },
  situacaoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  situacaoTextMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  situacaoTextSub: {
    fontSize: 12,
    color: '#777',
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textColumn: {
    flex: 1,
  },
  settingItemMain: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingItemSub: {
    fontSize: 12,
    color: '#888',
  },
  settingLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
});
