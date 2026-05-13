import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GestionFincas() {
  // 1. ESTADOS PARA LOS CAMPOS
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [hectareas, setHectareas] = useState('');
  const [cultivo, setCultivo] = useState('Cerezas'); // Valor por defecto
  
  const [fincas, setFincas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchFincas(); 
  }, []);

  // CARGAR LAS FINCAS DEL USUARIO
  async function fetchFincas() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('fincas')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre');
      
    if (data) setFincas(data);
    if (error) console.log("Error al cargar:", error.message);
  }

  // GUARDAR NUEVA FINCA
  const guardarFinca = async () => {
    // Validamos que los campos obligatorios tengan texto
    if (!nombre || !localidad || !hectareas) {
      return Alert.alert("Campos incompletos", "Por favor rellena el nombre, localidad y hectáreas.");
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const { error } = await supabase
        .from('fincas')
        .insert([
          { 
            nombre: nombre, 
            localidad: localidad, 
            hectareas: parseFloat(hectareas.replace(',', '.')), // Acepta comas y puntos
            cultivo: cultivo,
            user_id: user.id 
          }
        ]);

      if (error) throw error;

      // Limpiamos los campos después de guardar
      setNombre('');
      setLocalidad('');
      setHectareas('');
      Alert.alert("Éxito", "Finca guardada correctamente");
      fetchFincas(); // Recargamos la lista

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Fincas</Text>
      
      {/* FORMULARIO DE ENTRADA */}
      <View style={styles.formulario}>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre de la finca (ej: La Solana)" 
          value={nombre} 
          onChangeText={setNombre} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Localidad (ej: Jerte)" 
          value={localidad} 
          onChangeText={setLocalidad} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Hectáreas (ej: 2.5)" 
          value={hectareas} 
          onChangeText={setHectareas} 
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.btnGuardar} onPress={guardarFinca} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color="white" />
              <Text style={styles.btnText}> GUARDAR FINCA</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Listado</Text>

      {/* LISTA DE FINCAS */}
      <FlatList
        data={fincas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardText}>{item.nombre}</Text>
              <Text style={styles.cardSubtext}>{item.municipio} • {item.hectareas} ha</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#1B5E20' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#666' },
  formulario: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 25, elevation: 3 },
  input: { 
    backgroundColor: '#f9f9f9', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 10 
  },
  btnGuardar: { 
    backgroundColor: '#2E7D32', 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnText: { color: 'white', fontWeight: 'bold' },
  card: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 2 
  },
  cardText: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  cardSubtext: { fontSize: 13, color: '#777', marginTop: 2 }
});