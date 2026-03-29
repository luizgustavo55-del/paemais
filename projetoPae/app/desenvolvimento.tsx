import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Desenvolvimento() {
  const [mostrarForm, setMostrarForm] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.titulo}>Desenvolvimento</Text>
      <Text style={styles.subtitulo}>
        Acompanhe o crescimento do seu bebê
      </Text>

      {/* TABS */}
      <View style={styles.tabs}>
        <Text style={styles.tabActive}>Marcos</Text>
        <Text style={styles.tab}>Crescimento</Text>
        <Text style={styles.tab}>Diário</Text>
      </View>

      {/* FILHO */}
      <View style={styles.card}>
        <Text style={styles.label}>Acompanhando</Text>

        <TouchableOpacity style={styles.select}>
          <Text>Pedro Silva - 2 anos e 7 meses</Text>
          <Ionicons name="chevron-down" size={18} />
        </TouchableOpacity>
      </View>

      {/* MARCOS */}
      <View style={styles.card}>
        <View style={styles.headerCard}>
          <Text style={styles.cardTitulo}>Marcos de Desenvolvimento</Text>

          {/* BOTÃO + */}
          <TouchableOpacity
            style={styles.botaoAdd}
            onPress={() => setMostrarForm(!mostrarForm)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* FORM (SÓ APARECE AO CLICAR NO +) */}
        {mostrarForm && (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>Novo Marco</Text>

            <TextInput
              placeholder="Título do marco (ex: Começou a andar)"
              style={styles.input}
            />

            <TextInput
              placeholder="Idade esperada (ex: 12 meses)"
              style={styles.input}
            />

            <TextInput
              placeholder="dd/mm/aaaa"
              style={styles.input}
            />

            <View style={styles.checkboxRow}>
              <Ionicons name="square-outline" size={20} />
              <Text> Já alcançado</Text>
            </View>

            <View style={styles.botoes}>
              <TouchableOpacity style={styles.botaoSalvar}>
                <Text style={{ color: "#fff" }}>Adicionar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMostrarForm(false)}
              >
                <Text style={{ color: "#555" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* EXEMPLO DE MARCO */}
        <View style={styles.marco}>
          <Text style={{ color: "#999" }}>
            Primeira vez sorrindo
          </Text>
          <Text style={{ fontSize: 12 }}>
            2 meses - 15/10/2022
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8E2DE2",
    padding: 15
  },

  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold"
  },

  subtitulo: {
    color: "#EBD6F5",
    marginBottom: 15
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
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  tabActive: {
    color: "#C642A6",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  card: {
    backgroundColor: "#fff",
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
    backgroundColor: "#C642A6",
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

  formTitulo: {
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  botoes: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center"
  },

  botaoSalvar: {
    backgroundColor: "#C642A6",
    padding: 10,
    borderRadius: 10
  },

  marco: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 10
  }
});