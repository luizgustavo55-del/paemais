import '@expo/metro-runtime'
import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  Image,
  Animated
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from "react";

const { width } = Dimensions.get("window");

const DATA = [
  {
    id: "1",
    titulo: "Pãe+",
    descricao:
      "Aplicativo assistencial para mães e pais desde a gestação até os 3 anos de idade, de forma organizada, pratica e interativa",
  },
  {
    id: "2",
    titulo: "Dicas práticas",
    descricao:
      "Aprenda sobre saúde, leis, auxilios, organização de rotina com dicas interativas e de linguagem acessivel, sem perder a credibilidade.",
  },
  {
    id: "3",
    titulo: "Apoio completo",
    descricao:
      "Tenha acesso a conteúdos confiáveis, possiveis soluções e uma rede de apoio que abrange pais e profissionais de diversas áreas.",
  },
];

export default function IndhomeLAG() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [paginaAtual, setPaginaAtual] = useState(0);

  return (
    <View style={styles.container}>

      {/* 🧸 LOGO */}
      <Image
        source={require("../assets/images/logo.png")} // ajuste o caminho se necessário
        style={styles.logo}
      />

      {/* 📱 CARROSSEL */}
      <Animated.FlatList
        data={DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setPaginaAtual(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={[styles.content, { width }]}>
            <Text style={styles.titulo}>{item.titulo}</Text>

            <Text style={styles.descricao}>
              {item.descricao}
            </Text>
          </View>
        )}
      />

      {/* ⚪ BOLINHAS ANIMADAS */}
      <View style={styles.dotsContainer}>
        {DATA.map((_, i) => {
          const inputRange = [
            (i - 1) * width,
            i * width,
            (i + 1) * width,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.5, 1],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>

      {/* 🔘 BOTÃO */}
      {paginaAtual === DATA.length - 1 && (
        <Link href={'/login'} asChild>
          <TouchableOpacity style={styles.botaoContainer}>
            <LinearGradient
              colors={['#7050b3', '#b390d8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.botao}
            >
              <Text style={styles.textoBotao}>Continuar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece3ff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginTop: 40,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 20,
  },

  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7050b3'
  },

  descricao: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24
  },

  dotsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7050b3',
    margin: 6,
  },

  botaoContainer: {
    width: '90%',
    marginBottom: 30
  },

  botao: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },

  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});