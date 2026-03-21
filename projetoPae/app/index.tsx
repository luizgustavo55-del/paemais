import '@expo/metro-runtime'
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function IndhomeLAG() {
    return (
      
        <View style={styles.container}>

            <View style={styles.content}>
                <Text style={styles.titulo}>  Pãe+</Text>

                <Text style={styles.descricao}>
                    Pãe+ é um aplicativo inteligente com o intuito de sanar diferentes dúvidas,
                    elucidar situações e mostrar soluções para diversos problemas daqueles pais
                    com pouca ou nenhuma experiência, buscando fontes confiáveis, informações
                    pertinentes e auxílio profissional, com foco em ajudar pais de forma segura
                    e prática.
                </Text>
            </View>

            <Link href={'/login'} asChild>
                <TouchableOpacity style={styles.botaoContainer}>
                    <LinearGradient
                        colors={['#ff4db8', '#7b2cff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.botao}
                    >
                        <Text style={styles.textoBotao}>Continuar</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Link>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff'
    },

    content: {
        marginTop: 120,
        alignItems: 'center',
        gap: 30
    },

    titulo: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#7b2cff'
    },

    descricao: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
        lineHeight: 24
    },

    botaoContainer: {
        width: '100%',
        marginBottom: 40
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