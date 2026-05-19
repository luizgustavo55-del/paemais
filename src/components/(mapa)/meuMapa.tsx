import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

const estiloApenasSaude = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
];

const estiloSaudeEComercios = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", stylers: [{ visibility: "on" }] },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function calcularDistanciaEmMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MeuMapa() {
  const [localizacao, setLocalizacao] = useState<Region | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [postosDeSaude, setPostosDeSaude] = useState<any[]>([]);

  const [estiloAtual, setEstiloAtual] = useState(estiloApenasSaude);
  const [mostrarComercios, setMostrarComercios] = useState(false);

  const [raioSelecionado, setRaioSelecionado] = useState<number>(500);
  const [hospitaisEncontrados, setHospitaisEncontrados] = useState<any[]>([]);

  const [carregando, setCarregando] = useState<boolean>(false);
  const [buscaRealizada, setBuscaRealizada] = useState<boolean>(false);

  const radarPulseValue = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const animatedRadius = radarPulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, raioSelecionado],
  });

  const animatedFillColor = radarPulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(183, 110, 231, 0.45)", "rgba(183, 110, 231, 0)"],
  });

  const animatedStrokeColor = radarPulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(183, 110, 231, 0.9)", "rgba(183, 110, 231, 0)"],
  });

  async function baixarDadosDoGitHub() {
    const urlGitHub =
      "https://raw.githubusercontent.com/Ander-sonx/locais/refs/heads/main/locais.json";
    try {
      const resposta = await fetch(urlGitHub);
      if (resposta.ok) {
        const dados = await resposta.json();
        const dadosTratados = dados.map((item: any) => {
          const latCrua =
            item.Latitude !== undefined ? item.Latitude : item.latitude;
          const lonCrua =
            item.longitude !== undefined ? item.longitude : item.Longitude;

          return {
            id: String(item.id),
            nome: item.nome,
            latitude: Math.abs(latCrua) > 90 ? latCrua / 10000000 : latCrua,
            longitude: Math.abs(lonCrua) > 180 ? lonCrua / 10000000 : lonCrua,
          };
        });
        setPostosDeSaude(dadosTratados);
      }
    } catch (erro) {
      console.warn("Erro ao buscar dados:", erro);
    }
  }

  async function buscarLocalizacao() {
    setBuscaRealizada(false);
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setMensagemErro("Permissão de localização negada!");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const novaRegiao = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    };

    setLocalizacao(novaRegiao);

    if (mapRef.current) {
      mapRef.current.animateToRegion(novaRegiao, 1000);
    }
  }

  function alternarFiltroComercios() {
    if (mostrarComercios) {
      setEstiloAtual(estiloApenasSaude);
      setMostrarComercios(false);
    } else {
      setEstiloAtual(estiloSaudeEComercios);
      setMostrarComercios(true);
    }
  }

  function ajustarRaio(modo: "aumentar" | "diminuir") {
    setRaioSelecionado((prev) => {
      if (modo === "aumentar") {
        return prev >= 2000 ? 2000 : prev + 100;
      } else {
        return prev <= 100 ? 100 : prev - 100;
      }
    });
  }

  async function buscarHospitaisNoRaio() {
    if (!localizacao) return;

    if (postosDeSaude.length === 0) {
      Alert.alert("Aviso", "Aguarde os dados serem carregados do servidor.");
      return;
    }

    setCarregando(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const resultados = postosDeSaude.filter((posto) => {
      const distancia = calcularDistanciaEmMetros(
        localizacao.latitude,
        localizacao.longitude,
        posto.latitude,
        posto.longitude,
      );
      return distancia <= raioSelecionado;
    });

    if (resultados.length > 0) {
      setHospitaisEncontrados(resultados);
    } else {
      Alert.alert("Aviso", "Não há postos cadastrados dentro deste raio.");
      setHospitaisEncontrados([]);
    }

    setBuscaRealizada(true);
    setCarregando(false);
  }

  async function buscarOpostoMaisPerto() {
    if (!localizacao) return;

    if (postosDeSaude.length === 0) {
      Alert.alert("Aviso", "Aguarde os dados serem carregados.");
      return;
    }

    setCarregando(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const postosComDistancia = postosDeSaude.map((posto) => {
      const distancia = calcularDistanciaEmMetros(
        localizacao.latitude,
        localizacao.longitude,
        posto.latitude,
        posto.longitude,
      );

      return { ...posto, distancia };
    });

    postosComDistancia.sort((a, b) => a.distancia - b.distancia);

    const oMaisPerto = postosComDistancia[0];

    setHospitaisEncontrados([oMaisPerto]);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: oMaisPerto.latitude,
          longitude: oMaisPerto.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000,
      );
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscarLocalizacao();
    baixarDadosDoGitHub();
  }, []);

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    if (carregando) {
      radarPulseValue.setValue(0);
      loop = Animated.loop(
        Animated.timing(radarPulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      );
      loop.start();
    } else {
      radarPulseValue.stopAnimation();
    }
    return () => loop?.stop();
  }, [carregando, radarPulseValue]);

  if (!localizacao) {
    return (
      <View style={styles.centralizado}>
        {mensagemErro ? (
          <Text>{mensagemErro}</Text>
        ) : (
          <ActivityIndicator size="large" color="#b76ee7" />
        )}
      </View>
    );
  }

  const botaoMaisPertoTravado = carregando || !buscaRealizada;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        initialRegion={localizacao}
        showsUserLocation={true}
        showsMyLocationButton={false}
        customMapStyle={estiloAtual}
      >
        {carregando && (
          <AnimatedCircle
            center={localizacao}
            radius={animatedRadius}
            fillColor={animatedFillColor}
            strokeColor={animatedStrokeColor}
            strokeWidth={1.5}
          />
        )}

        {hospitaisEncontrados.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.nome}
            pinColor="red"
          />
        ))}
      </MapView>

      <View style={styles.seletorRaioContainer}>
        <TouchableOpacity
          style={styles.botaoAjuste}
          onPress={() => ajustarRaio("diminuir")}
        >
          <Text style={styles.textoBotaoAjuste}>-</Text>
        </TouchableOpacity>

        <View style={styles.infoRaio}>
          <Text style={styles.textoInfoRaio}>Raio de Busca</Text>
          <Text style={styles.distanciaTexto}>
            {raioSelecionado >= 1000
              ? `${raioSelecionado / 1000} km`
              : `${raioSelecionado} m`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoAjuste}
          onPress={() => ajustarRaio("aumentar")}
        >
          <Text style={styles.textoBotaoAjuste}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerBotoes}>
        <TouchableOpacity
          style={[
            styles.botao,
            { backgroundColor: mostrarComercios ? "#b76ee7" : "#fff" },
          ]}
          onPress={alternarFiltroComercios}
        >
          <MaterialIcons
            name="storefront"
            size={26}
            color={mostrarComercios ? "#fff" : "#b76ee7"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoRaio, carregando && styles.botaoDesativado]}
          onPress={buscarHospitaisNoRaio}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={24}
              color="#b76ee7"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botao,
            botaoMaisPertoTravado && styles.botaoDesativado,
          ]}
          onPress={buscarOpostoMaisPerto}
          disabled={botaoMaisPertoTravado}
        >
          <MaterialIcons
            name="near-me"
            size={26}
            color={botaoMaisPertoTravado ? "#fff" : "#b76ee7"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesativado]}
          onPress={buscarLocalizacao}
          disabled={carregando}
        >
          <MaterialIcons
            name="my-location"
            size={26}
            color={carregando ? "#fff" : "#b76ee7"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapa: { width: "100%", height: "100%" },
  centralizado: { flex: 1, justifyContent: "center", alignItems: "center" },
  seletorRaioContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    height: 65,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  botaoAjuste: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotaoAjuste: { fontSize: 24, color: "#b76ee7", fontWeight: "bold" },
  infoRaio: { alignItems: "center" },
  textoInfoRaio: { fontSize: 12, color: "#666" },
  distanciaTexto: { fontSize: 18, fontWeight: "bold", color: "#333" },
  containerBotoes: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "flex-end",
    gap: 12,
  },
  botao: {
    height: 50,
    width: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  botaoRaio: {
    flexDirection: "row",
    height: 50,
    width: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  botaoDesativado: { backgroundColor: "#a182b3" },
  textoBotaoRaio: { color: "#fff", fontWeight: "bold" },
});
