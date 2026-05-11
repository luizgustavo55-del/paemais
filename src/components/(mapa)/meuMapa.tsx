import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
 
 const hospital = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "on" }]
  }
];

export default function MeuMapa() {

  const [localizacao, setLocalizacao] = useState<Region | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    async function buscarLocalizacao() {
    
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setMensagemErro('Permissão de localização negada!');
        return;
      }


      let location = await Location.getCurrentPositionAsync({});
      
  
      setLocalizacao({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    buscarLocalizacao();
  }, []);

  
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

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.mapa} 
        region={localizacao} 
        showsUserLocation={true} 
        showsMyLocationButton={true} 
        customMapStyle={hospital}
      >
       {/* <Marker 
          coordinate={{ latitude: -3.1019, longitude: -60.0250 }} 
          title="Maternidade Moura Tapajóz"
          description="Atendimento 24h"
          pinColor="#b76ee7" // Pode mudar a cor do pino para combinar com o app!
        /> */}
      </MapView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  mapa: { 
    width: '100%', 
    height: '100%' 
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
