import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AsentadoresScreen() {
  const [nombre, setNombre] = useState('');
  const [comision, setComision] = useState('');
  const [asentadores, setAsentadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Estado para el "pull-to-refresh"

  useEffect(() => {
    fetchAsentadores();
  }, []);

  async function fetchAsentadores() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('asentadores')
        .select('*')
        .eq('user_id', user?.id)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setAsentadores(data || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function añadirAsentador() {
    if (!nombre || !comision) {
      Alert.alert("Faltan datos", "Por favor, introduce el nombre y la comisión.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('asentadores').insert([
        {
          nombre: nombre,
          comision_porcentaje: parseFloat(comision.replace(',', '.')),
          user_id: user?.id
        }
      ]);

      if (error) throw error;

      setNombre('');
      setComision('');
      // Recargamos la lista automáticamente
      await fetchAsentadores();
      Alert.alert("¡Éxito!", "Asentador añadido correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const eliminarAsentador = (id: string) => {
    Alert.alert(
      "Eliminar Asentador",
      "¿Seguro que quieres eliminar este asentador?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          const { error } = await supabase.from('asentadores').delete().eq('id', id);
          if (error) Alert.alert("Error", "No se pudo eliminar.");
          else fetchAsentadores();
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mis Asentadores 🤝</Text>
        <TouchableOpacity onPress={fetchAsentadores} disabled={loading}>
          <MaterialCommunityIcons 
            name="refresh" 
            size={28} 
            color={loading ? "#CCC" : "#1B5E20"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Formulario para añadir */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre (ej: Manuel Frutas)"
          value={nombre}
          onChangeText={setNombre}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="% Comisión (ej: 10)"
            keyboardType="numeric"
            value={comision}
            onChangeText={setComision}
          />
          <TouchableOpacity 
            style={[styles.addBtn, { opacity: loading ? 0.6 : 1 }]} 
            onPress={añadirAsentador}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de asentadores */}
      <FlatList
        data={asentadores}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAsentadores} colors={["#1B5E20"]} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.asentadorName}>{item.nombre}</Text>
              <Text style={styles.asentadorInfo}>Comisión fija: {item.comision_porcentaje}%</Text>
            </View>
            <TouchableOpacity onPress={() => eliminarAsentador(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No has añadido asentadores todavía.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2, marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { backgroundColor: '#1B5E20', padding: 12, borderRadius: 10, justifyContent: 'center', minWidth: 50, alignItems: 'center' },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#1B5E20'
  },
  asentadorName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  asentadorInfo: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 }
});