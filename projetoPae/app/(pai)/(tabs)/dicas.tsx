import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function DicasScreen() {
  return (
    <LinearGradient
      colors={["#8E2DE2", "#C642A6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* Header */}
        <Text style={styles.title}>Dicas</Text>
        <Text style={styles.subtitle}>
          Informações úteis para você e seu bebê
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabText}>Rotina</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Auxílios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Bebê</Text>
          </TouchableOpacity>
        </View>

        {/* Slider fake */}
        <View style={styles.sliderContainer}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <View style={styles.slider} />
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>

        {/* Card Metas */}
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

        {/* Card Dicas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dicas de Autocuidado</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Hidratação da pele</Text>
            <Text style={styles.tipText}>
              Use óleos e cremes específicos para gestantes para prevenir estrias
            </Text>
          </View>
        </View>

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
    marginBottom: 15,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  tabActive: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: "#ffffff33",
    borderWidth: 1,
    borderColor: "#fff",
  },

  tabText: {
    color: "#fff",
    fontSize: 15,
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
    backgroundColor: "#F3F3F3",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
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

  tipBox: {
    backgroundColor: "#E9D8F2",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  tipTitle: {
    fontWeight: "bold",
    color: "#7B2CBF",
  },

  tipText: {
    fontSize: 13,
    color: "#555",
  },
});
