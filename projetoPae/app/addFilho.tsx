import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import { auth, db } from "@/src/services/firebase";
import { ref, push, update } from "firebase/database";

export default function Filhos() {

    const [nome, setNome] = useState("");
    const [data, setData] = useState("");
    const [sexo, setSexo] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());

    const router = useRouter();

    function handleData(text: string) {
        let cleaned = text.replace(/\D/g, "");

        if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

        let formatted = cleaned;

        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4)}`;
        } else if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
        }

        setData(formatted);
    }

 
    function formatarData(date: Date) {
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const ano = date.getFullYear();

        return `${dia}/${mes}/${ano}`;
    }

    // 📅 AO ESCOLHER DATA
    function onChange(event: any, selectedDate?: Date) {
        setShowPicker(false);

        if (selectedDate) {
            setDateObj(selectedDate);
            setData(formatarData(selectedDate));
        }
    }

    // 🚀 SALVAR FILHO
    async function salvarFilho() {

        if (!nome || !data || !sexo) {
            Alert.alert("Erro", "Preencha todos os campos");
            return;
        }

        if (loading) return;

        setLoading(true);

        try {

            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Erro", "Usuário não logado");
                return;
            }

            // 📁 SALVAR FILHO
            const filhosRef = ref(db, `usuarios/${user.uid}/filhos`);

            await push(filhosRef, {
                nome,
                dataNascimento: data,
                sexo
            });

            // 🧠 DEFINIR TIPO COMO PAI
            const userRef = ref(db, `usuarios/${user.uid}`);

            await update(userRef, {
                tipo: "pai"
            });

            Alert.alert("Sucesso", "Filho cadastrado!");

            // 🔀 IR PARA TABS DO PAI
            router.replace("/(pai)/(tabs)" as any);

        } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Erro ao salvar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>

            <LinearGradient
                colors={['#ff4db8', '#7b2cff']}
                style={styles.icone}
            >
                <Text style={{ color: "#fff", fontSize: 30 }}>👶</Text>
            </LinearGradient>

            <Text style={styles.titulo}>
                Conte-nos sobre seu filho
            </Text>

            <View style={styles.card}>

                <Text>Nome *</Text>
                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Digite o nome"
                />

                <Text>Data de nascimento *</Text>

                {/* INPUT COM MÁSCARA */}
                <TextInput
                    style={styles.input}
                    value={data}
                    onChangeText={handleData}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                />

                {/* BOTÃO CALENDÁRIO */}
                <TouchableOpacity
                    style={styles.botaoCalendario}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={{ color: "#7b2cff" }}>
                        Abrir calendário
                    </Text>
                </TouchableOpacity>

                {/* DATE PICKER */}
                {showPicker && (
                    <DateTimePicker
                        value={dateObj}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onChange}
                    />
                )}

                <Text>Sexo *</Text>

                <View style={styles.sexoContainer}>

                    <TouchableOpacity
                        style={[
                            styles.sexoBotao,
                            sexo === "menino" && styles.sexoSelecionado
                        ]}
                        onPress={() => setSexo("menino")}
                    >
                        <Text>👦 Menino</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sexoBotao,
                            sexo === "menina" && styles.sexoSelecionado
                        ]}
                        onPress={() => setSexo("menina")}
                    >
                        <Text>👧 Menina</Text>
                    </TouchableOpacity>

                </View>

            </View>

            <TouchableOpacity
                style={{ width: "100%", opacity: loading ? 0.5 : 1 }}
                onPress={salvarFilho}
                disabled={loading}
            >
                <LinearGradient
                    colors={['#ff4db8', '#7b2cff']}
                    style={styles.botao}
                >
                    <Text style={styles.textoBotao}>
                        {loading ? "Salvando..." : "Salvar"}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF0F6",
        alignItems: "center"
    },
    icone: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20
    },
    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    },
    card: {
        width: "100%",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 20
    },
    input: {
        backgroundColor: "#f2f2f2",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10
    },
    botaoCalendario: {
        marginBottom: 10,
        alignItems: "flex-end"
    },
    sexoContainer: {
        flexDirection: "row",
        gap: 10
    },
    sexoBotao: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: "center"
    },
    sexoSelecionado: {
        backgroundColor: "#ffe0f0"
    },
    botao: {
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold"
    }
});