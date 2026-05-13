/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AdminTratamientos() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTratamientos();
  }, []);

  async function fetchTratamientos() {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('tratamientos')
      .select(`
        *,
        fincas (nombre),
        profiles (email)
      `)
      .order('fecha', { ascending: false });

    if (error) Alert.alert("Error", error.message);
    else setData(result || []);
    setLoading(false);
  }

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} color="#2E7D32" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial Fitosanitario</Text>
        <TouchableOpacity onPress={fetchTratamientos}>
          <MaterialCommunityIcons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.timelineItem}>
            <View style={styles.dateColumn}>
              <Text style={styles.day}>{new Date(item.fecha).getDate()}</Text>
              <Text style={styles.month}>
                {new Date(item.fecha).toLocaleString('default', { month: 'short' }).toUpperCase()}
              </Text>
            </View>

            <View style={styles.contentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.fincaText}>{item.fincas?.nombre || 'Finca desc.'}</Text>
                <View style={styles.litrosBadge}>
                  <Text style={styles.litrosText}>{item.litros_aprox} L</Text>
                </View>
              </View>

              <Text style={styles.productoText}>{item.producto || 'Sin producto'}</Text>
              <Text style={styles.maquinariaText}>⚙️ {item.maquinaria}</Text>
              
              <View style={styles.footer}>
                <MaterialCommunityIcons name="account-circle" size={14} color="#666" />
                <Text style={styles.userEmail}>{item.profiles?.email}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay tratamientos registrados.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20' },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  dateColumn: { width: 50, alignItems: 'center', justifyContent: 'center' },
  day: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  month: { fontSize: 12, color: '#888' },
  contentCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 15, marginLeft: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2E7D32' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fincaText: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  litrosBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  litrosText: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold' },
  productoText: { fontSize: 17, fontWeight: 'bold', color: '#333', marginVertical: 3 },
  maquinariaText: { fontSize: 12, color: '#777', marginBottom: 5 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
  userEmail: { fontSize: 12, color: '#888', marginLeft: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});