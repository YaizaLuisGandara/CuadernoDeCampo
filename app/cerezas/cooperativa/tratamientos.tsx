import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

export default function RegistroTratamiento() {
  const router = useRouter();

  // Estados para el formulario
  const [fincas, setFincas] = useState<any[]>([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState<any>(null);
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [momentoDia, setMomentoDia] = useState('mañana');
  const [cultivo, setCultivo] = useState('cerezas');
  const [variedad, setVariedad] = useState('');
  const [producto, setProducto] = useState('');
  const [litros, setLitros] = useState('');
  const [operario, setOperario] = useState('');
  const [maquinaria, setMaquinaria] = useState('MQF/01 Pulverizados >100L'); // Valor por defecto
  const [cargandoFincas, setCargandoFincas] = useState(true);

  // EFECTO PARA CARGAR DATOS AL INICIAR
  useEffect(() => {
    cargarFincas();
  }, []);

  const cargarFincas = async () => {
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
      Alert.alert('Error', 'No se pudieron cargar las fincas: ' + error.message);
    } finally {
      setCargandoFincas(false);
    }
  };

  const guardarTratamiento = async () => {
    if (!fincaSeleccionada || !producto || !operario) {
      Alert.alert('Faltan datos', 'Por favor selecciona una finca y rellena producto y operario');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('tratamientos').insert([{
        user_id: user?.id,
        fecha: fecha.toISOString().split('T')[0],
        momento_dia: momentoDia,
        cultivo: cultivo,
        finca_id: fincaSeleccionada.id,
        variedad_tratada: variedad,
        litros_aprox: litros ? parseFloat(litros.replace(',', '.')) : 0,
        operario_nombre: operario,
        maquinaria: maquinaria // Se guarda la opción elegida
      }]);

      if (error) throw error;

      Alert.alert('¡Éxito!', 'Tratamiento registrado correctamente');
      router.back();
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nuevo Tratamiento 💊</Text>

      {/* Fecha */}
      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{fecha.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFecha(selectedDate);
          }}
        />
      )}

      {/* Momento del día */}
      <Text style={styles.label}>Momento del día</Text>
      <View style={styles.row}>
        {['mañana', 'tarde'].map(m => (
          <TouchableOpacity key={m} 
            style={[styles.chip, momentoDia === m && styles.chipActive]} 
            onPress={() => setMomentoDia(m)}>
            <Text style={momentoDia === m ? styles.textActive : {}}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selección de Finca */}
      <Text style={styles.label}>Seleccionar Finca</Text>
      {cargandoFincas ? (
        <ActivityIndicator color="#1976D2" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fincaScroll}>
          {fincas.length === 0 && <Text style={{color: '#999'}}>No tienes fincas registradas</Text>}
          {fincas.map(f => (
            <TouchableOpacity 
              key={f.id} 
              style={[styles.fincaCard, fincaSeleccionada?.id === f.id && styles.fincaCardActive]}
              onPress={() => setFincaSeleccionada(f)}
            >
              <Text style={[styles.fincaName, fincaSeleccionada?.id === f.id && {color: '#1976D2'}]}>{f.nombre}</Text>
              <Text style={styles.fincaUtch}>{f.localidad || 'Sin localidad'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Datos */}
      <Text style={styles.label}>Producto Fitosanitario</Text>
      <TextInput style={styles.input} placeholder="Nombre del producto" value={producto} onChangeText={setProducto} />

      <View style={styles.row}>
        <View style={{flex: 1}}>
          <Text style={styles.label}>Litros</Text>
          <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={litros} onChangeText={setLitros} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.label}>Variedad</Text>
          <TextInput style={styles.input} placeholder="Lapins..." value={variedad} onChangeText={setVariedad} />
        </View>
      </View>

      <Text style={styles.label}>Operario</Text>
      <TextInput style={styles.input} placeholder="Nombre del aplicador" value={operario} onChangeText={setOperario} />

      {/* MAQUINARIA (Restablecida) */}
      <Text style={styles.label}>Maquinaria utilizada</Text>
      {['MQF/01 Pulverizados >100L', 'MQF/02 Mochila Suelo'].map(mq => (
        <TouchableOpacity key={mq} 
          style={[styles.radio, maquinaria === mq && styles.radioActive]} 
          onPress={() => setMaquinaria(mq)}>
          <Text style={[styles.radioText, maquinaria === mq && styles.textActive]}>{mq}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btnGuardar} onPress={guardarTratamiento}>
        <Text style={styles.btnTexto}>GUARDAR TRATAMIENTO</Text>
      </TouchableOpacity>
      
      <View style={{ height: 50 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfdfd' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1976D2', marginTop: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  chip: { flex: 1, padding: 12, backgroundColor: '#eee', borderRadius: 10, alignItems: 'center' },
  chipActive: { backgroundColor: '#1976D2' },
  textActive: { color: '#fff', fontWeight: 'bold' },
  fincaScroll: { flexDirection: 'row', paddingVertical: 10 },
  fincaCard: { padding: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginRight: 10, minWidth: 140 },
  fincaCardActive: { borderColor: '#1976D2', backgroundColor: '#E3F2FD', borderWidth: 2 },
  fincaName: { fontWeight: 'bold', fontSize: 15 },
  fincaUtch: { fontSize: 12, color: '#777', marginTop: 4 },
  radio: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  radioActive: { backgroundColor: '#444', borderColor: '#444' },
  radioText: { color: '#333' },
  btnGuardar: { backgroundColor: '#1976D2', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  btnTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});