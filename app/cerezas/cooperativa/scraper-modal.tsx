import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export default function ScraperModal() {
  const webViewRef = useRef<WebView>(null);

  // URL de la cooperativa (sustitúyela por la dirección real de la web de escandallos)
  const URL_COOPERATIVA = 'https://informe.rgeacvj.com/ServerSide/Agroindustrial/Comun/menu.php?id=A02828A6A72BA4269E243EA122A32BA427A1AA26A022A79E1C181898991A3EA122A3A9A7A1A4A79E98199C3EA422A1A7A7289E181C3E27A423A9A7A1A4A79E98989B1C99191899A3';

  // 1. Aquí capturamos lo que el script espía nos envíe desde la web
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const datosRecibidos = JSON.parse(event.nativeEvent.data);
      console.log("¡Datos cazados desde el WebView!", datosRecibidos);
      
      // Aquí es donde en el siguiente paso llamaremos a Supabase para guardarlos
    } catch (error) {
      console.error("Error al procesar el mensaje de la web:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera de la app para poder cerrar o ver el estado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sincronizar Escandallos</Text>
      </View>

      {/* El navegador integrado */}
      <WebView
        ref={webViewRef}
        source={{ uri: URL_COOPERATIVA }}
        onMessage={handleMessage} // El puente que escucha a la web
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});