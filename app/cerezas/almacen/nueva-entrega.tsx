/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase'; // Asegúrate de que esta ruta a tu cliente de supabase sea correcta

export default function NuevaEntrega() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [asentadores, setAsentadores] = useState<any[]>([]);
  
  const [nombreMiembro, setNombreMiembro] = useState('');
  const [selectedAsentadorId, setSelectedAsentadorId] = useState('');
  const [variedad, setVariedad] = useState('');
  const [cajones, setCajones] = useState('');

  useEffect(() => {
    cargarAsentadores();
  }, []);

  async function cargarAsentadores() {
    const { data } = await supabase.from('asentadores').select('*');
    if (data) {
      setAsentadores(data);
      if (data.length > 0) setSelectedAsentadorId(data[0].id);
    }
  }

  async function guardarEntrega() {
    if (!nombreMiembro || !selectedAsentadorId || !cajones) {
      Alert.alert("Error", "Rellena los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Obtenemos el usuario directamente de Supabase en vez de usar useAuth
      const { data: { user } } = await supabase.auth.getUser();

      const { data: asentador, error: errAsentador } = await supabase
        .from('asentadores')
        .select('*')
        .eq('id', selectedAsentadorId)
        .single();

      if (errAsentador) throw errAsentador;
      
      const { error } = await supabase.from('entregas_almacen').insert({
        user_id: user?.id, // ID del usuario actual
        miembro_familia: nombreMiembro,
        asentador_id: selectedAsentadorId,
        variedad: variedad,
        cajones_entregados: parseInt(cajones),
        kilos_netos: parseInt(cajones) * 2,
        fecha: new Date().toISOString().split('T')[0],
        precio_venta_bruto: 0, // <--- Aseguramos que se guarde como 0
        comision_aplicada: asentador.comision_pct,
        iva_aplicado: asentador.iva_pct,
        porte_aplicado: asentador.porte_fijo,
        cajon_aplicado: asentador.cajon_fijo,
        irpf_aplicado: asentador.irpf_pct,
        tipo_calculo_aplicado: asentador.tipo_calculo
      });

      if (error) throw error;

      Alert.alert("Éxito", "Entrega registrada");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva Entrega 🍏</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre del Familiar</Text>
        <TextInput style={styles.input} value={nombreMiembro} onChangeText={setNombreMiembro} placeholder="Ej: Rafael" />

        <Text style={styles.label}>Asentador</Text>
        <Picker selectedValue={selectedAsentadorId} onValueChange={(v) => setSelectedAsentadorId(v)}>
          {asentadores.map(a => <Picker.Item key={a.id} label={a.nombre} value={a.id} />)}
        </Picker>

        <Text style={styles.label}>Variedad</Text>
        <TextInput style={styles.input} value={variedad} onChangeText={setVariedad} />

        <Text style={styles.label}>Cajones</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={cajones} onChangeText={setCajones} />

        <TouchableOpacity style={styles.button} onPress={guardarEntrega} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>GUARDAR</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B5E20', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 4 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 8 },
  button: { backgroundColor: '#1B5E20', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});