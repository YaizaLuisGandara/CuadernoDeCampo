import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EntregaKilos() {
  const router = useRouter();

  // Estados
  const [fincas, setFincas] = useState<any[]>([]);
  const [fincaSel, setFincaSel] = useState<any>(null);
  const [kilos, setKilos] = useState('');
  const [momento, setMomento] = useState('mañana');
  const [variedad, setVariedad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoFincas, setCargandoFincas] = useState(true);

  // CARGAR FINCAS AL INICIAR
  useEffect(() => {
    fetchFincas();
  }, []);

  const fetchFincas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('fincas')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre');
      
      if (error) throw error;
      setFincas(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se cargaron las fincas: ' + error.message);
    } finally {
      setCargandoFincas(false);
    }
  };

  const guardarEntrega = async () => {
    if (!fincaSel || !kilos || parseFloat(kilos) <= 0) {
      Alert.alert('Atención', 'Debes elegir una finca y poner los kilos');
      return;
    }

    setCargando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión expirada");

      const { error } = await supabase.from('entregas_cerezas').insert([
        {
          finca_id: fincaSel.id,
          user_id: user.id,
          kilos_netos: parseFloat(kilos.replace(',', '.')),
          momento_dia: momento,
          variedad_cereza: variedad,
          observaciones: observaciones,
          fecha: new Date().toISOString().split('T')[0]
        }
      ]);

      if (error) throw error;

      Alert.alert('¡Registrado!', `Has guardado ${kilos} kg de la finca ${fincaSel.nombre}`);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Pesada Diaria ⚖️</Text>

      <Text style={styles.label}>¿De qué finca vienen?</Text>
      {cargandoFincas ? (
        <ActivityIndicator color="#D32F2F" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fincaList}>
          {fincas.length === 0 && <Text style={{color: '#999'}}>No se encontraron fincas</Text>}
          {fincas.map(f => (
            <TouchableOpacity 
              key={f.id} 
              style={[styles.fincaCard, fincaSel?.id === f.id && styles.fincaCardActive]}
              onPress={() => setFincaSel(f)}
            >
              <MaterialCommunityIcons 
                name="map-marker" 
                size={24} 
                color={fincaSel?.id === f.id ? '#D32F2F' : '#ccc'} 
              />
              <Text style={[styles.fincaName, fincaSel?.id === f.id && styles.fincaTextActive]}>
                {f.nombre}
              </Text>
              <Text style={styles.fincaUtch}>{f.localidad || '---'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.kilosContainer}>
        <Text style={styles.labelKilos}>Kilos Netos</Text>
        <TextInput
          style={styles.inputKilos}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={kilos}
          onChangeText={setKilos}
        />
      </View>

      <Text style={styles.label}>Momento del día</Text>
      <View style={styles.row}>
        {['mañana', 'tarde'].map(m => (
          <TouchableOpacity 
            key={m} 
            style={[styles.selector, momento === m && styles.selectorActive]}
            onPress={() => setMomento(m)}
          >
            <Text style={[styles.selectorText, momento === m && styles.selectorTextActive]}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Variedad (Opcional)</Text>
      <TextInput 
        style={styles.inputSimple} 
        placeholder="Ej: Lapins, Picota..." 
        value={variedad}
        onChangeText={setVariedad}
      />

      <TouchableOpacity 
        style={[styles.btnGuardar, cargando && { opacity: 0.6 }]} 
        onPress={guardarEntrega}
        disabled={cargando}
      >
        <Text style={styles.btnTexto}>{cargando ? 'GUARDANDO...' : 'REGISTRAR ENTREGA'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd', padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#D32F2F', marginBottom: 20, marginTop: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#444', marginBottom: 10, marginTop: 15 },
  fincaList: { flexDirection: 'row', paddingVertical: 10 },
  fincaCard: { 
    padding: 15, backgroundColor: '#fff', borderRadius: 15, 
    borderWidth: 2, borderColor: '#eee', marginRight: 12, minWidth: 130, alignItems: 'center' 
  },
  fincaCardActive: { borderColor: '#D32F2F', backgroundColor: '#FFF5F5' },
  fincaName: { fontWeight: 'bold', fontSize: 15, marginTop: 5 },
  fincaTextActive: { color: '#D32F2F' },
  fincaUtch: { fontSize: 11, color: '#999', marginTop: 2 },
  kilosContainer: { alignItems: 'center', marginVertical: 20, backgroundColor: '#f8f9fa', padding: 20, borderRadius: 20 },
  labelKilos: { fontSize: 18, color: '#666', marginBottom: 5 },
  inputKilos: { fontSize: 50, fontWeight: 'bold', color: '#333', textAlign: 'center', width: '100%' },
  row: { flexDirection: 'row', gap: 10 },
  selector: { flex: 1, padding: 15, backgroundColor: '#eee', borderRadius: 12, alignItems: 'center' },
  selectorActive: { backgroundColor: '#D32F2F' },
  selectorText: { fontWeight: 'bold', color: '#666' },
  selectorTextActive: { color: '#fff' },
  inputSimple: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, fontSize: 16 },
  btnGuardar: { backgroundColor: '#2e7d32', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnTexto: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});