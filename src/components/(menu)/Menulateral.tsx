import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Configuracoes } from "@/src/components/(menu)/Configuracoes";
import { EditarPerfil } from "@/src/components/(menu)/EditarPerfil";

import { auth, db, firestore } from "@/src/services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";

import { theme } from "@/src/constants/theme";

export default function Menulateral() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    nome: "Carregando...",
    email: "",
    tipo: "gestante",
  });

  const [gravidezData, setGravidezData] = useState({
    semanasText: "Não configurado",
    dataParto: "...",
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);

        // 1. Escuta os dados principais do utilizador (Nome, Email, Tipo)
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const dbData = docSnap.data();

            setUserData({
              nome: dbData.nome || "Usuário",
              email: user.email || dbData.email || "",
              tipo: dbData.tipo || "gestante",
            });

            if (dbData.tipo === "pai") {
              setGravidezData({
                semanasText: "Perfil: Parceiro(a)",
                dataParto: "N/A",
              });
            }
          } else {
            // Caso seja parceiro no Realtime Database antigo
            const paiRef = ref(db, "usuarios_pais/" + user.uid);
            onValue(
              paiRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  const paiData = snapshot.val();
                  setUserData({
                    nome: paiData.nome || "Usuário",
                    email: user.email || paiData.email || "",
                    tipo: paiData.tipo || "pai",
                  });
                  setGravidezData({
                    semanasText: "Perfil: Parceiro(a)",
                    dataParto: "N/A",
                  });
                }
              },
              { onlyOnce: true },
            );
          }
        });

        // 2. AQUI ESTÁ A CORREÇÃO! Escuta a subcoleção "gestacoes"
        const gestacoesRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "gestacoes",
        );
        const qGestacao = query(gestacoesRef, where("status", "==", "ativa"));

        const unsubGestacao = onSnapshot(qGestacao, (querySnapshot) => {
          if (!querySnapshot.empty) {
            // Pega os dados da primeira gestação ativa encontrada
            const gestacaoData = querySnapshot.docs[0].data();
            const dataGestacao = gestacaoData.dataUltimaMenstruacao;

            if (dataGestacao) {
              const partes = dataGestacao.split("/");
              if (partes.length === 3) {
                const dum = new Date(
                  Number(partes[2]),
                  Number(partes[1]) - 1,
                  Number(partes[0]),
                );
                dum.setHours(0, 0, 0, 0);

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const diffMs = hoje.getTime() - dum.getTime();
                const diffDiasTotal = Math.round(
                  diffMs / (1000 * 60 * 60 * 24),
                );
                const diasValidos = Math.max(0, diffDiasTotal);

                const semanasCalculadas = Math.floor(diasValidos / 7);
                const diasExtra = diasValidos % 7;

                const dataPrevista = new Date(
                  dum.getTime() + 280 * 24 * 60 * 60 * 1000,
                );

                setGravidezData({
                  semanasText: `${semanasCalculadas} semanas e ${diasExtra} dias`,
                  dataParto: dataPrevista.toLocaleDateString("pt-PT"),
                });
              }
            }
          } else if (userData.tipo !== "pai") {
            // Se a coleção estiver vazia ou não houver gestação ativa
            setGravidezData({
              semanasText: "Não configurado",
              dataParto: "...",
            });
          }
        });

        // Limpa as escutas ao sair
        return () => {
          unsubUser();
          unsubGestacao();
        };
      } else {
        setUserData({ nome: "Carregando...", email: "", tipo: "" });
        setGravidezData({ semanasText: "Não configurado", dataParto: "..." });
      }
    });

    return () => unsubscribeAuth();
  }, [userData.tipo]); // Adicionado userData.tipo como dependência para segurança

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.nome?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{userData.nome}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>Estado Atual</Text>

          <View style={styles.cardPurple}>
            <Text style={styles.cardSubtitle}>
              {userData.tipo === "gestante" ? "Tempo de Gestação" : "Status"}
            </Text>
            <Text style={styles.cardValue}>{gravidezData.semanasText}</Text>
          </View>

          {userData.tipo === "gestante" && (
            <View style={styles.cardPink}>
              <Text style={styles.cardSubtitle}>Previsão do Parto</Text>
              <Text style={styles.cardValue}>{gravidezData.dataParto}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Conta</Text>

          <EditarPerfil onUpdate={() => {}} />

          <Configuracoes />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color="#ff4d4d" />
            <Text style={[styles.menuItemText, { color: "#ff4d4d" }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 30,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: theme.colors.cards, fontSize: 24, fontWeight: "600" },
  headerTextContainer: { marginLeft: 15, flex: 1 },
  name: { color: "#fff", fontSize: theme.texts.title, fontWeight: "700" },
  email: {
    color: "rgba(255,255,255,0.8)",
    fontSize: theme.texts.text,
    marginTop: 2,
  },
  content: { paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  title: {
    fontSize: theme.texts.subtitle,
    color: "#333",
    marginBottom: 15,
    fontWeight: "bold",
  },
  cardPurple: {
    backgroundColor: theme.colors.cards,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardPink: {
    backgroundColor: theme.colors.cards,
    padding: 15,
    borderRadius: 12,
  },
  cardSubtitle: {
    fontSize: theme.texts.subtitle,
    color: "#333",
    marginBottom: 5,
  },
  cardValue: { fontSize: theme.texts.text, color: "#666", fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: theme.texts.subtitle,
    color: "#333",
  },
});
