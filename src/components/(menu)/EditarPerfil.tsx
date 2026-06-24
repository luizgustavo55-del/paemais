import { useTheme } from "@/src/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, firestore } from "@/src/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function EditarPerfil({ onUpdate }: { onUpdate?: () => void }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [zoomVisivel, setZoomVisivel] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const ativarFuncao = () => {
    setVisivel(!visivel);
  };

  useEffect(() => {
    async function carregarPerfil() {
      if (visivel) {
        setCarregando(true);
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) return;

          const userRef = doc(firestore, "usuarios", uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const dadosSalvos = userSnap.data();
            setNome(dadosSalvos.nome || "");
            setEmail(dadosSalvos.email || auth.currentUser?.email || "");
            setTelefone(dadosSalvos.telefone || "");
            setCidade(dadosSalvos.cidade || "");
            setDataNascimento(dadosSalvos.dataNascimento || "");
            setBio(dadosSalvos.bio || "");
            setFotoPerfil(dadosSalvos.fotoPerfil || null);
          } else {
            setEmail(auth.currentUser?.email || "");
          }
        } catch (error) {
          console.log("Erro ao carregar perfil:", error);
        } finally {
          setCarregando(false);
        }
      }
    }
    carregarPerfil();
  }, [visivel]);

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissao.status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de acesso à galeria para mudar a foto.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imagemBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFotoPerfil(imagemBase64);
    }
  };

  const salvarAlteracoes = async () => {
    setCarregando(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Erro", "Utilizador não encontrado.");
        return;
      }

      const userRef = doc(firestore, "usuarios", uid);

      await setDoc(
        userRef,
        {
          nome,
          email,
          telefone,
          cidade,
          dataNascimento,
          bio,
          uid: uid,
          fotoPerfil: fotoPerfil,
        },
        { merge: true },
      );

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
        <Feather name="user" size={22} color="#333" />
        <Text style={styles.menuItemText}>Editar Perfil</Text>
      </TouchableOpacity>

      <Modal visible={zoomVisivel} transparent={true} animationType="fade">
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            style={styles.fecharZoom}
            onPress={() => setZoomVisivel(false)}
          >
            <Feather name="x" size={32} color="#FFF" />
          </TouchableOpacity>
          {fotoPerfil && (
            <Image
              source={{ uri: fotoPerfil }}
              style={styles.imagemZoom}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

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
                <ActivityIndicator
                  size="large"
                  color={theme.colors.gestantesPrimary}
                  style={{ marginVertical: 20 }}
                />
              ) : (
                <View style={styles.form}>
                  <View style={styles.fotoContainer}>
                    <View style={styles.fotoWrapper}>
                      <TouchableOpacity
                        style={styles.fotoBotao}
                        onPress={() => {
                          if (fotoPerfil) setZoomVisivel(true);
                        }}
                      >
                        {fotoPerfil ? (
                          <Image
                            source={{ uri: fotoPerfil }}
                            style={styles.fotoImagem}
                          />
                        ) : (
                          <Feather
                            name="user"
                            size={50}
                            color={theme.colors.subtitle}
                          />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.fotoIconeEditar}
                        onPress={escolherFoto}
                      >
                        <Feather name="camera" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Seu nome"
                  />

                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                    value={email}
                    editable={false}
                  />

                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={telefone}
                    onChangeText={setTelefone}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>Data de Nascimento</Text>
                  <TextInput
                    style={styles.input}
                    value={dataNascimento}
                    onChangeText={setDataNascimento}
                    placeholder="DD/MM/AAAA"
                  />

                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Sua cidade"
                  />

                  <Text style={styles.label}>Bio / Sobre mim</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Conte um pouco sobre você..."
                    multiline
                    numberOfLines={4}
                  />

                  <View style={styles.colaboradorCard}>
                    <View style={styles.colaboradorHeader}>
                      <View style={styles.starIconBg}>
                        <Feather name="star" size={18} color="#fff" />
                      </View>
                      <Text style={styles.colaboradorTitle}>
                        Seja um Colaborador
                      </Text>
                    </View>
                    <Text style={styles.colaboradorText}>
                      Compartilhe sua experiência e ajude outros pais na nossa
                      comunidade.
                    </Text>
                    <TouchableOpacity style={styles.btnSolicitar}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Solicitar Acesso
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => setVisivel(false)}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSalvarContainer}
                onPress={salvarAlteracoes}
                disabled={carregando}
              >
                <View style={styles.btnSalvar}>
                  {carregando ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Salvar
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    menuItemText: {
      marginLeft: 15,
      fontSize: theme.texts.subtitle,
      color: "#333",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      height: "90%",
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    modalTitle: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.title,
    },
    form: {
      marginBottom: 20,
    },
    /* ESTILOS DA FOTO */
    fotoContainer: {
      alignItems: "center",
      marginBottom: 25,
      marginTop: 10,
    },
    fotoWrapper: {
      width: 110,
      height: 110,
      position: "relative",
    },
    fotoBotao: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.colors.gestantesPrimary,
      overflow: "hidden",
    },
    fotoImagem: {
      width: "100%",
      height: "100%",
    },
    fotoIconeEditar: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.gestantesPrimary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#fff",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },

    zoomContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    fecharZoom: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 10,
    },
    imagemZoom: {
      width: "100%",
      height: "80%",
    },

    label: {
      fontSize: theme.texts.subtitle,
      color: theme.colors.subtitle,
      marginBottom: 8,
      fontWeight: "500",
    },
    input: {
      backgroundColor: "#F8F9FA",
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: "#333",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#EAEAEA",
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    colaboradorCard: {
      backgroundColor: theme.colors.gestantesSecondary,
      borderRadius: 16,
      padding: 16,
      marginTop: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.gestantesPrimary,
    },
    colaboradorHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    starIconBg: {
      backgroundColor: theme.colors.gestantesPrimary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    colaboradorTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "600",
      color: "#333",
    },
    colaboradorText: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      lineHeight: 18,
      marginBottom: 16,
    },
    btnSolicitar: {
      backgroundColor: theme.colors.gestantesPrimary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingBottom: 20,
    },
    btnCancelar: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#EAEAEA",
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginRight: 10,
    },
    btnSalvarContainer: {
      flex: 2,
    },
    btnSalvar: {
      backgroundColor: theme.colors.gestantesPrimary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
  });
