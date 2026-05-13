import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminFincas() {
  const [fincas, setFincas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTodasLasFincas();
  }, []);

  async function cargarTodasLasFincas() {
    setLoading(true);
    // Hacemos un JOIN con la tabla profiles para saber de quién es cada finca
    const { data, error } = await supabase
      .from('fincas')
      .select(`
        *,
        profiles (
          email
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setFincas(data || []);
    }
    setLoading(false);
  }

  const confirmarEliminar = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar Finca",
      `¿Estás seguro de que quieres eliminar la finca "${nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from('fincas').delete().eq('id', id);
            if (error) Alert.alert("Error", error.message);
            else cargarTodasLasFincas(); // Recargar lista
          } 
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} color="#1A237E" />;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Control Global de Fincas</Text>
      
      <FlatList
        data={fincas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.fincaName}>{item.nombre}</Text>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="account" size={12} color="#1A237E" />
                <Text style={styles.userEmail}>{item.profiles?.email || 'Sin dueño'}</Text>
              </View>
              <Text style={styles.detalles}>Cultivo: {item.cultivo} | {item.municipio}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => Alert.alert("Editar", "Aquí abrirías un modal para editar los datos")}
              >
                <MaterialCommunityIcons name="pencil" size={22} color="#1976D2" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => confirmarEliminar(item.id, item.nombre)}
              >
                <MaterialCommunityIcons name="trash-can" size={22} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay fincas registradas en el sistema.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  info: { flex: 1 },
  fincaName: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8EAF6', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 5,
    marginTop: 4
  },
  userEmail: { fontSize: 12, color: '#1A237E', marginLeft: 4, fontWeight: '600' },
  detalles: { fontSize: 13, color: '#666', marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8, marginLeft: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});