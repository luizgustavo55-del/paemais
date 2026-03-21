import { useRouter } from "expo-router";
import {
View,
Text,
TouchableOpacity,
StyleSheet,
Alert,
Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

// 🔥 Firebase
import { auth, db } from "@/src/services/firebase";
import { ref, update } from "firebase/database";

export default function Dum() {

const router = useRouter();

const [data, setData] = useState(new Date());
const [dataTexto, setDataTexto] = useState("");
const [mostrarDate, setMostrarDate] = useState(false);
const [loading, setLoading] = useState(false);

function formatarData(date: Date){
const dia = String(date.getDate()).padStart(2,"0");
const mes = String(date.getMonth()+1).padStart(2,"0");
const ano = date.getFullYear();
return `${dia}/${mes}/${ano}`;
}

async function salvarDUM(){

if(!dataTexto){
Alert.alert("Erro","Selecione uma data");
return;
}

if(loading) return;

setLoading(true);

try{

const user = auth.currentUser;

if(!user){
Alert.alert("Erro","Usuário não autenticado");
return;
}

// 🔥 SALVAR
await update(ref(db, "usuarios/" + user.uid), {
dataUltimaMenstruacao: dataTexto
});

// 🔀 IR PARA TABS
router.replace("/(tabs)");

}catch(error){
Alert.alert("Erro","Erro ao salvar dados");
console.log(error);
}finally{
setLoading(false);
}
}

return(

<View style={styles.container}>

<View style={styles.card}>

<Text style={styles.emoji}>🤰</Text>

<Text style={styles.titulo}>Configurar Gravidez</Text>

<Text style={styles.subtitulo}>
Informe a data da sua última menstruação
</Text>

<Text style={styles.label}>DUM</Text>

<TouchableOpacity
style={styles.input}
onPress={()=>setMostrarDate(true)}
>
<Text style={{color: dataTexto ? "#000" : "#999"}}>
{dataTexto || "Selecionar data"}
</Text>
</TouchableOpacity>

{mostrarDate && (
<DateTimePicker
value={data}
mode="date"
display="default"
onChange={(event,date)=>{
setMostrarDate(Platform.OS === "ios");

if(date){
setData(date);
setDataTexto(formatarData(date));
}
}}
/>
)}

<TouchableOpacity
onPress={salvarDUM}
disabled={!dataTexto || loading}
style={{ width: "100%", opacity: (!dataTexto || loading) ? 0.5 : 1 }}
>
<LinearGradient
colors={["#ff5fa2","#a75dff"]}
style={styles.botao}
>
<Text style={styles.botaoTexto}>
{loading ? "Salvando..." : "Começar Acompanhamento"}
</Text>
</LinearGradient>
</TouchableOpacity>

</View>

</View>
);
}

const styles = StyleSheet.create({
container:{ flex:1, backgroundColor:"#f3e6ef", padding:20, justifyContent:"center" },
card:{ backgroundColor:"#e9d5e5", padding:20, borderRadius:20, alignItems:"center" },
emoji:{ fontSize:40, marginBottom:10 },
titulo:{ fontSize:20, fontWeight:"bold" },
subtitulo:{ textAlign:"center", marginBottom:20 },
label:{ alignSelf:"flex-start", marginBottom:5 },
input:{ width:"100%", backgroundColor:"#fff", padding:15, borderRadius:12, marginBottom:20 },
botao:{ width:"100%", padding:15, borderRadius:12, alignItems:"center" },
botaoTexto:{ color:"#fff", fontWeight:"bold" }
});