import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native'; 
import { Feather } from "@expo/vector-icons";
import { theme } from '@/src/constants/theme';
import { getCurrentUser } from '@/src/services/auth';
import { getData, saveData } from '@/src/services/database';

export function EditarPerfil({ onUpdate }: { onUpdate?: () => void }) {
  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const ativarFuncao = () => {
    setVisivel(!visivel);
  };

  useEffect(() => {
    async function carregarPerfil() {
      if (visivel) {
        setCarregando(true);
        try {
          const userAuth = await getCurrentUser();
          if (!userAuth) return;

          const dadosSalvos = await getData(userAuth.uid); 

          if (dadosSalvos && dadosSalvos.user) {
            setNome(dadosSalvos.user.nome || "");
            setEmail(dadosSalvos.user.email || userAuth?.email || ""); 
            setTelefone(dadosSalvos.user.telefone || "");
            setCidade(dadosSalvos.user.cidade || "");
            setDataNascimento(dadosSalvos.user.dataNascimento || "");
            setBio(dadosSalvos.user.bio || "");
          }
        } catch (error) {
          console.log(error);
        } finally {
          setCarregando(false);
        }
      }
    }
    carregarPerfil();
  }, [visivel]);

  const salvarAlteracoes = async () => {
    setCarregando(true);
    try {
      const userAuth = await getCurrentUser();
      if (!userAuth) {
        Alert.alert("Erro", "Utilizador não encontrado.");
        return;
      }

      const dadosAtuais = await getData(userAuth.uid) || {};

      const novosDados = {
        ...dadosAtuais,
        user: {
          ...dadosAtuais.user,
          nome,
          email,
          telefone,
          cidade,
          dataNascimento,
          bio,
          uid: userAuth.uid
        }
      };

      await saveData(userAuth.uid, novosDados);
      
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setVisivel(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={ativarFuncao}>
        <Feather name="user" size={20} color="#333" />
        <Text style={styles.menuItemText}>Editar Perfil</Text>
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {carregando && !nome ? (
                <ActivityIndicator size="large" color={theme.colors.cards} style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.form}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />

                  <Text style={styles.label}>E-mail</Text>
                  <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={email} editable={false} />

                  <Text style={styles.label}>Telefone</Text>
                  <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />

                  <Text style={styles.label}>Data de Nascimento</Text>
                  <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" />

                  <Text style={styles.label}>Cidade</Text>
                  <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Sua cidade" />

                  <Text style={styles.label}>Bio / Sobre mim</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Conte um pouco sobre você..." multiline numberOfLines={4} />

                  <View style={styles.colaboradorCard}>
                    <View style={styles.colaboradorHeader}>
                      <View style={styles.starIconBg}>
                        <Feather name="star" size={18} color="#fff" />
                      </View>
                      <Text style={styles.colaboradorTitle}>Seja um Colaborador</Text>
                    </View>
                    <Text style={styles.colaboradorText}>
                      Compartilhe sua experiência e ajude outros pais na nossa comunidade.
                    </Text>
                    <TouchableOpacity style={styles.btnSolicitar}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Solicitar Acesso</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setVisivel(false)}>
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvarContainer} onPress={salvarAlteracoes} disabled={carregando}>
                <View style={styles.btnSalvar}>
                  {carregando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Salvar</Text>}
                </View>
              </TouchableOpacity>
            </View>
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
    height: '90%',
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
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colaboradorCard: {
    backgroundColor: theme.colors.terceary,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.terceary,
  },
  colaboradorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starIconBg: {
    backgroundColor: theme.colors.cards,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  colaboradorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  colaboradorText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  btnSolicitar: {
    backgroundColor: theme.colors.cards,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBottom: 20,
  },
  btnCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  btnSalvarContainer: {
    flex: 2,
  },
  btnSalvar: {
    backgroundColor: theme.colors.cards,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
