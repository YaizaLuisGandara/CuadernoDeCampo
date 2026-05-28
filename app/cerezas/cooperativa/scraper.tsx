/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 */
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { supabase } from '../../../lib/supabase';

export default function CooperativaScraper() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const URL_COOPERATIVA = 'https://informe.rgeacvj.com/ServerSide/Agroindustrial/Comun/menu.php?id=A02828A6A72BA4269E243EA122A32BA427A1AA26A022A79E1C181898991A3EA122A3A9A7A1A4A79E98199C3EA422A1A7A7289E181C3E27A423A9A7A1A4A79E98989B1C99191899A3';

  // Función para normalizar nombres largos a etiquetas cortas
  const limpiarCategoria = (nombre: string) => {
  const n = nombre.toUpperCase();

  // 1. PRIMERO comprobamos los nombres completos y específicos
  if (n.includes("BASURA")) return "BASURA";
  if (n.includes("VERDES")) return "VERDES";
  if (n.includes("MAGNA")) return "MAGNA";
  if (n.includes("JUMBO")) return "JUMBO";
  if (n.includes("DOBLES")) return "DOBLES";
  if (n.includes("BLANDAS")) return "BLANDAS";
  
  // 2. DESPUÉS comprobamos los calibres de una sola letra
  // Para evitar que "S" atrape a otros, buscamos que sea exactamente esa letra 
  // o que no tenga otras letras conflictivas alrededor.
  if (n.includes(" XL ")) return "XL";
  if (n.includes(" M ")) return "M";
  if (n.includes(" X ")) return "X";
  if (n.includes(" S ")) return "S";

  return "OTROS"; 
};

  const scriptEspia = `
    (function() {
      try {
        const tabla = document.querySelector('#tablaListadoDetalle table.tablaDatos') || document.querySelector('.tablaDatos');
        if (!tabla) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'no_encontrada' }));
          return;
        }
        const filas = tabla.querySelectorAll('tr');
        let albaranActual = "", fechaActual = "", parcelaActual = "";
        let mapaLineas = [];

        filas.forEach(fila => {
          if (fila.querySelector('th')) return;
          
          const celdaFecha = fila.querySelector('.gFechaEnt');
          const celdaAlbaran = fila.querySelector('.gAlbaranEnt');
          const celdaParcela = fila.querySelector('.gParcelaEnt');
          const celdaCategoria = fila.querySelector('.gDescArtEnt');
          const celdaPeso = fila.querySelector('.gPesoEnt');

          if (celdaFecha?.textContent.trim()) fechaActual = celdaFecha.textContent.trim();
          if (celdaAlbaran?.textContent.trim()) albaranActual = celdaAlbaran.textContent.trim();
          if (celdaParcela?.textContent.trim()) parcelaActual = celdaParcela.textContent.trim();

          if (celdaCategoria && celdaPeso) {
            mapaLineas.push({
              fecha: fechaActual,
              albaran: albaranActual,
              parcela_codigo: parcelaActual,
              categoria_original: celdaCategoria.textContent.trim(),
              peso_neto: celdaPeso.textContent.trim(),
              porcentaje_alb: fila.querySelector('.gCajasEnt')?.textContent.trim() || "0",
              coste_manipulacion: fila.querySelectorAll('.gImporteEnt')[1]?.textContent.trim() || "0"
            });
          }
        });
        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'exito', datos: mapaLineas }));
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'error_js', error: err.message }));
      }
    })();
  `;

  const guardarEnSupabase = async (lineasScrapeadas: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const albaranes = Array.from(new Set(lineasScrapeadas.map(l => l.albaran)));

      for (const numAlbaran of albaranes) {
        const lineas = lineasScrapeadas.filter(l => l.albaran === numAlbaran);
        const primera = lineas[0];
        const fecha = primera.fecha.split('/').reverse().join('-');

        const { data: cabecera } = await supabase.from('escandallos_cabecera')
          .upsert({ num_albaran: numAlbaran, fecha, user_id: user.id, parcela_codigo: primera.parcela_codigo }, { onConflict: 'num_albaran' })
          .select().single();

        await supabase.from('escandallos_lineas').delete().eq('escandallo_id', cabecera.id);

        const filas = lineas.map(l => ({
          escandallo_id: cabecera.id,
          categoria_original: l.categoria_original,
          categoria_limpia: limpiarCategoria(l.categoria_original),
          peso_neto: parseFloat(l.peso_neto.replace('.', '').replace(',', '.') || 0),
          porcentaje_alb: parseFloat(l.porcentaje_alb.replace('.', '').replace(',', '.') || 0),
          coste_manipulacion: parseFloat(l.coste_manipulacion.replace('.', '').replace(',', '.') || 0)
        }));

        await supabase.from('escandallos_lineas').insert(filas);
      }
      Alert.alert("Éxito", "Sincronización total completada.");
      router.back();
    } catch (e: any) { Alert.alert("Error", e.message); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView ref={webViewRef} source={{ uri: URL_COOPERATIVA }} onMessage={(e) => guardarEnSupabase(JSON.parse(e.nativeEvent.data).datos)} style={{ flex: 1 }} javaScriptEnabled={true} />
      <TouchableOpacity style={styles.captureButton} onPress={() => webViewRef.current?.injectJavaScript(scriptEspia)}>
        <Text style={styles.captureButtonText}>Sincronizar Todo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, captureButton: { backgroundColor: '#15803d', padding: 20, alignItems: 'center' }, captureButtonText: { color: 'white', fontWeight: 'bold' } });