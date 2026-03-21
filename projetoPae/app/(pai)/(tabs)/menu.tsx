import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ref, onValue } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

import * as Notifications from "expo-notifications";

import AgendaModal from "@/src/components/AgendaModal";

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [eventos, setEventos] = useState<any[]>([]);
  const [lembretes, setLembretes] = useState<any[]>([]);
  const [showAgenda, setShowAgenda] = useState(false);

  const user = auth.currentUser;

  // 🔥 BUSCAR EVENTOS
  useEffect(() => {
    if (!user?.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");
    const eventosRef = ref(db, `eventos/${path}`);

    onValue(eventosRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setEventos([]);
        return;
      }

      const lista = Object.values(data);

      setEventos(lista);

      filtrarLembretes(lista);
    });
  }, []);

  // 🔥 FILTRA EVENTOS PRÓXIMOS
  function filtrarLembretes(lista: any[]) {
    const agora = new Date();

    const proximos = lista.filter((item) => {
      const dataEvento = new Date(item.data);
      const diff = (dataEvento.getTime() - agora.getTime()) / 60000;

      return diff > 0 && diff <= 60; // 60 minutos
    });

    setLembretes(proximos);
  }

  return (
    <>
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Como está o seu dia hoje?
          </Text>

          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* CARDS */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.card} onPress={() => setShowAgenda(true)}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={26} color="#e91e63" />
            </View>
            <Text style={styles.label}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push("/saude")}>
            <View style={styles.iconBox}>
              <Ionicons name="heart-outline" size={26} color="#e91e63" />
            </View>
            <Text style={styles.label}>Saúde</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push("/desenvolvimento")}>
            <View style={styles.iconBox}>
              <Ionicons name="happy-outline" size={26} color="#e91e63" />
            </View>
            <Text style={styles.label}>Desenvolvimento</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 LEMBRETES AUTOMÁTICOS */}
        <Text style={styles.sectionTitle}>Próximos Eventos</Text>

        {lembretes.length === 0 && (
          <Text style={{ color: "#666" }}>Nenhum evento próximo</Text>
        )}

        {lembretes.map((item, index) => (
          <View key={index} style={styles.item}>
            <View>
              <Text style={styles.title}>{item.titulo}</Text>
              <Text style={styles.subtitle}>
                {new Date(item.data).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>

      {showAgenda && (
        <AgendaModal onClose={() => setShowAgenda(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    padding: 16,
  },

  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#ac384b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "#ffc0cb",
    padding: 10,
    borderRadius: 12,
    marginBottom: 5,
  },

  label: {
    color: "#fff",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#380516",
    marginBottom: 10,
  },

  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#666",
  },
});