import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { ref, push, get } from "firebase/database";
import { db, auth } from "@/src/services/firebase";
import { useRouter } from "expo-router";

export default function CriarPost() {
  const [texto, setTexto] = useState("");
  const router = useRouter();

  const publicar = async () => {
    const user = auth.currentUser;

    const snap = await get(ref(db, `usuarios/${user?.uid}`));
    const userData = snap.val();

    push(ref(db, "comunidade/posts"), {
      userId: user?.uid,
      nome: userData?.nome,
      tipo: userData?.tipo,
      texto,
      createdAt: Date.now()
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="O que você quer compartilhar?"
        multiline
        value={texto}
        onChangeText={setTexto}
        style={styles.input}
      />

      <TouchableOpacity style={styles.botao} onPress={publicar}>
        <Text style={{ color: "#fff" }}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    height: 120
  },

  botao: {
    backgroundColor: "#a855f7",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center"
  }
});