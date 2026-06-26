import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const colors = {
  background: "#ECE3FF",
  backgroundDeep: "#D9C8FF",
  primary: "#7050B3",
  primarySoft: "#8B64DE",
  primaryLight: "#c2a4f5",
  dark: "#28174C",
  muted: "#6F5A98",
  white: "#b499e9",
  border: "#c0a2f5",
};

const DATA = [
  {
    id: "1",
    titulo: "Pãe+",
    icone: "heart-outline" as const,
    descricao:
      "Acompanhe a gestação, a rotina da criança e os cuidados da família em um só lugar, de forma simples e organizada.",
  },
  {
    id: "2",
    titulo: "Dicas práticas",
    icone: "bulb-outline" as const,
    descricao:
      "Encontre conteúdos sobre saúde, direitos, auxílios e rotina familiar com linguagem clara, acessível e confiável.",
  },
  {
    id: "3",
    titulo: "Apoio completo",
    icone: "people-outline" as const,
    descricao:
      "Tenha acesso a orientações, lembretes, comunidade e ferramentas para apoiar pais, mães, gestantes e profissionais.",
  },
];

export default function IndhomeLAG() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const scrollX = useRef(new Animated.Value(0)).current;

  const [paginaAtual, setPaginaAtual] = useState(0);
  const [verificandoLogin, setVerificandoLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setVerificandoLogin(false);
          return;
        }

        const userRef = doc(firestore, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setVerificandoLogin(false);
          return;
        }

        const dados = userSnap.data();
        const tipo = dados.tipo;

        if (tipo === "pai") {
          router.replace("/(drawer)/(pais)/(tabs)/menu");
          return;
        }

        if (tipo === "gestante") {
          router.replace("/(drawer)/(gestantes)/(tabs)/gestacao");
          return;
        }

        setVerificandoLogin(false);
      } catch (error) {
        console.log("Erro ao verificar usuário logado:", error);
        setVerificandoLogin(false);
      }
    });

    return unsubscribe;
  }, [router]);

  if (verificandoLogin) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogoBox}>
          <Image
            source={require("../assets/images/logo3.png")}
            style={styles.logoLoading}
          />
        </View>

        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Preparando sua experiência...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={styles.topArea}>
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/images/logo3.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.appName}>Pãe+</Text>

        <Text style={styles.appSubtitle}>
          Cuidado, organização e apoio para sua família
        </Text>
      </View>

      <Animated.FlatList
        data={DATA}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setPaginaAtual(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icone} size={30} color={colors.primary} />
              </View>

              <Text style={styles.titulo}>{item.titulo}</Text>

              <Text style={styles.descricao}>{item.descricao}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomArea}>
        <View style={styles.dotsContainer}>
          {DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [9, 26, 9],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.botaoContainer,
            paginaAtual !== DATA.length - 1 && styles.botaoOculto,
          ]}
          onPress={() => router.replace("/login")}
          activeOpacity={0.86}
          disabled={paginaAtual !== DATA.length - 1}
        >
          <LinearGradient
            colors={[colors.primary, colors.primarySoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.botao}
          >
            <Text style={styles.textoBotao}>Começar</Text>

            <Ionicons name="arrow-forward" size={19} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingLogoBox: {
    width: 132,
    height: 132,
    borderRadius: 38,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    shadowColor: colors.dark,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  logoLoading: {
    width: 104,
    height: 104,
    resizeMode: "contain",
  },

  loadingText: {
    marginTop: 16,
    fontSize: theme.texts.text,
    color: colors.dark,
    fontWeight: "400",
  },

  container: {
    flex: 1,
    alignItems: "center",
  },

  topArea: {
    width: "100%",
    alignItems: "center",
    paddingTop: 58,
    paddingHorizontal: 24,
  },

  logoBox: {
    width: 128,
    height: 128,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.dark,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  logo: {
    width: 104,
    height: 104,
    resizeMode: "contain",
  },

  appName: {
    marginTop: 18,
    fontSize: 30,
    color: colors.dark,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  appSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    fontWeight: "400",
  },

  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.dark,
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "600",
    color: colors.dark,
    textAlign: "center",
    marginBottom: 12,
  },

  descricao: {
    fontSize: theme.texts.text,
    textAlign: "center",
    color: colors.muted,
    lineHeight: 25,
    fontWeight: "400",
  },

  bottomArea: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 36,
  },

  dotsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    height: 22,
    marginBottom: 22,
  },

  dot: {
    height: 9,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },

  botaoContainer: {
    width: "100%",
  },

  botaoOculto: {
    opacity: 0,
  },

  botao: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  textoBotao: {
    color: colors.white,
    fontSize: theme.texts.subtitle,
    fontWeight: "600",
  },
});