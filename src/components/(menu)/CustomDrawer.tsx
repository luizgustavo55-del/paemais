import { Configuracoes } from "@/src/components/(menu)/configuracoesPais";
import { useTheme } from "@/src/context/ThemeContext"; // 1. Importado o ThemeContext
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image, // 2. Importado o Image
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, firestore } from "@/src/services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import DateTimePicker from "@react-native-community/datetimepicker";

export default function CustomDrawer() {
  const router = useRouter();
  const { theme } = useTheme(); // 3. Puxando o tema do contexto
  const styles = getStyles(theme); // 4. Instanciando os estilos dinâmicos

  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [filhos, setFilhos] = useState<any[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [novoPeso, setNovoPeso] = useState("");
  const [novaAltura, setNovaAltura] = useState("");

  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [dataTexto, setDataTexto] = useState(formatarData(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editandoFilhoId, setEditandoFilhoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editAltura, setEditAltura] = useState("");
  const [editData, setEditData] = useState(new Date());
  const [editDataTexto, setEditDataTexto] = useState("");
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubUser = onSnapshot(
      doc(firestore, "usuarios", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      },
    );

    const unsubFilhos = onSnapshot(
      collection(firestore, "usuarios", user.uid, "filhos"),
      (snap) => {
        const lista = snap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setFilhos(lista);
      },
    );

    return () => {
      unsubUser();
      unsubFilhos();
    };
  }, [user]);

  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR");
  }

  function calcularIdade(dataStr: string) {
    const partes = dataStr.split("/");
    if (partes.length !== 3) return "";

    const nascimento = new Date(
      Number(partes[2]),
      Number(partes[1]) - 1,
      Number(partes[0]),
    );

    const hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    if (anos <= 0) return `${meses} meses`;

    return `${anos} anos`;
  }

  async function adicionarFilho() {
    if (!user?.uid || !novoNome) return;

    try {
      await addDoc(collection(firestore, "usuarios", user.uid, "filhos"), {
        nome: novoNome,
        dataNascimento: dataTexto,
        descricao,
        peso: novoPeso,
        altura: novaAltura,
      });
      limparFormulario();
    } catch (error) {
      console.log(error);
    }
  }

  function limparFormulario() {
    setNovoNome("");
    setDescricao("");
    setNovoPeso("");
    setNovaAltura("");
    setDataNascimento(new Date());
    setDataTexto(formatarData(new Date()));
    setShowAdd(false);
  }

  function excluirFilho(id: string) {
    Alert.alert("Excluir filho", "Tem certeza que deseja excluir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          if (!user?.uid) return;

          try {
            await deleteDoc(doc(firestore, "usuarios", user.uid, "filhos", id));
            if (editandoFilhoId === id) {
              setEditandoFilhoId(null);
            }
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  }

  function iniciarEdicao(filho: any) {
    setEditandoFilhoId(filho.id);
    setEditNome(filho.nome);
    setEditDescricao(filho.descricao || "");
    setEditPeso(filho.peso || "");
    setEditAltura(filho.altura || "");
    setEditDataTexto(filho.dataNascimento);

    const partes = filho.dataNascimento.split("/");
    const data = new Date(
      Number(partes[2]),
      Number(partes[1]) - 1,
      Number(partes[0]),
    );

    setEditData(data);
  }

  async function salvarEdicaoFilho(id: string) {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(firestore, "usuarios", user.uid, "filhos", id), {
        nome: editNome,
        dataNascimento: editDataTexto,
        descricao: editDescricao,
        peso: editPeso,
        altura: editAltura,
      });
      setEditandoFilhoId(null);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {/* 5. Renderização condicional da foto de perfil */}
          {userData?.fotoPerfil ? (
            <Image
              source={{ uri: userData.fotoPerfil }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>{userData?.nome?.[0] || "U"}</Text>
          )}
        </View>

        <Text style={styles.name}>{userData?.nome || "Usuário"}</Text>

        <Text style={styles.email}>{userData?.email || user?.email || ""}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Filhos</Text>

        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.add}>+ Adicionar filho</Text>
        </TouchableOpacity>

        {showAdd && (
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <TextInput
              style={styles.input}
              value={dataTexto}
              placeholder="DD/MM/AAAA"
              onChangeText={setDataTexto}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text
                style={{
                  color: "#a855f7",
                  marginTop: 5,
                  fontSize: theme.texts.text,
                }}
              >
                Abrir calendário
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dataNascimento}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDataNascimento(selectedDate);
                    setDataTexto(formatarData(selectedDate));
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Peso"
              value={novoPeso}
              onChangeText={setNovoPeso}
            />
            <TextInput
              style={styles.input}
              placeholder="Altura"
              value={novaAltura}
              onChangeText={setNovaAltura}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={adicionarFilho}
            >
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={limparFormulario}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {filhos.map((filho) => (
          <View key={filho.id} style={styles.childBox}>
            {editandoFilhoId === filho.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editNome}
                  onChangeText={setEditNome}
                />
                <TextInput
                  style={styles.input}
                  value={editDataTexto}
                  onChangeText={setEditDataTexto}
                />

                <TouchableOpacity onPress={() => setShowEditDatePicker(true)}>
                  <Text
                    style={{
                      color: "#a855f7",
                      marginTop: 5,
                      fontSize: theme.texts.text,
                    }}
                  >
                    Abrir calendário
                  </Text>
                </TouchableOpacity>

                {showEditDatePicker && (
                  <DateTimePicker
                    value={editData}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowEditDatePicker(false);
                      if (selectedDate) {
                        setEditData(selectedDate);
                        setEditDataTexto(formatarData(selectedDate));
                      }
                    }}
                  />
                )}

                <TextInput
                  style={styles.input}
                  value={editPeso}
                  onChangeText={setEditPeso}
                  placeholder="Peso"
                  placeholderTextColor="gray"
                />
                <TextInput
                  style={styles.input}
                  value={editAltura}
                  onChangeText={setEditAltura}
                  placeholder="Altura"
                  placeholderTextColor="gray"
                />
                <TextInput
                  style={styles.input}
                  value={editDescricao}
                  onChangeText={setEditDescricao}
                  placeholder="Descrição"
                  placeholderTextColor="gray"
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => salvarEdicaoFilho(filho.id)}
                >
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirFilho(filho.id)}>
                  <Text style={styles.deleteText}>Excluir filho</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.childName}>{filho.nome}</Text>
                <Text style={styles.info}>
                  Nascimento: {filho.dataNascimento}
                </Text>
                <Text style={styles.info}>
                  Idade: {calcularIdade(filho.dataNascimento)}
                </Text>

                {filho.descricao && (
                  <Text style={styles.info}>{filho.descricao}</Text>
                )}
                {filho.peso && (
                  <Text style={styles.info}>Peso: {filho.peso}</Text>
                )}
                {filho.altura && (
                  <Text style={styles.info}>Altura: {filho.altura}</Text>
                )}

                <TouchableOpacity onPress={() => iniciarEdicao(filho)}>
                  <Text
                    style={{
                      color: "#a855f7",
                      marginTop: 5,
                      fontSize: theme.texts.text,
                    }}
                  >
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirFilho(filho.id)}>
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={styles.menuGeral}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/MenuPage/perfil")}
        >
          <Ionicons name="person-outline" size={22} color="#333" />
          <Text style={styles.menuItemText}>Ver Perfil</Text>
        </TouchableOpacity>

        <View>
          <Configuracoes />
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/Compartilhar")}
        >
          <Feather name="share-2" size={22} color="#333" />
          <Text style={styles.menuItemText}>Amigos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (error) {
              console.log("Erro ao sair:", error);
            }
          }}
          style={[styles.menuItem, styles.logoutButton]}
        >
          <Feather name="log-out" size={22} color="#ff4d4d" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 6. Transformado em uma função para receber o 'theme' dinâmico
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#8b64de", padding: 20 },

    header: {
      backgroundColor: "#7b5ac4b7",
      padding: 20,
      borderRadius: 12,
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#8569c199",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden", // Importante para arredondar a imagem
    },

    avatarImage: {
      width: "100%",
      height: "100%",
    },

    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: theme.texts.subtitle,
    },

    name: {
      color: "#f9d3ff",
      fontSize: theme.texts.subtitle,
      marginTop: 10,
      fontWeight: "bold",
    },
    email: { color: "#f9d3ff", fontSize: theme.texts.text },

    section: { marginTop: 20 },

    title: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#f9d3ff",
    },
    add: {
      color: "#f9d3ff",
      marginTop: 5,
      fontWeight: "bold",
      fontSize: theme.texts.text,
    },

    inputBox: {
      marginTop: 10,
      backgroundColor: "#7f5acf",
      padding: 10,
      borderRadius: 10,
    },

    childBox: {
      backgroundColor: "#7f5acf",
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
    },

    childName: {
      fontWeight: "bold",
      fontSize: theme.texts.subtitle,
      color: "#f9d3ff",
    },
    info: { color: "#d6b5e0", fontSize: theme.texts.text },

    input: {
      backgroundColor: "#fafafa",
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
      fontSize: theme.texts.text,
    },

    saveButton: {
      backgroundColor: "#a855f7",
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
      alignItems: "center",
    },

    saveText: { color: "#fff", fontWeight: "bold", fontSize: theme.texts.text },

    cancelButton: {
      backgroundColor: "#ccc",
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
      alignItems: "center",
    },

    cancelText: {
      fontWeight: "bold",
      color: "#333",
      fontSize: theme.texts.text,
    },

    deleteText: {
      color: "#ff4d4d",
      marginTop: 8,
      fontWeight: "bold",
      fontSize: theme.texts.text,
    },

    menuGeral: {
      marginTop: 30,
      borderTopWidth: 1,
      borderColor: "#7b5ac4b7",
      paddingTop: 15,
      paddingBottom: 40,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },

    menuItemText: {
      fontSize: theme.texts.subtitle, // Aplicando a tipografia dinâmica aqui também
      color: "#333",
      marginLeft: 15,
    },

    logoutButton: {
      marginTop: 15,
    },

    logoutText: {
      color: "#ff4d4d",
      fontWeight: "bold",
      marginLeft: 15,
      fontSize: theme.texts.subtitle,
    },
  });
