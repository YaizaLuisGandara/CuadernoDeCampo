/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function RegistroTratamiento() {
  const router = useRouter();

  // Estados para el formulario
  const [fincas, setFincas] = useState<any[]>([]);
  const [fincasSeleccionadas, setFincasSeleccionadas] = useState<any[]>([]); // Array para multiselección
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [momentoDia, setMomentoDia] = useState('mañana');
  const [cultivo, setCultivo] = useState('cerezas');
  const [variedad, setVariedad] = useState('');
  const [producto, setProducto] = useState('');
  const [litros, setLitros] = useState('');
  const [operario, setOperario] = useState('');
  const [maquinaria, setMaquinaria] = useState('MQF/01 Pulverizados >100L');
  const [cargandoFincas, setCargandoFincas] = useState(true);

  // Estados para el Historial/Consulta
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [historialTratamientos, setHistorialTratamientos] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

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

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tratamientos')
        .select('*, fincas(nombre)')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setHistorialTratamientos(data || []);
      setModalHistorialVisible(true);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el historial: ' + error.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Lógica para seleccionar/deseleccionar fincas individualmente
  const handleSeleccionarFinca = (finca: any) => {
    const yaSeleccionada = fincasSeleccionadas.find(f => f.id === finca.id);
    if (yaSeleccionada) {
      setFincasSeleccionadas(fincasSeleccionadas.filter(f => f.id !== finca.id));
    } else {
      setFincasSeleccionadas([...fincasSeleccionadas, finca]);
    }
  };

  // Seleccionar o deseleccionar todas de golpe
  const handleSeleccionarTodas = () => {
    if (fincasSeleccionadas.length === fincas.length) {
      setFincasSeleccionadas([]); 
    } else {
      setFincasSeleccionadas([...fincas]); 
    }
  };

  const guardarTratamiento = async () => {
    if (fincasSeleccionadas.length === 0 || !producto || !operario) {
      Alert.alert('Faltan datos', 'Por favor selecciona al menos una finca y rellena producto y operario');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Creamos el array de inserciones masivas
      const registrosAInsertar = fincasSeleccionadas.map(finca => ({
        user_id: user?.id,
        fecha: fecha.toISOString().split('T')[0],
        momento_dia: momentoDia,
        cultivo: cultivo,
        finca_id: finca.id,
        variedad_tratada: variedad,
        producto_nombre: producto, 
        litros_aprox: litros ? parseFloat(litros.replace(',', '.')) : 0,
        operario_nombre: operario,
        maquinaria: maquinaria
      }));

      const { error } = await supabase.from('tratamientos').insert(registrosAInsertar);

      if (error) throw error;

      Alert.alert('¡Éxito!', `Tratamiento registrado en ${fincasSeleccionadas.length} fincas correctamente`);
      router.back();
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <ScrollView style={styles.container}>
        
        {/* ENCABEZADO CON BOTÓN DE HISTORIAL */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Nuevo Tratamiento 💊</Text>
          <TouchableOpacity style={styles.btnHistorial} onPress={cargarHistorial}>
            {cargandoHistorial ? (
              <ActivityIndicator color="#1976D2" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#1976D2" />
                <Text style={styles.btnHistorialTxt}>Historial</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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

        {/* Selección de Fincas Múltiple */}
        <View style={styles.fincaHeaderRow}>
          <Text style={styles.label}>Seleccionar Fincas</Text>
          {fincas.length > 0 && (
            <TouchableOpacity style={styles.btnSelectAll} onPress={handleSeleccionarTodas}>
              <Text style={styles.btnSelectAllTxt}>
                {fincasSeleccionadas.length === fincas.length ? "Deseleccionar todas" : "✓ Seleccionar todas"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {cargandoFincas ? (
          <ActivityIndicator color="#1976D2" />
        ) : (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fincaScroll}>
              {fincas.length === 0 && <Text style={{color: '#999'}}>No tienes fincas registradas</Text>}
              {fincas.map(f => {
                const estaSeleccionada = fincasSeleccionadas.some(sel => sel.id === f.id);
                return (
                  <TouchableOpacity 
                    key={f.id} 
                    style={[styles.fincaCard, estaSeleccionada && styles.fincaCardActive]}
                    onPress={() => handleSeleccionarFinca(f)}
                  >
                    <View style={styles.checkboxContainer}>
                      <Text style={[styles.fincaName, estaSeleccionada && {color: '#1976D2'}]}>{f.nombre}</Text>
                      {estaSeleccionada && <MaterialCommunityIcons name="check-circle" size={18} color="#1976D2" />}
                    </View>
                    <Text style={styles.fincaUtch}>{f.localidad || 'Sin localidad'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={styles.fincasContador}>Fincas seleccionadas: {fincasSeleccionadas.length}</Text>
          </View>
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

        {/* MAQUINARIA */}
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
        
        <View style={{ height: 60 }} /> 
      </ScrollView>

      {/* --- MODAL DE CONSULTA HISTORIAL --- */}
      <Modal visible={modalHistorialVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historial de Tratamientos 📋</Text>
            <TouchableOpacity style={styles.btnCloseModal} onPress={() => setModalHistorialVisible(false)}>
              <MaterialCommunityIcons name="close" size={26} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={historialTratamientos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <View style={styles.historialCard}>
                <View style={styles.historialHeader}>
                  <Text style={styles.historialFecha}>📅 {item.fecha} ({item.momento_dia})</Text>
                  <Text style={styles.historialLitros}>{item.litros_aprox} L</Text>
                </View>
                
                <Text style={styles.historialFinca}>🏡 Finca: <Text style={styles.bold}>{item.fincas?.nombre || 'Desconocida'}</Text></Text>
                <Text style={styles.historialProducto}>🧪 Producto: <Text style={styles.bold}>{item.producto_nombre || item.producto || 'No especificado'}</Text></Text>
                
                {item.variedad_tratada ? (
                  <Text style={styles.historialSub}>🍒 Variedad: {item.variedad_tratada}</Text>
                ) : null}
                <Text style={styles.historialSub}>👤 Aplicador: {item.operario_nombre} | {item.maquinaria}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyTxt}>No hay tratamientos registrados en el historial.</Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1976D2' },
  btnHistorial: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BBDEFB' },
  btnHistorialTxt: { color: '#1976D2', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 15 },
  fincaHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 5 },
  btnSelectAll: { paddingVertical: 4, paddingHorizontal: 8 },
  btnSelectAllTxt: { color: '#1976D2', fontSize: 13, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  chip: { flex: 1, padding: 12, backgroundColor: '#eee', borderRadius: 10, alignItems: 'center' },
  chipActive: { backgroundColor: '#1976D2' },
  textActive: { color: '#fff', fontWeight: 'bold' },
  fincaScroll: { flexDirection: 'row', paddingVertical: 10 },
  fincaCard: { padding: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginRight: 10, minWidth: 150 },
  fincaCardActive: { borderColor: '#1976D2', backgroundColor: '#E3F2FD', borderWidth: 2 },
  checkboxContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fincaName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  fincaUtch: { fontSize: 12, color: '#777', marginTop: 4 },
  fincasContador: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 2 },
  radio: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  radioActive: { backgroundColor: '#444', borderColor: '#444' },
  radioText: { color: '#333' },
  btnGuardar: { backgroundColor: '#1976D2', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  btnTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, 
  
  // Estilos del Historial (Modal)
  modalContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', paddingTop: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  btnCloseModal: { padding: 5 },
  historialCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#eaeaea' },
  historialHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderColor: '#f5f5f5', paddingBottom: 5 },
  historialFecha: { fontWeight: 'bold', color: '#1976D2', fontSize: 14 },
  historialLitros: { fontWeight: 'bold', color: '#444' },
  historialFinca: { fontSize: 15, color: '#333', marginBottom: 3 },
  historialProducto: { fontSize: 15, color: '#2E7D32', marginBottom: 5 },
  historialSub: { fontSize: 12, color: '#666', marginTop: 2 },
  bold: { fontWeight: 'bold' },
  emptyTxt: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 }
});