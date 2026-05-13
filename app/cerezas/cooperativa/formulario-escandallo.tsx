/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

// 1. Definimos una interfaz para que TS sepa qué hay dentro del objeto de calibres
interface DatosEscandallo {
  [key: string]: string; // Esto permite indexar el objeto con strings (como "kilos_28")
}

export default function FormularioEscandallo() {
  const router = useRouter();
  const { id, kilos } = useLocalSearchParams();

  const nombresCalibres = ['magna', '28', '26', '24', '22', 'segunda', 'verde', 'doble', 'basura'];

  // 2. Aplicamos la interfaz al useState
  const [datos, setDatos] = useState<DatosEscandallo>(
    nombresCalibres.reduce((acc, name) => ({
      ...acc,
      [`kilos_${name}`]: '',
      [`precio_${name}`]: ''
    }), {} as DatosEscandallo)
  );

  const [costeClasificacion, setCosteClasificacion] = useState<string>('0');

  const calcularTotal = (): number => {
    let total = 0;
    nombresCalibres.forEach(c => {
      const k = parseFloat(datos[`kilos_${c}`]) || 0;
      const p = parseFloat(datos[`precio_${c}`]) || 0;
      total += (k * p);
    });
    return total - (parseFloat(costeClasificacion) || 0);
  };

  // 3. Tipamos los parámetros de la función (name: string, value: string)
  const handleInputChange = (name: string, value: string) => {
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const guardarEscandallo = async () => {
    try {
      const precioTotal = calcularTotal();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: errorEscandallo } = await supabase.from('escandallos').insert([{
        user_id: user?.id, // <--- VINCULACIÓN
        entrega_id: id,
        ...Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, parseFloat(v) || 0])),
        coste_clasificacion: parseFloat(costeClasificacion) || 0,
        precio_total_ganado: precioTotal
      }]);

      if (errorEscandallo) throw errorEscandallo;

      const { error: errorEntrega } = await supabase
        .from('entregas_cerezas')
        .update({ escandallo_completado: true })
        .eq('id', id);

      if (errorEntrega) throw errorEntrega;

      Alert.alert('¡Éxito!', `Escandallo guardado. Total: ${precioTotal.toFixed(2)}€`);
      router.replace('/cerezas/cooperativa/escandallos');
    } catch (error: any) { // 4. Tipamos el error como 'any' para poder acceder a .message
      Alert.alert('Error', error.message || 'Ocurrió un error inesperado');
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Detalle del Ticket</Text>
      <Text style={styles.info}>Entrega original: {kilos} kg netos</Text>

      <View style={styles.row}>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Calibre</Text>
        <Text style={[styles.cell, styles.headerCell]}>Kilos</Text>
        <Text style={[styles.cell, styles.headerCell]}>Precio/kg</Text>
      </View>

      {nombresCalibres.map((nombre) => (
        <View key={nombre} style={styles.row}>
          <Text style={[styles.cell, styles.labelCell]}>{nombre.toUpperCase()}</Text>
          <TextInput
            style={styles.cellInput}
            keyboardType="decimal-pad"
            placeholder="0"
            onChangeText={(v) => handleInputChange(`kilos_${nombre}`, v)}
          />
          <TextInput
            style={styles.cellInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            onChangeText={(v) => handleInputChange(`precio_${nombre}`, v)}
          />
        </View>
      ))}

      <View style={styles.footer}>
        <View style={styles.costeRow}>
          <Text style={styles.label}>Coste Clasificación (€):</Text>
          <TextInput
            style={styles.costeInput}
            keyboardType="decimal-pad"
            value={costeClasificacion}
            onChangeText={setCosteClasificacion}
          />
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL ESTIMADO:</Text>
          <Text style={styles.totalAmount}>{calcularTotal().toFixed(2)} €</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btnGuardar} onPress={guardarEscandallo}>
        <Text style={styles.btnTexto}>FINALIZAR ESCANDALLO</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  info: { fontSize: 14, color: '#666', marginBottom: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  cell: { padding: 10, textAlign: 'center' },
  headerCell: { fontWeight: 'bold', backgroundColor: '#f8f9fa', flex: 1 },
  labelCell: { flex: 1.5, fontWeight: 'bold', textAlign: 'left', color: '#555' },
  cellInput: { flex: 1, padding: 8, borderLeftWidth: 1, borderLeftColor: '#eee', textAlign: 'center', fontSize: 16 },
  footer: { marginTop: 25, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10 },
  costeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costeInput: { borderBottomWidth: 1, width: 80, textAlign: 'right', fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 16, color: '#444' },
  totalBox: { marginTop: 20, borderTopWidth: 2, borderTopColor: '#d32f2f', paddingTop: 10, alignItems: 'flex-end' },
  totalLabel: { fontSize: 14, color: '#d32f2f', fontWeight: 'bold' },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#1B5E20' },
  btnGuardar: { backgroundColor: '#1B5E20', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});