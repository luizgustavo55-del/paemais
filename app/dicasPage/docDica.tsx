import {
  Image,
  Linking,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function OrganizacaoPapeis() {
  const router = useRouter();

  const [checklist, setChecklist] = useState([
    { id: 1, text: "Separar todos os papéis", icon: "folder-outline", done: false },
    { id: 2, text: "Descartar o que não é necessário", icon: "trash-outline", done: false },
    { id: 3, text: "Criar categorias", icon: "albums-outline", done: false },
    { id: 4, text: "Organizar em pastas", icon: "pricetags-outline", done: false },
    { id: 5, text: "Guardar desenhos importantes", icon: "color-palette-outline", done: false },
    { id: 6, text: "Digitalizar documentos", icon: "phone-portrait-outline", done: false },
    { id: 7, text: "Definir rotina", icon: "repeat-outline", done: false },
  ]);

  function toggleItem(id: number) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(pai)/(tabs)/dicas" as any)}
        >
          <Ionicons name="arrow-back" size={24} color="#ba11f2" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Organização de Papéis</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* 📌 RESUMO */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Resumo</Text>
          </View>
          <Text style={styles.text}>
            Organizar documentos evita perda de informações importantes e reduz
            o estresse. O segredo não é ter poucos papéis, mas sim ter um sistema
            simples e eficiente.
          </Text>
        </View>

        {/* 🧠 IDEIA */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="bulb-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Ideia principal</Text>
          </View>
          <Text style={styles.text}>
            O problema não é a quantidade de papéis, mas a falta de organização.
            Criar um sistema simples facilita o dia a dia.
          </Text>
        </View>

        {/* 📂 CATEGORIAS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="folder-open-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Categorias</Text>
          </View>
          <Text style={styles.text}>
            Crianças: saúde, escola, documentos{"\n"}
            Geral: contas, garantias, manuais{"\n"}
            Exames e receitas{"\n"}
            Cada tipo deve ter seu lugar fixo
          </Text>
        </View>

        {/* 🎨 DESENHOS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="image-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Desenhos e lembranças</Text>
          </View>
          <Text style={styles.text}>
            Guarde apenas os mais especiais. Você pode organizar por ano ou até
            tirar fotos para economizar espaço.
          </Text>
        </View>

        {/* 🔁 ROTINA */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="refresh-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Rotina</Text>
          </View>
          <Text style={styles.text}>
            Tenha um local fixo para novos papéis e revise tudo mensalmente para
            evitar acúmulo.
          </Text>
        </View>

        {/* ✅ CHECKLIST */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="checkmark-done-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Checklist</Text>
          </View>

          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => toggleItem(item.id)}
            >
              <Ionicons
                name={item.done ? "checkbox" : "square-outline"}
                size={22}
                color={item.done ? "#4CAF50" : "#999"}
              />

              <Ionicons
                name={item.icon as any}
                size={18}
                color="#ba11f2"
              />

              <Text
                style={[
                  styles.checkText,
                  item.done && { textDecorationLine: "line-through" },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🎥 VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL("https://www.youtube.com/watch?v=rkSrz-jpkZo")
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/documentos.png")}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={16} color="#fff" />
              </View>
            </View>

            <View style={styles.info}>
              <View style={styles.row}>
                <Ionicons name="logo-youtube" size={18} color="red" />
                <Text style={styles.subtitle}>Vídeo</Text>
              </View>
              <Text style={styles.text}>
                Como organizar documentos e papéis
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌐 LINK */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://itmae.com.br/casa/tudo-organizado/como-organizar-a-papelada-das-criancas"
            )
          }
        >
          <View style={styles.row}>
            <Ionicons name="globe-outline" size={18} color="#ba11f2" />
            <Text style={styles.subtitle}>Ver mais</Text>
          </View>
          <Text style={styles.text}>
            Acesse o artigo completo sobre organização de papéis infantis
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b390d8,",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ba11f2",
  },

  scroll: {
    padding: 20,
  },

  card: {
    backgroundColor: "#ece3ff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ba11f2",
    elevation: 3,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ba11f2",
    marginLeft: 5,
  },

  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  checkText: {
    fontSize: 14,
    color: "#444",
  },

  youtubeCard: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
  },

  thumbnailContainer: {
    position: "relative",
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  playButton: {
    position: "absolute",
    top: "35%",
    left: "35%",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 50,
  },

  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
});