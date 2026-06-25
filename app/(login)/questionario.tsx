import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import MaskInput from "react-native-mask-input";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

// FIREBASE
import { auth, firestore, storage } from "@/src/services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const colors = {
  paisBackground: "#7050b3",
  paisPrimary: "#8b64de",
  paisSecondary: "#9b5de5",
  background: "#b390d8",
  primary: "#7b2cff",
  card: "#5407b8",
  textMenu: "#28174cca",

  surface: "#FFFFFF",
  surfaceMuted: "#F3EEFC",
  border: "#E1D4F7",
  textDark: "#28174c",
  textMuted: "#6B5C8F",
  success: "#1FAA59",
  successBg: "#E8F8EE",
  danger: "#E0245E",
  dangerBg: "#FDEAF0",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type Errors = {
  nome?: string;
  email?: string;
  telefone?: string;
  profissao?: string;
  arquivo?: string;
};

function formatBytes(bytes?: number) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function fileIconFor(name: string) {
  const ext = name?.split(".").pop()?.toLowerCase();

  if (ext === "pdf") return "file-text";

  if (["jpg", "jpeg", "png"].includes(ext ?? "")) {
    return "image";
  }

  return "file";
}

export default function CadastroColaborador() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [arquivo, setArquivo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function validarCampo(campo: keyof Errors, valor: string) {
    switch (campo) {
      case "nome":
        return valor.trim().length < 3
          ? "Informe seu nome completo"
          : undefined;

      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
          ? "Informe um e-mail válido"
          : undefined;

      case "telefone":
        return valor.replace(/\D/g, "").length < 10
          ? "Informe um telefone válido"
          : undefined;

      case "profissao":
        return !valor ? "Selecione sua profissão" : undefined;

      default:
        return undefined;
    }
  }

  function handleBlur(campo: keyof Errors, valor: string) {
    setFocusedField(null);

    setTouched((prev) => ({
      ...prev,
      [campo]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [campo]: validarCampo(campo, valor),
    }));
  }

  function borderColorFor(campo: string) {
    if (errors[campo as keyof Errors] && touched[campo]) {
      return colors.danger;
    }

    if (focusedField === campo) {
      return colors.primary;
    }

    return colors.border;
  }

  async function selecionarDocumento() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size && file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          arquivo: "O arquivo deve ter até 5MB",
        }));

        return;
      }

      setErrors((prev) => ({
        ...prev,
        arquivo: undefined,
      }));

      setArquivo(file);
    } catch {
      Alert.alert("Erro", "Não foi possível selecionar o documento");
    }
  }

  function removerArquivo() {
    setArquivo(null);

    setErrors((prev) => ({
      ...prev,
      arquivo: "Anexe um documento de comprovação",
    }));
  }

  function validarTudo() {
    const novosErros: Errors = {
      nome: validarCampo("nome", nome),
      email: validarCampo("email", email),
      telefone: validarCampo("telefone", telefone),
      profissao: validarCampo("profissao", profissao),
      arquivo: arquivo ? undefined : "Anexe um documento de comprovação",
    };

    setErrors(novosErros);

    setTouched({
      nome: true,
      email: true,
      telefone: true,
      profissao: true,
      arquivo: true,
    });

    return !Object.values(novosErros).some(Boolean);
  }

  async function enviar() {
    if (!validarTudo()) {
      Alert.alert(
        "Verifique os campos",
        "Alguns campos precisam de atenção antes de continuar.",
      );

      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado");
        setLoading(false);
        return;
      }

      const uid = user.uid;

      const response = await fetch(arquivo.uri);
      const blob = await response.blob();

      const fileName = `${uid}_${Date.now()}_${arquivo.name}`;
      const fileRef = storageRef(storage, `colaboradores/${fileName}`);

      await uploadBytes(fileRef, blob);

      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(firestore, "colaboradores"), {
        uid,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone,
        profissao,
        arquivo: {
          nome: arquivo.name,
          url: downloadURL,
          tipo: arquivo.mimeType || "",
          tamanho: arquivo.size || null,
        },
        status: "pendente",
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      Alert.alert(
        "Sucesso",
        "Solicitação enviada! Vamos analisar seus dados em breve.",
      );

      setNome("");
      setEmail("");
      setTelefone("");
      setProfissao("");
      setArquivo(null);
      setTouched({});
      setErrors({});
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível enviar sua solicitação. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.paisBackground, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Feather name="briefcase" size={26} color={colors.surface} />
        </View>

        <Text style={styles.heroTitle}>Torne-se Colaborador</Text>

        <Text style={styles.heroSubtitle}>
          Compartilhe sua experiência profissional com nossa comunidade
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Feather
            name="info"
            size={18}
            color={colors.paisPrimary}
            style={{ marginTop: 1 }}
          />

          <Text style={styles.infoCardText}>
            Colaboradores podem compartilhar conteúdo especializado, responder
            dúvidas da comunidade e contribuir com dicas profissionais.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Seus dados</Text>

        <Text style={styles.label}>Nome completo</Text>

        <View style={[styles.fieldRow, { borderColor: borderColorFor("nome") }]}>
          <Feather name="user" size={17} color={colors.textMuted} />

          <TextInput
            style={styles.fieldInput}
            placeholder="Seu nome completo"
            placeholderTextColor={colors.textMuted}
            value={nome}
            onChangeText={setNome}
            onFocus={() => setFocusedField("nome")}
            onBlur={() => handleBlur("nome", nome)}
          />
        </View>

        {touched.nome && errors.nome && (
          <Text style={styles.errorText}>{errors.nome}</Text>
        )}

        <Text style={styles.label}>E-mail</Text>

        <View
          style={[styles.fieldRow, { borderColor: borderColorFor("email") }]}
        >
          <Feather name="mail" size={17} color={colors.textMuted} />

          <TextInput
            style={styles.fieldInput}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            onBlur={() => handleBlur("email", email)}
          />
        </View>

        {touched.email && errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        <Text style={styles.label}>Telefone</Text>

        <View
          style={[
            styles.fieldRow,
            { borderColor: borderColorFor("telefone") },
          ]}
        >
          <Feather name="phone" size={17} color={colors.textMuted} />

          <MaskInput
            style={styles.fieldInput}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={telefone}
            onChangeText={(masked) => setTelefone(masked)}
            onFocus={() => setFocusedField("telefone")}
            onBlur={() => handleBlur("telefone", telefone)}
            mask={[
              "(",
              /\d/,
              /\d/,
              ")",
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
          />
        </View>

        {touched.telefone && errors.telefone && (
          <Text style={styles.errorText}>{errors.telefone}</Text>
        )}

        <Text style={styles.label}>Qual sua profissão?</Text>

        <View
          style={[
            styles.fieldRow,
            styles.selectRow,
            { borderColor: borderColorFor("profissao") },
          ]}
        >
          <Feather name="award" size={17} color={colors.textMuted} />

          <Picker
            selectedValue={profissao}
            onValueChange={(itemValue) => {
              setProfissao(itemValue);

              setTouched((prev) => ({
                ...prev,
                profissao: true,
              }));

              setErrors((prev) => ({
                ...prev,
                profissao: validarCampo("profissao", itemValue),
              }));
            }}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            <Picker.Item
              label="Selecione sua profissão"
              value=""
              color={colors.textMuted}
            />
            <Picker.Item label="Enfermeiro(a)" value="enfermeiro" />
            <Picker.Item label="Médico(a)" value="medico" />
            <Picker.Item label="Psicólogo(a)" value="psicologo" />
            <Picker.Item label="Nutricionista" value="nutricionista" />
            <Picker.Item label="Educador(a)" value="educador" />
            <Picker.Item label="Outra" value="outra" />
          </Picker>
        </View>

        {touched.profissao && errors.profissao && (
          <Text style={styles.errorText}>{errors.profissao}</Text>
        )}

        <Text style={styles.sectionTitle}>Comprovação profissional</Text>

        {!arquivo ? (
          <TouchableOpacity
            style={[
              styles.upload,
              touched.arquivo && errors.arquivo
                ? { borderColor: colors.danger }
                : null,
            ]}
            onPress={selecionarDocumento}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIconWrap}>
              <Feather name="upload-cloud" size={22} color={colors.primary} />
            </View>

            <Text style={styles.uploadText}>Toque para anexar documento</Text>

            <Text style={styles.uploadSub}>PDF, JPG ou PNG · máx. 5MB</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileCard}>
            <View style={styles.fileCardRow}>
              <View style={styles.fileIconWrap}>
                <Feather
                  name={fileIconFor(arquivo.name) as any}
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {arquivo.name}
                </Text>

                <View style={styles.fileMetaRow}>
                  <Feather name="check-circle" size={12} color={colors.success} />

                  <Text style={styles.fileMeta}>
                    {" "}
                    Anexado
                    {arquivo.size ? ` · ${formatBytes(arquivo.size)}` : ""}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={removerArquivo}
                style={styles.fileRemove}
              >
                <Feather name="x" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {arquivo.mimeType?.includes("image") && (
              <Image source={{ uri: arquivo.uri }} style={styles.image} />
            )}

            <TouchableOpacity
              onPress={selecionarDocumento}
              style={styles.fileReplace}
            >
              <Feather name="repeat" size={13} color={colors.paisPrimary} />

              <Text style={styles.fileReplaceText}>Substituir arquivo</Text>
            </TouchableOpacity>
          </View>
        )}

        {touched.arquivo && errors.arquivo && (
          <Text style={styles.errorText}>{errors.arquivo}</Text>
        )}

        <TouchableOpacity
          onPress={enviar}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.paisPrimary, colors.primary, colors.paisSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <>
                <Feather name="send" size={16} color={colors.surface} />
                <Text style={styles.buttonText}>Enviar solicitação</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta?</Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}> Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  hero: {
    paddingTop: Platform.select({
      ios: 64,
      android: 48,
      default: 48,
    }),
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF26",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF40",
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.2,
  },

  heroSubtitle: {
    fontSize: 13.5,
    color: "#EAE0FB",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 19,
  },

  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
  },

  sheetContent: {
    padding: 22,
    paddingBottom: 40,
  },

  infoCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoCardText: {
    flex: 1,
    color: colors.textDark,
    fontSize: 13,
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.paisPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMenu,
    marginBottom: 6,
    marginTop: 2,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
  },

  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    color: colors.textDark,
    height: "100%",
  },

  selectRow: {
    paddingHorizontal: 8,
    height: 52,
  },

  picker: {
    flex: 1,
    color: colors.textDark,
  },

  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },

  upload: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.paisSecondary,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: "center",
    backgroundColor: colors.surface,
    marginTop: 4,
  },

  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  uploadText: {
    fontWeight: "700",
    color: colors.textDark,
    fontSize: 14,
  },

  uploadSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  fileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 4,
  },

  fileCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  fileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  fileName: {
    fontWeight: "700",
    color: colors.textDark,
    fontSize: 13.5,
  },

  fileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  fileMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
  },

  fileRemove: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginTop: 12,
  },

  fileReplace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  fileReplaceText: {
    fontSize: 12.5,
    color: colors.paisPrimary,
    fontWeight: "600",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,

    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  buttonText: {
    color: colors.surface,
    fontSize: 15.5,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  loginText: {
    color: colors.textMuted,
    fontSize: 13.5,
  },

  loginLink: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13.5,
  },
});