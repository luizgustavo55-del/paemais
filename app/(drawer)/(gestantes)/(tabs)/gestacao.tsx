import Compartilhar from "@/src/components/(barra)/Compartilhar";
import Desenvolvimento from "@/src/components/(barra)/Desenvolvimento";
import Diario from "@/src/components/(barra)/Diario";
import Embriologia from "@/src/components/(barra)/Embriologia";
import Ferramentas from "@/src/components/(barra)/Ferramentas";
import Nomes from "@/src/components/(barra)/Nomes";
import Planejamentos from "@/src/components/(barra)/Planejamento";
import VisaoGeral from "@/src/components/(barra)/VisaoGeral";
import { dadosSemanas } from "@/src/constants/infoGest";
import { theme } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 IMPORTS ATUALIZADOS
import { auth, firestore } from "@/src/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot, // Trocado getDoc por onSnapshot para escutar em tempo real
  query,
  where,
} from "firebase/firestore";

const ferra = [
  { id: "1", title: "Visão Geral", icon: "home-outline" },
  { id: "2", title: "Desenvolvimento", icon: "heart-outline" },
  { id: "3", title: "Embriologia", icon: "medkit-outline" },
  { id: "4", title: "Ferramentas", icon: "construct-outline" },
  { id: "5", title: "Diário", icon: "book-outline" },
  { id: "6", title: "Planejamentos", icon: "calendar-outline" },
  { id: "7", title: "Nomes", icon: "people-outline" },
  { id: "8", title: "Compartilhar", icon: "share-social-outline" },
];

export default function Inicio() {
  const navigation = useNavigation();
  const [escolha, setEscolha] = useState("1");
  const [nome, setNome] = useState("");
  const [semana, setSemana] = useState(0);
  const [dias, setDias] = useState(0);
  const [tamanho, setTamanho] = useState("...");
  const [peso, setPeso] = useState("...");
  const [fruta, setFruta] = useState("...");
  const [emoji, setEmoji] = useState("...");

  useEffect(() => {
    // 🔥 1. Escuta mudanças de Login/Logout
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🔥 2. Escuta os dados do usuário em tempo real
        const docRef = doc(firestore, "usuarios", user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setNome(docSnap.data().nome || "");
          }
        });

        // 🔥 3. Escuta a subcoleção "gestacoes" em tempo real
        const gestacoesRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "gestacoes",
        );
        const q = query(gestacoesRef, where("status", "==", "ativa"));

        const unsubGestacao = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const dadosGestacao = querySnapshot.docs[0].data();
            const dataDUM = dadosGestacao.dataUltimaMenstruacao;

            if (dataDUM) {
              const partes = dataDUM.split("/");
              const dum = new Date(
                Number(partes[2]),
                Number(partes[1]) - 1,
                Number(partes[0]),
              );
              dum.setHours(0, 0, 0, 0);

              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);

              const diferencaMs = hoje.getTime() - dum.getTime();
              const diasTotais = Math.max(
                0,
                Math.round(diferencaMs / (1000 * 60 * 60 * 24)),
              );

              const semanasCalculadas = Math.floor(diasTotais / 7);
              const diasExtras = diasTotais % 7;

              setSemana(semanasCalculadas);
              setDias(diasExtras);

              const info =
                dadosSemanas[semanasCalculadas] || dadosSemanas[40] || {};
              setTamanho(info.tamanho || "...");
              setPeso(info.peso || "...");
              setFruta(info.fruta || "...");
              setEmoji(info.emoji || "...");
            }
          } else {
            // Se não tiver gestação ativa, zera os dados para não ficar com a da conta anterior
            setSemana(0);
            setDias(0);
            setTamanho("...");
            setPeso("...");
            setFruta("...");
            setEmoji("...");
          }
        });

        // Limpa as escutas do Firestore ao desmontar
        return () => {
          unsubUser();
          unsubGestacao();
        };
      } else {
        // 🔥 4. Se deslogou, zera todos os estados da tela
        setNome("");
        setSemana(0);
        setDias(0);
        setTamanho("...");
        setPeso("...");
        setFruta("...");
        setEmoji("...");
      }
    });

    // Limpa a escuta de Auth
    return () => unsubscribeAuth();
  }, []);

  const render = () => {
    switch (escolha) {
      case "1":
        return <VisaoGeral />;
      case "2":
        return <Desenvolvimento />;
      case "3":
        return <Embriologia />;
      case "4":
        return <Ferramentas />;
      case "5":
        return <Diario />;
      case "6":
        return <Planejamentos />;
      case "7":
        return <Nomes />;
      case "8":
        return <Compartilhar />;
      default:
        return <VisaoGeral />;
    }
  };

  return (
  <View style={styles.container}>
    <View style={styles.topContainer}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          activeOpacity={0.7}
        >
          <View style={styles.iconBack}>
            <Ionicons name="person" size={18} color="#FFF" />
          </View>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            {nome ? `Olá, ${nome.split(" ")[0]} ` : "Minha Gestação"}
          </Text>

          <Text style={styles.subtitle}>
            Acompanhe sua gravidez
          </Text>
        </View>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.mainCardIcon}>
          <Ionicons
            name="happy-outline"
            size={28}
            color={theme.colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.weekText}>
            {semana} semanas • {dias} dias
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              📏 {tamanho}
            </Text>

            <Text style={styles.infoLabel}>
              ⚖️ {peso}
            </Text>
          </View>

          <Text style={styles.mainInfo}>
            Comparável a(o): {fruta} {emoji}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.menuContainer}
      >
        {ferra.map((item) => {
          const ativo = escolha === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.menuButton,
                ativo && styles.menuButtonActive,
              ]}
              onPress={() => setEscolha(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={17}
                color={ativo ? "#FFF" : "#8B2F61"}
              />

              <Text
                style={[
                  styles.menuText,
                  ativo && styles.menuTextActive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>

    <View style={styles.content}>
      {render()}
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5FA",
  },

  /* TOPO */
  topContainer: {
    paddingTop: 42,
    paddingBottom: 20,
    paddingHorizontal: 18,

    backgroundColor: "#C54286",


    elevation: 6,

    shadowColor: "#8B2F61",
    shadowOpacity: 0.12,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 15,
  },

  iconBack: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "rgba(255,255,255,0.16)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 26,

    fontWeight: "700",

    letterSpacing: 0.3,
  },

  subtitle: {
    color: "#FCE1EC",

    marginTop: 3,

    fontSize: 14,

    fontWeight: "500",
  },

  /* CARD PRINCIPAL */
  mainCard: {
    backgroundColor: "#d65294",

    borderRadius: 24,

    padding: 18,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#F8D7E7",

    elevation: 4,

    shadowColor: "#A13D71",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  mainCardIcon: {
    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "#FFD9EC",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 15,
  },

  weekText: {
    color: "#8B2F61",

    fontSize: 18,

    fontWeight: "700",

    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    marginBottom: 8,
  },

  infoLabel: {
    color: "#8B2F61",

    fontSize: 13,

    fontWeight: "600",

    backgroundColor: "#FFF5FA",

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 12,
  },

  mainInfo: {
    color: "#7A4A63",

    fontSize: 14,

    lineHeight: 22,
  },

  /* MENU */
  menuContainer: {
    paddingBottom: 4,
    paddingRight: 20,
  },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 11,

    backgroundColor: "#FFF0F8",

    borderRadius: 16,

    marginRight: 10,

    borderWidth: 1,
    borderColor: "#F4C7DD",
  },

  menuButtonActive: {
    backgroundColor: "#8B2F61",

    borderColor: "#8B2F61",
  },

  menuText: {
    marginLeft: 7,

    color: "#8B2F61",

    fontSize: 13,

    fontWeight: "600",
  },

  menuTextActive: {
    color: "#FFFFFF",
  },

  /* CONTEÚDO */
  content: {
    flex: 1,

    paddingHorizontal: 14,
    paddingTop: 16,
  },
});
