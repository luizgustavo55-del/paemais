import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Recuperacao() {

    return (
        <View style={styles.container}>

            <Text style={styles.titulo}>Recuperar senha</Text>

            <Text style={styles.texto}>
                Digite seu email para receber um link de recuperação de senha.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Digite seu email"
            />

            <TouchableOpacity style={styles.botao}>
                <Text style={styles.textoBotao}>Enviar</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#ffeef5"
    },

    titulo: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#7b2cff"
    },

    texto: {
        textAlign: "center",
        marginBottom: 30,
        color: "#444"
    },

    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 20
    },

    botao: {
        backgroundColor: "#ff4db8",
        padding: 15,
        borderRadius: 10,
        alignItems: "center"
    },

    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    }

});