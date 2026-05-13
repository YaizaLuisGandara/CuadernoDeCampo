import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HistorialEntregas() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    // Hacemos un JOIN con la tabla fincas para traer el nombre
    const { data, error } = await supabase
      .from('entregas_cerezas')
      .select(`
        *,
        fincas ( nombre )
      `)
      .order('fecha', { ascending: false });

    if (error) Alert.alert('Error', error.message);
    else setEntregas(data || []);
    setLoading(false);
  };

  const confirmarBorrado = (id: string) => {
    Alert.alert(
      "Borrar Registro",
      "¿Estás seguro de que quieres borrar esta entrega? Esto también afectará a los totales del resumen.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar", 
          style: "destructive", 
          onPress: () => borrarEntrega(id) 
        }
      ]
    );
  };

  const borrarEntrega = async (id: string) => {
    const { error } = await supabase.from('entregas_cerezas').delete().eq('id', id);
    if (error) Alert.alert('Error', 'No se pudo borrar');
    else {
      setEntregas(entregas.filter(e => e.id !== id));
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.fecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
        <Text style={[styles.tag, item.escandallo_completado ? styles.tagOk : styles.tagPendiente]}>
          {item.escandallo_completado ? 'PAGADO' : 'PENDIENTE'}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.fincaNombre}>{item.fincas?.nombre || 'Finca desconocida'}</Text>
          <Text style={styles.variedad}>{item.variedad_cereza || 'Variedad no especificada'}</Text>
        </View>
        <View style={styles.kilosCont}>
          <Text style={styles.kilosText}>{item.kilos_netos} kg</Text>
          <Text style={styles.momento}>{item.momento_dia.toUpperCase()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => confirmarBorrado(item.id)}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" />
        <Text style={styles.deleteTxt}>Eliminar registro</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D32F2F" style={{flex:1}} />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Mis Entregas</Text>
        <TouchableOpacity onPress={fetchHistorial}>
          <MaterialCommunityIcons name="refresh" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={entregas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no has registrado ninguna entrega.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fecha: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  tag: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  tagOk: { backgroundColor: '#C8E6C9', color: '#2E7D32' },
  tagPendiente: { backgroundColor: '#FFECB3', color: '#FFA000' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  fincaNombre: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  variedad: { fontSize: 14, color: '#777', fontStyle: 'italic' },
  kilosCont: { alignItems: 'flex-end' },
  kilosText: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F' },
  momento: { fontSize: 11, color: '#999' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  deleteTxt: { color: '#FF5252', fontSize: 12, marginLeft: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});