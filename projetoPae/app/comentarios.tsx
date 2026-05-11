import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { ref, onValue, push } from "firebase/database";
import { db, auth } from "@/src/services/firebase";
import { useLocalSearchParams } from "expo-router";

export default function Comentarios() {
  const { postId } = useLocalSearchParams();

  const [comentarios, setComentarios] = useState<any[]>([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const refComentarios = ref(
      db,
      `comunidade/posts/${postId}/comentarios`
    );

    onValue(refComentarios, (snap) => {
      const data = snap.val();

      if (!data) return setComentarios([]);

      const lista = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));

      lista.sort((a, b) => a.createdAt - b.createdAt);

      setComentarios(lista);
    });
  }, []);

  const enviar = () => {
    if (!texto) return;

    const user = auth.currentUser;

    push(ref(db, `comunidade/posts/${postId}/comentarios`), {
      userId: user?.uid,
      nome: user?.email,
      texto,
      createdAt: Date.now()
    });

    setTexto("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comentario}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>{item.texto}</Text>
          </View>
        )}
      />

      <View style={styles.inputBox}>
        <TextInput
          placeholder="Escreva um comentário..."
          value={texto}
          onChangeText={setTexto}
          style={styles.input}
        />

        <TouchableOpacity onPress={enviar}>
          <Text style={{ color: "#a855f7" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  comentario: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  nome: { fontWeight: "bold" },

  inputBox: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee"
  },

  input: { flex: 1 }
});