import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '../../../lib/supabase';

export default function CooperativaScraper() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const URL_COOPERATIVA = 'https://informe.rgeacvj.com/ServerSide/Agroindustrial/Comun/menu.php?id=A02828A6A72BA4269E243EA122A32BA427A1AA26A022A79E1C181898991A3EA122A3A9A7A1A4A79E98199C3EA422A1A7A7289E181C3E27A423A9A7A1A4A79E98989B1C99191899A3';

 const limpiarCategoria = (nombre: string) => {
  const n = nombre.toUpperCase().trim();

  // 1. Prioridad Máxima: Palabras completas
  if (n.includes("VERDES")) return "VERDES";
  if (n.includes("BASURA")) return "BASURA";
  if (n.includes("MAGNA")) return "MAGNA";
  if (n.includes("JUMBO")) return "JUMBO";
  if (n.includes("DOBLES")) return "DOBLES";
  if (n.includes("BLANDAS")) return "BLANDAS";
  
  // 2. Calibres exactos (Regex: ^ significa inicio, $ significa fin)
  // Esto asegura que "S" solo se detecte si es "S" y nada más.
  if (/^XL$/i.test(n)) return "XL";
  if (/^M$/i.test(n)) return "M";
  if (/^X$/i.test(n)) return "X";
  if (/^S$/i.test(n)) return "S";
  if (/^V$/i.test(n)) return "V";
  if (/^L$/i.test(n)) return "L";

  // 3. Fallback: Si nada coincide, devolvemos el original para que no pierdas información
  return n;
};

  const scriptEspia = `
    (function() {
      const tabla = document.querySelector('#tablaListadoDetalle table.tablaDatos') || document.querySelector('.tablaDatos');
      if (!tabla) { window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'no_encontrada' })); return; }
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
            fecha: fechaActual, albaran: albaranActual, parcela_codigo: parcelaActual,
            categoria_original: celdaCategoria.textContent.trim(), peso_neto: celdaPeso.textContent.trim(),
            porcentaje_alb: fila.querySelector('.gCajasEnt')?.textContent.trim() || "0",
            coste_manipulacion: fila.querySelectorAll('.gImporteEnt')[1]?.textContent.trim() || "0"
          });
        }
      });
      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'exito', datos: mapaLineas }));
    })();
  `;

  const guardarEnSupabase = async (lineasScrapeadas: any[]) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const lineasValidas = lineasScrapeadas.filter(l => 
        parseFloat(l.peso_neto.replace('.', '').replace(',', '.') || 0) > 0
      );
      const albaranes = Array.from(new Set(lineasValidas.map(l => l.albaran)));

      for (const numAlbaran of albaranes) {
        // 1. Obtener o crear cabecera
        const primera = lineasValidas.find(l => l.albaran === numAlbaran);
        const fechaForm = primera.fecha.split('/').reverse().join('-');
        
        const { data: cabecera, error: errCab } = await supabase
          .from('escandallos_cabecera')
          .upsert({ num_albaran: numAlbaran, fecha: fechaForm, user_id: user.id, parcela_codigo: primera.parcela_codigo }, { onConflict: 'num_albaran' })
          .select('id').single();

        if (errCab) throw errCab;

        // 2. BORRADO TOTAL DE LÍNEAS DE ESTE ALBARÁN
        await supabase.from('escandallos_lineas').delete().eq('escandallo_id', cabecera.id);

        // 3. INSERTAR LÍNEAS
        const filas = lineasValidas.filter(l => l.albaran === numAlbaran).map(l => ({
          escandallo_id: cabecera.id,
          categoria_original: l.categoria_original,
          categoria_limpia: limpiarCategoria(l.categoria_original),
          peso_neto: parseFloat(l.peso_neto.replace('.', '').replace(',', '.') || 0),
          porcentaje_alb: parseFloat(l.porcentaje_alb.replace('.', '').replace(',', '.') || 0),
          coste_manipulacion: parseFloat(l.coste_manipulacion.replace('.', '').replace(',', '.') || 0)
        }));

        await supabase.from('escandallos_lineas').insert(filas);
      }
      Alert.alert("Éxito", "Sincronizado correctamente.");
      router.back();
    } catch (e: any) { Alert.alert("Error", e.message); } 
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView ref={webViewRef} source={{ uri: URL_COOPERATIVA }} onMessage={(e) => guardarEnSupabase(JSON.parse(e.nativeEvent.data).datos)} style={{ flex: 1 }} javaScriptEnabled={true} />
      <TouchableOpacity style={[styles.captureButton, loading && { opacity: 0.6 }]} disabled={loading} onPress={() => webViewRef.current?.injectJavaScript(scriptEspia)}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.captureButtonText}>Sincronizar Todo</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  captureButton: { backgroundColor: '#15803d', padding: 20, alignItems: 'center' }, 
  captureButtonText: { color: 'white', fontWeight: 'bold' } 
});