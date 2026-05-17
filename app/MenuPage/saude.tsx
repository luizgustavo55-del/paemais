import MeuMapa from "@/src/components/(mapa)/meuMapa";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/src/services/firebase";
import { onValue, ref, update } from "firebase/database";

export default function Saude() {
  const [aba, setAba] = useState("vacinas");
  const [vacinas, setVacinas] = useState<any[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [dataTemp, setDataTemp] = useState("");

  const [filhos, setFilhos] = useState<any[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<any>(null);

  const router = useRouter();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const filhosRef = ref(db, `usuarios/${userId}/filhos`);

    onValue(filhosRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.entries(data).map(([id, valor]) => ({
          id,
          ...(valor as object),
        }));

        setFilhos(lista);

        if (lista.length === 1) {
          setFilhoSelecionado(lista[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!filhoSelecionado) return;

    const vacinasRef = ref(
      db,
      `usuarios/${userId}/filhos/${filhoSelecionado.id}/vacinas`,
    );

    onValue(vacinasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setVacinas(Object.values(data));
      } else {
        const inicial = {
          v1: { nome: "BCG", idade: "Ao nascer", data: "" },
          v2: { nome: "Hepatite B", idade: "Ao nascer", data: "" },
          v3: { nome: "Pentavalente 1ª dose", idade: "2 meses", data: "" },
          v4: { nome: "VIP 1ª dose", idade: "2 meses", data: "" },
          v5: { nome: "Rotavírus 1ª dose", idade: "2 meses", data: "" },
          v6: { nome: "Pneumocócica 1ª dose", idade: "2 meses", data: "" },
          v7: { nome: "Meningocócica C 1ª dose", idade: "3 meses", data: "" },
          v8: { nome: "Pentavalente 2ª dose", idade: "4 meses", data: "" },
          v9: { nome: "VIP 2ª dose", idade: "4 meses", data: "" },
          v10: { nome: "Rotavírus 2ª dose", idade: "4 meses", data: "" },
          v11: { nome: "Pneumocócica 2ª dose", idade: "4 meses", data: "" },
          v12: { nome: "Meningocócica C 2ª dose", idade: "5 meses", data: "" },
          v13: { nome: "Pentavalente 3ª dose", idade: "6 meses", data: "" },
          v14: { nome: "VIP 3ª dose", idade: "6 meses", data: "" },
          v15: { nome: "Febre Amarela", idade: "9 meses", data: "" },
          v16: { nome: "Tríplice Viral", idade: "12 meses", data: "" },
          v17: { nome: "Pneumocócica reforço", idade: "12 meses", data: "" },
          v18: { nome: "Meningocócica reforço", idade: "12 meses", data: "" },
          v19: { nome: "DTP reforço", idade: "15 meses", data: "" },
          v20: { nome: "VOP reforço", idade: "15 meses", data: "" },
          v21: { nome: "Hepatite A", idade: "15 meses", data: "" },
          v22: { nome: "Tetraviral", idade: "15 meses", data: "" },
        };

        update(
          ref(db, `usuarios/${userId}/filhos/${filhoSelecionado.id}/vacinas`),
          inicial,
        );
      }
    });
  }, [filhoSelecionado]);

  const salvarData = (index: number) => {
    if (!dataTemp || !filhoSelecionado) return;

    const novas = [...vacinas];
    novas[index].data = dataTemp;

    setVacinas(novas);
    setEditando(null);
    setDataTemp("");

    const atualizacao: any = {};
    novas.forEach((v, i) => {
      atualizacao[`v${i + 1}`] = v;
    });

    update(
      ref(db, `usuarios/${userId}/filhos/${filhoSelecionado.id}/vacinas`),
      atualizacao,
    );
  };

  const cancelar = () => {
    setEditando(null);
    setDataTemp("");
  };

  const vacinasTomadas = vacinas.filter((v) => v.data && v.data !== "").length;

  const progresso =
    vacinas.length > 0 ? (vacinasTomadas / vacinas.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/menu")}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Saúde</Text>
      </View>

      <View style={styles.filhoBox}>
        {filhos.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filhoItem,
              filhoSelecionado?.id === f.id && styles.filhoAtivo,
            ]}
            onPress={() => setFilhoSelecionado(f)}
          >
            <Text style={styles.filhoText}>{f.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "vacinas" ? styles.tabActive : styles.tab}
          onPress={() => setAba("vacinas")}
        >
          <Text style={styles.tabText}>Vacinação</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "locais" ? styles.tabActive : styles.tab}
          onPress={() => setAba("locais")}
        >
          <Text style={styles.tabText}>Locais</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "historico" ? styles.tabActive : styles.tab}
          onPress={() => setAba("historico")}
        >
          <Text style={styles.tabText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {aba === "locais" ? (
        <View style={styles.mapa}>
          <MeuMapa />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {aba === "vacinas" && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Progresso</Text>

                <Text style={styles.progressText}>
                  {vacinasTomadas} de {vacinas.length}
                </Text>

                <View style={styles.slider}>
                  <View
                    style={{
                      height: 6,
                      width: `${progresso}%`,
                      backgroundColor: "#C642A6",
                      borderRadius: 10,
                    }}
                  />
                </View>
              </View>

              <View style={styles.card}>
                {vacinas.map((v, i) => (
                  <View key={i} style={styles.item}>
                    <TouchableOpacity onPress={() => setEditando(i)}>
                      <Ionicons
                        name={v.data ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={v.data ? "green" : "#999"}
                      />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.nomeVacina}>{v.nome}</Text>
                      <Text style={styles.itemText}>
                        {v.idade} • {v.data || "Pendente"}
                      </Text>

                      {editando === i && (
                        <View style={styles.inputContainer}>
                          <TextInput
                            placeholder="dd/mm/aaaa"
                            value={dataTemp}
                            onChangeText={setDataTemp}
                            style={styles.input}
                          />

                          <View style={styles.botoes}>
                            <TouchableOpacity onPress={() => salvarData(i)}>
                              <Text style={styles.salvar}>Salvar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={cancelar}>
                              <Text style={styles.cancelar}>Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {aba === "historico" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Histórico</Text>
              <Text>
                Aqui estarão os relatorios de consultas adicionados pelos
                profissionais, com resultados de exames e os documentos
                necessarios (atestados, exames como raio x, hemograma etc )
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#7050B3",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  filhoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },

  filhoItem: {
    backgroundColor: "#ffffff22",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  filhoAtivo: {
    backgroundColor: "#28174cca",
  },

  filhoText: {
    color: "#fff",
    fontWeight: "500",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  tabAtiveText: {
    color: "#fff7fd",
    fontWeight: "500",
  },

  tabText: {
    color: "#36265a",
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  mapa: {
    flex: 1,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    elevation: 3,
    overflow: "hidden",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },

  progressText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  slider: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  nomeVacina: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },

  itemText: {
    color: "#555",
    fontSize: 13,
  },

  inputContainer: {
    marginTop: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    fontSize: 13,
  },

  botoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 6,
  },

  salvar: {
    color: "#C642A6",
    fontWeight: "bold",
  },

  cancelar: {
    color: "red",
    fontWeight: "bold",
  },
});
