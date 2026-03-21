import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaskInput from "react-native-mask-input";
import { Eye, EyeOff, Calendar } from "lucide-react-native";
import { useRouter } from "expo-router";

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "firebase/auth";

import { ref, set } from "firebase/database";
import { auth, db } from "@/src/services/firebase";

export default function Cadastro() {

  const router = useRouter();

  const [nome,setNome] = useState("");
  const [email,setEmail] = useState("");
  const [telefone,setTelefone] = useState("");
  const [cidade,setCidade] = useState("");

  const [senha,setSenha] = useState("");
  const [confirmarSenha,setConfirmarSenha] = useState("");

  const [showSenha,setShowSenha] = useState(false);
  const [showConfirmSenha,setShowConfirmSenha] = useState(false);

  const [data,setData] = useState(new Date());
  const [dataTexto,setDataTexto] = useState("");
  const [mostrarDate,setMostrarDate] = useState(false);

  // 🔥 NOVO
  const [tipo, setTipo] = useState<"pai" | "gestante" | "">("");

  function handleData(text: string){
    let cleaned = text.replace(/\D/g,"");

    if(cleaned.length > 8) cleaned = cleaned.slice(0,8);

    let formatted = cleaned;

    if(cleaned.length > 4){
      formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4)}`;
    } else if(cleaned.length > 2){
      formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
    }

    setDataTexto(formatted);
  }

  async function salvar(){

    if(!nome || !email || !telefone || !cidade || !senha || !confirmarSenha){
      Alert.alert("Erro","Preencha todos os campos");
      return;
    }

    if(!tipo){
      Alert.alert("Erro","Selecione uma opção");
      return;
    }

    if(senha !== confirmarSenha){
      Alert.alert("Erro","As senhas não coincidem");
      return;
    }

    try{

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if(methods.length > 0){
        Alert.alert("Erro", "Email já cadastrado");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      await set(ref(db, "usuarios/" + uid), {
        nome,
        email,
        telefone,
        cidade,
        dataNascimento: dataTexto,
        tipo, // 🔥 SALVA SÓ ISSO
        criadoEm: new Date().toISOString()
      });

      Alert.alert("Sucesso", "Conta criada!");

      if(tipo === "pai"){
        router.replace("/addFilho");
      } else {
        router.replace("/dum");
      }

    }catch(error: any){

      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Email já em uso");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Email inválido");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Erro", "Senha fraca");
      } else {
        Alert.alert("Erro","Erro ao criar conta");
      }
    }
  }

  return(
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.card}>

        <Text style={styles.titulo}>Criar Conta</Text>

        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome}/>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}/>

        <MaskInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          mask={["(",/\d/,/\d/,")"," ",/\d/,/\d/,/\d/,/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/]}
        />

        <View style={styles.dataContainer}>
          <TextInput
            style={styles.dataInput}
            placeholder="dd/mm/aaaa"
            value={dataTexto}
            onChangeText={handleData}
          />
          <TouchableOpacity onPress={()=>setMostrarDate(true)}>
            <Calendar size={22}/>
          </TouchableOpacity>
        </View>

        {mostrarDate && (
          <DateTimePicker
            value={data}
            mode="date"
            onChange={(e,date)=>{
              if(date){
                const dia = String(date.getDate()).padStart(2,"0");
                const mes = String(date.getMonth()+1).padStart(2,"0");
                const ano = date.getFullYear();
                setDataTexto(`${dia}/${mes}/${ano}`);
              }
              setMostrarDate(false);
            }}
          />
        )}

        <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade}/>

        <View style={styles.senhaContainer}>
          <TextInput secureTextEntry={!showSenha} style={styles.senhaInput} value={senha} onChangeText={setSenha}/>
          <TouchableOpacity onPress={()=>setShowSenha(!showSenha)}>
            {showSenha ? <EyeOff/> : <Eye/>}
          </TouchableOpacity>
        </View>

        <View style={styles.senhaContainer}>
          <TextInput secureTextEntry={!showConfirmSenha} style={styles.senhaInput} value={confirmarSenha} onChangeText={setConfirmarSenha}/>
          <TouchableOpacity onPress={()=>setShowConfirmSenha(!showConfirmSenha)}>
            {showConfirmSenha ? <EyeOff/> : <Eye/>}
          </TouchableOpacity>
        </View>

        {/* 🔥 ESCOLHA */}
        <View style={styles.opcaoContainer}>
          <TouchableOpacity
            style={[styles.opcao, tipo === "pai" && styles.opcaoAtiva]}
            onPress={()=>setTipo("pai")}
          >
            <Text>Já tenho filho</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.opcao, tipo === "gestante" && styles.opcaoAtiva]}
            onPress={()=>setTipo("gestante")}
          >
            <Text>Estou grávida</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={salvar}>
          <LinearGradient colors={["#ff5fa2","#a75dff"]} style={styles.botao}>
            <Text style={{color:"#fff"}}>Criar Conta</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flexGrow:1, padding:20, backgroundColor:"#ffe4ec" },
  card:{ backgroundColor:"#fff", padding:20, borderRadius:20 },
  titulo:{ fontSize:22, textAlign:"center", fontWeight:"bold" },
  input:{
     borderWidth:1, 
     marginTop:10, 
     padding:12, 
     borderRadius:10 
    },
  dataContainer:{ flexDirection:"row", alignItems:"center", borderWidth:1, borderRadius:10, marginTop:10, paddingHorizontal:10 },
  dataInput:{ flex:1, padding:10 },
  senhaContainer:{ flexDirection:"row", alignItems:"center", borderWidth:1, borderRadius:10, marginTop:10, paddingHorizontal:10 },
  senhaInput:{ flex:1, padding:10 },
  opcaoContainer:{ flexDirection:"row", gap:10, marginTop:20 },
  opcao:{ flex:1, padding:12, borderWidth:1, borderRadius:10, alignItems:"center" },
  opcaoAtiva:{ backgroundColor:"#ffd6e7" },
  botao:{ marginTop:20, padding:15, borderRadius:12, alignItems:"center" }
});