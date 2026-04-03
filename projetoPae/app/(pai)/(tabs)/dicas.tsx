import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function DicasScreen() {
  const [aba, setAba] = useState("rotina");
  const router = useRouter();

  return (
    <LinearGradient colors={["#8E2DE2", "#C642A6"]} style={styles.container}>

      <Text style={styles.title}>Dicas</Text>
      <Text style={styles.subtitle}>
        Informações úteis para você e seu bebê
      </Text>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "rotina" ? styles.tabActive : styles.tab}
          onPress={() => setAba("rotina")}
        >
          <Text style={styles.tabText}>Rotina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "auxilios" ? styles.tabActive : styles.tab}
          onPress={() => setAba("auxilios")}
        >
          <Text style={styles.tabText}>Auxílios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "bebe" ? styles.tabActive : styles.tab}
          onPress={() => setAba("bebe")}
        >
          <Text style={styles.tabText}>Bebê</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* ROTINA */}
        {aba === "rotina" && (
          <>
            <View style={styles.sliderContainer}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <View style={styles.slider} />
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Metas da Semana</Text>
                <TouchableOpacity style={styles.plusBtn}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {[
                "Fazer exercícios leves 3x por semana",
                "Dormir pelo menos 8 horas por noite",
                "Beber 2L de água diariamente",
                "Meditar 10 minutos por dia",
              ].map((item, index) => (
                <View key={index} style={styles.item}>
                  <Ionicons name="radio-button-off" size={18} color="#C642A6" />
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* AUXÍLIOS */}
        {aba === "auxilios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Auxílios disponíveis</Text>

            <View style={styles.listContainer}>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/marcoLegal")}>
                <Text style={styles.tipTitle}>Marco Legal da Primeira Infância</Text>
                <Text style={styles.tipText}>
                  Aprovada em 2016, a Lei n.º 13.257 instituiu o Marco Legal da Primeira Infância.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/cadUnico")}>
                <Text style={styles.tipTitle}>Cadastro Único (CadÚnico)</Text>
                <Text style={styles.tipText}>
                  Entenda o que é, como funciona e seus variados usos.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/redeAlyne")}>
                <Text style={styles.tipTitle}>Rede Alyne</Text>
                <Text style={styles.tipText}>
                  Atendimento humanizado e seguro para mães e crianças.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/brasilCarinhoso")}>
                <Text style={styles.tipTitle}>Brasil Carinhoso</Text>
                <Text style={styles.tipText}>
                  Apoio à educação infantil e cuidado integral.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/bolsaFamilia")}>
                <Text style={styles.tipTitle}>Bolsa Família</Text>
                <Text style={styles.tipText}>
                  Verifique seu direito ao benefício.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/auxMaternidade")}>
                <Text style={styles.tipTitle}>Auxílio Maternidade</Text>
                <Text style={styles.tipText}>
                  Benefício para mães contribuintes do INSS.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/criançaFeliz")}>
                <Text style={styles.tipTitle}>Criança Feliz</Text>
                <Text style={styles.tipText}>
                  Apoio ao desenvolvimento infantil.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/criancaCidada")}>
                <Text style={styles.tipTitle}>Criança Cidadã</Text>
                <Text style={styles.tipText}>
                  Ajuda no pagamento de creches.
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* BEBÊ */}
        {aba === "bebe" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cuidados com o bebê</Text>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Sono do bebê</Text>
              <Text style={styles.tipText}>
                Recém-nascidos dormem de 14 a 17 horas por dia.
              </Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Amamentação</Text>
              <Text style={styles.tipText}>
                O leite materno é essencial até os 6 meses.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#EBD6F5",
    marginBottom: 15,
  },

  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },

  tabActive: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff33",
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
  },

  tabText: {
    color: "#fff",
    fontSize: 14,
  },

  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  slider: {
    flex: 1,
    height: 6,
    backgroundColor: "#ffffff66",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#ba11f2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },

  plusBtn: {
    backgroundColor: "#C642A6",
    padding: 6,
    borderRadius: 20,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  itemText: {
    color: "#555",
    fontSize: 13,
  },

  listContainer: {
    gap: 12,
  },

  tipBox: {
    backgroundColor: "rgb(242, 215, 255)",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#C642A6",
    elevation: 2,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});