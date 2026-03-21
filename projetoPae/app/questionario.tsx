import React, { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView, Image,Alert}
   from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import MaskInput from "react-native-mask-input";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

// 🔥 FIREBASE
import { auth, db, storage } from "@/src/services/firebase";
import { ref as dbRef, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CadastroColaborador() {

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [arquivo, setArquivo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function selecionarDocumento() {

    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true
    });

    if (!result.canceled) {
      setArquivo(result.assets[0]);
    }
  }

  async function enviar() {

    if (!nome || !email || !telefone || !profissao || !arquivo) {
      Alert.alert("Erro", "Preencha todos os campos");
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

      const novaRef = push(dbRef(db, "colaboradores"));

      await set(novaRef, {
        uid,
        nome,
        email,
        telefone,
        profissao,
        arquivo: {
          nome: arquivo.name,
          url: downloadURL
        },
        status: "pendente",
        criadoEm: new Date().toISOString()
      });

      Alert.alert("Sucesso", "Solicitação enviada!");

      setNome("");
      setEmail("");
      setTelefone("");
      setProfissao("");
      setArquivo(null);

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (

    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.info}>
        Para se tornar colaborador, precisamos de algumas informações adicionais.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Colaboradores podem compartilhar conteúdo especializado,
          responder dúvidas da comunidade e contribuir com dicas profissionais.
        </Text>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>E-mail *</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Telefone *</Text>
      <MaskInput
        style={styles.input}
        value={telefone}
        onChangeText={(masked) => setTelefone(masked)}
        mask={[
          "(",
          /\d/, /\d/,
          ")",
          " ",
          /\d/, /\d/, /\d/, /\d/, /\d/,
          "-",
          /\d/, /\d/, /\d/, /\d/
        ]}
      />

      <Text style={styles.label}>Qual sua profissão? *</Text>

      <View style={styles.select}>
        <Picker
          selectedValue={profissao}
          onValueChange={(itemValue) => setProfissao(itemValue)}
        >
          <Picker.Item label="Selecione sua profissão" value="" />
          <Picker.Item label="Enfermeiro(a)" value="enfermeiro" />
          <Picker.Item label="Médico(a)" value="medico" />
          <Picker.Item label="Psicólogo(a)" value="psicologo" />
          <Picker.Item label="Nutricionista" value="nutricionista" />
        </Picker>
      </View>

      <Text style={styles.label}>
        Documento de Comprovação Profissional *
      </Text>

      <TouchableOpacity
        style={styles.upload}
        onPress={selecionarDocumento}
      >
        <Text style={styles.uploadText}>Anexar documento</Text>
        <Text style={styles.uploadSub}>
          PDF, JPG ou PNG (máx. 5MB)
        </Text>
      </TouchableOpacity>

      {arquivo && (
        <View style={styles.preview}>
          <Text style={styles.previewText}>Arquivo selecionado:</Text>
          <Text style={styles.fileName}>{arquivo.name}</Text>

          {arquivo.mimeType?.includes("image") && (
            <Image
              source={{ uri: arquivo.uri }}
              style={styles.image}
            />
          )}
        </View>
      )}

      <TouchableOpacity onPress={enviar} disabled={loading}>
        <LinearGradient
          colors={["#9333EA", "#EC4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, loading && { opacity: 0.5 }]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 🔥 BOTÃO LOGIN */}
      <View style={styles.loginContainer}>
        <Text>Já tem uma conta? </Text>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginLink}>Fazer login</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    padding:20,
    backgroundColor:"#f7f7f7"
  },

  info:{
    fontSize:14,
    color:"#555",
    marginBottom:10
  },

  card:{
    backgroundColor:"#F3E8FF",
    padding:15,
    borderRadius:12,
    marginBottom:20
  },

  cardText:{
    color:"#7C3AED",
    fontSize:14
  },

  label:{
    marginTop:12,
    marginBottom:4,
    fontSize:14,
    color:"#333"
  },

  input:{
    backgroundColor:"#fff",
    padding:12,
    borderRadius:10,
    borderWidth:1,
    borderColor:"#ddd"
  },

  select:{
    backgroundColor:"#fff",
    borderRadius:10,
    borderWidth:1,
    borderColor:"#ddd"
  },

  upload:{
    borderWidth:1,
    borderStyle:"dashed",
    borderColor:"#ccc",
    borderRadius:12,
    padding:20,
    alignItems:"center"
  },

  uploadText:{
    fontWeight:"bold"
  },

  uploadSub:{
    fontSize:12,
    color:"#777"
  },

  preview:{
    marginTop:10
  },

  previewText:{
    fontSize:13
  },

  fileName:{
    fontWeight:"bold",
    marginBottom:5
  },

  image:{
    width:120,
    height:120,
    borderRadius:10
  },

  button:{
    padding:15,
    borderRadius:12,
    alignItems:"center",
    marginTop:20
  },

  buttonText:{
    color:"#fff",
    fontSize:16,
    fontWeight:"bold"
  },

  loginContainer:{
    flexDirection:"row",
    justifyContent:"center",
    marginTop:20
  },

  loginLink:{
    color:"#EC4899",
    fontWeight:"bold"
  }

});