import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { LineChart } from "react-native-chart-kit";
import MaskInput from "react-native-mask-input";

// 🔥 Firebase
import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

const screenWidth = Dimensions.get("window").width;

export default function Desenvolvimento() {
  const router = useRouter();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("marcos");

  // 
  const [filhos, setFilhos] = useState<any[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<any>(null);
  const [abrirPicker, setAbrirPicker] = useState(false);

  // 
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [dataCrescimento, setDataCrescimento] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);

  // 🧩 MARCOS
  const [marcos, setMarcos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [dataMarco, setDataMarco] = useState("");
  const [editandoMarcoId, setEditandoMarcoId] = useState<string | null>(null);

  const user = auth.currentUser;

  // 
  useEffect(() => {
    if (!user) return;

    const refFilhos = ref(db, `usuarios/${user.uid}/filhos`);

    onValue(refFilhos, (snapshot) => {
      const dados = snapshot.val() || {};

      const lista = Object.keys(dados).map((key) => ({
        id: key,
        ...dados[key]
      }));

      setFilhos(lista);

      if (lista.length === 1) {
        setFilhoSelecionado(lista[0]);
      }
    });
  }, []);

  
  useEffect(() => {
    if (!user || !filhoSelecionado) return;

    const refCrescimento = ref(
      db,
      `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/crescimento`
    );

    onValue(refCrescimento, (snapshot) => {
      const dados = snapshot.val() || {};

      const lista = Object.keys(dados).map((key) => ({
        id: key,
        ...dados[key]
      }));

      setHistorico(lista);
    });
  }, [filhoSelecionado]);

  // 🔥 marcos
  useEffect(() => {
    if (!user || !filhoSelecionado) return;

    const refMarcos = ref(
      db,
      `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/marcos`
    );

    onValue(refMarcos, (snapshot) => {
      const dados = snapshot.val() || {};

      const lista = Object.keys(dados).map((key) => ({
        id: key,
        ...dados[key]
      }));

      setMarcos(lista.reverse());
    });
  }, [filhoSelecionado]);

  // ===== MARCOS =====
  const salvarMarco = () => {
    if (!titulo || !dataMarco || !filhoSelecionado || !user) {
      Alert.alert("Preencha tudo");
      return;
    }

    const base = `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/marcos`;

    if (editandoMarcoId) {
      update(ref(db, `${base}/${editandoMarcoId}`), {
        titulo,
        data: dataMarco
      });
    } else {
      push(ref(db, base), {
        titulo,
        data: dataMarco
      });
    }

    cancelarMarco();
  };

  const editarMarco = (item: any) => {
    setTitulo(item.titulo);
    setDataMarco(item.data);
    setEditandoMarcoId(item.id);
    setMostrarForm(true);
  };

  const deletarMarco = (id: string) => {
    if (!user || !filhoSelecionado) return;

    remove(
      ref(
        db,
        `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/marcos/${id}`
      )
    );
  };

  const cancelarMarco = () => {
    setTitulo("");
    setDataMarco("");
    setEditandoMarcoId(null);
    setMostrarForm(false);
  };

  // ===== CRESCIMENTO =====
  const salvarCrescimento = () => {
    if (!peso || !altura || !dataCrescimento || !filhoSelecionado || !user) {
      Alert.alert("Preencha tudo");
      return;
    }

    push(
      ref(
        db,
        `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/crescimento`
      ),
      {
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        data: dataCrescimento
      }
    );

    setPeso("");
    setAltura("");
    setDataCrescimento("");
  };

  const deletarCrescimento = (id: string) => {
    if (!user || !filhoSelecionado) return;

    remove(
      ref(
        db,
        `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/crescimento/${id}`
      )
    );
  };

  const pesos = historico.map((i) => i.peso);
  const alturas = historico.map((i) => i.altura);
  const datas = historico.map((i) => i.data);
  // 📝 DIÁRIO STATES (coloque junto com os outros)
const [textoDiario, setTextoDiario] = useState("");
const [dataDiario, setDataDiario] = useState("");
const [diario, setDiario] = useState<any[]>([]);

// 🔥 buscar diário
useEffect(() => {
  if (!user || !filhoSelecionado) return;

  const refDiario = ref(
    db,
    `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/diario`
  );

  onValue(refDiario, (snapshot) => {
    const dados = snapshot.val() || {};

    const lista = Object.keys(dados).map((key) => ({
      id: key,
      ...dados[key]
    }));

    setDiario(lista.reverse());
  });
}, [filhoSelecionado]);

// ➕ salvar diário
const salvarDiario = () => {
  if (!textoDiario || !dataDiario || !filhoSelecionado || !user) {
    Alert.alert("Preencha tudo");
    return;
  }

  push(
    ref(
      db,
      `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/diario`
    ),
    {
      texto: textoDiario,
      data: dataDiario
    }
  );

  setTextoDiario("");
  setDataDiario("");
};

// ❌ deletar diário
const deletarDiario = (id: string) => {
  if (!user || !filhoSelecionado) return;

  remove(
    ref(
      db,
      `usuarios/${user.uid}/filhos/${filhoSelecionado.id}/diario/${id}`
    )
  );
};

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/menu")}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Desenvolvimento</Text>

         
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setAbaAtiva("marcos")}>
          <Text style={abaAtiva === "marcos" ? styles.tabActive : styles.tab}>
            Marcos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva("crescimento")}>
          <Text style={abaAtiva === "crescimento" ? styles.tabActive : styles.tab}>
            Crescimento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva("diario")}>
          <Text style={abaAtiva === "diario" ? styles.tabActive : styles.tab}>
            Diário
          </Text>
        </TouchableOpacity>
      </View>

      {/* FILHO */}
      <View style={styles.card}>
        <Text style={styles.label}>Acompanhando</Text>

        <TouchableOpacity
          style={styles.select}
          onPress={() => setAbrirPicker(!abrirPicker)}
        >
          <Text>
            {filhoSelecionado
              ? `${filhoSelecionado.nome}`
              : "Selecione um filho"}
          </Text>
          <Ionicons name="chevron-down" size={18} />
        </TouchableOpacity>

        {abrirPicker &&
          filhos.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={styles.pickerItem}
              onPress={() => {
                setFilhoSelecionado(f);
                setAbrirPicker(false);
              }}
            >
              <Text>{f.nome}</Text>
            </TouchableOpacity>
          ))}
      </View>

      {/* ===== MARCOS ===== */}
      {abaAtiva === "marcos" && (
        <View style={styles.card}>
          <View style={styles.headerCard}>
            <Text style={styles.cardTitulo}>Marcos</Text>

            <TouchableOpacity
              style={styles.botaoAdd}
              onPress={() => setMostrarForm(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {mostrarForm && (
            <View style={styles.form}>
              <TextInput
                placeholder="Título"
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
              />

              <MaskInput
                value={dataMarco}
                onChangeText={(masked) => setDataMarco(masked)}
                mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                placeholder="DD/MM/AAAA"
                style={styles.input}
              />

              <View style={styles.botoes}>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarMarco}>
                  <Text style={{ color: "#fff" }}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={cancelarMarco}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {marcos.map((item) => (
            <View key={item.id} style={styles.marco}>
              <Text>{item.titulo}</Text>
              <Text>{item.data}</Text>

              <View style={styles.acoes}>
                <TouchableOpacity onPress={() => editarMarco(item)}>
                  <Ionicons name="create-outline" size={20} color="#C642A6" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deletarMarco(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ===== CRESCIMENTO ===== */}
      {abaAtiva === "crescimento" && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Crescimento</Text>

          <TextInput
            placeholder="Peso (kg)"
            style={styles.input}
            value={peso}
            onChangeText={setPeso}
            keyboardType="numeric"
          />

          <TextInput
            placeholder="Altura (cm)"
            style={styles.input}
            value={altura}
            onChangeText={setAltura}
            keyboardType="numeric"
          />

          <MaskInput
            value={dataCrescimento}
            onChangeText={(masked) => setDataCrescimento(masked)}
            mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
            placeholder="DD/MM/AAAA"
            style={styles.input}
          />

          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarCrescimento}>
            <Text style={{ color: "#fff" }}>Adicionar</Text>
          </TouchableOpacity>

          {historico.length > 0 && (
            <LineChart
              data={{
                labels: datas,
                datasets: [{ data: pesos }, { data: alturas }],
                legend: ["Peso", "Altura"]
              }}
              width={screenWidth - 60} // 🔥 AJUSTADO (era -40)
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#ece3ff", // 🔥 IGUAL AO CARD
                backgroundGradientTo: "#ece3ff",   // 🔥 IGUAL AO CARD
                color: () => "#6a4bcf", // 🔥 COR MAIS SUAVE
                labelColor: () => "#555" // 🔥 MELHOR LEITURA
              }}
              style={[ styles.grafico,{ alignSelf: "center" } ]}
            />
          )}

          {historico.map((item) => (
            <View key={item.id} style={styles.marco}>
              <Text>Peso: {item.peso}</Text>
              <Text>Altura: {item.altura}</Text>
              <Text>{item.data}</Text>

              <TouchableOpacity onPress={() => deletarCrescimento(item.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ===== DIÁRIO ===== */}
     {abaAtiva === "diario" && (
  <View style={styles.card}>
    <Text style={styles.cardTitulo}>Diário</Text>

    <TextInput
      placeholder="Escreva algo sobre o dia..."
      style={[styles.input, { height: 80 }]}
      multiline
      value={textoDiario}
      onChangeText={setTextoDiario}
    />

    <MaskInput
      value={dataDiario}
      onChangeText={(masked) => setDataDiario(masked)}
      mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
      placeholder="DD/MM/AAAA"
      style={styles.input}
    />

    <TouchableOpacity style={styles.botaoSalvar} onPress={salvarDiario}>
      <Text style={{ color: "#fff" }}>Salvar</Text>
    </TouchableOpacity>

    {diario.map((item) => (
      <View key={item.id} style={styles.marco}>
        <Text style={{ fontWeight: "bold" }}>{item.data}</Text>
        <Text>{item.texto}</Text>

        <TouchableOpacity onPress={() => deletarDiario(item.id)}>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7050b8",
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold"
  },
  subTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },

  tabs: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 15
  },

  tab: {
    color: "#fff",
    backgroundColor: "#ffffff22",
    padding: 8,
    borderRadius: 10,
    paddingHorizontal: 30,
  },

  tabActive: {
    color: "#C642A6",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    paddingHorizontal: 30,
  },

  card: {
      overflow: "hidden" ,
    backgroundColor: "#ece3ff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15
  },

  label: {
    color: "#777",
    marginBottom: 5
  },

  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 10
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  cardTitulo: {
    fontWeight: "bold",
    fontSize: 16
  },

  botaoAdd: {
    backgroundColor: "#b44a8b",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },

  form: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },

  botoes: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    marginTop: 5
  },

  botaoSalvar: {
    backgroundColor: "#C642A6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center"
  },

  marco: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f3f3f3",
    borderRadius: 10
  },

  acoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10
  },

  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  grafico: {
    marginTop: 15,
    borderRadius: 10,
   
  }
});