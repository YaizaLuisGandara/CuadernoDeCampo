import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EscandallosScreen() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEntregasSinEscandallo();
  }, []);

  async function fetchEntregasSinEscandallo() {
    try {
      setLoading(true);
      // Hacemos el SELECT pidiendo específicamente los datos de la tabla relacionada 'fincas'
      const { data, error } = await supabase
        .from('entregas_cerezas')
        .select(`
          *,
          fincas (
            nombre
          )
        `)
        .eq('escandallo_completado', false)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setEntregas(data || []);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las entregas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const renderEntrega = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/cerezas/cooperativa/formulario-escandallo',
        params: { id: item.id, kilos: item.kilos_netos }
      })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.fecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
        <Text style={styles.kilos}>{item.kilos_netos} kg - {item.variedad_cereza || 'Variedad s/n'}</Text>
        
        {/* Mostramos el nombre de la finca que viene del Join */}
        <View style={styles.fincaRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#1A237E" />
          <Text style={styles.fincaText}>
            {item.fincas?.nombre || 'Finca sin nombre'}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightSide}>
        <Text style={styles.btnLabel}>Añadir Ticket</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#D32F2F" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={{ marginTop: 10, color: '#666' }}>Buscando pesadas pendientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pendientes de Escandallo</Text>
      <Text style={styles.subtitle}>Selecciona una pesada para introducir los precios de la cooperativa</Text>
      
      {entregas.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="check-all" size={80} color="#2E7D32" />
          <Text style={styles.emptyText}>¡Todo al día!</Text>
          <Text style={styles.emptySub}>No hay entregas pendientes de precio.</Text>
        </View>
      ) : (
        <FlatList
          data={entregas}
          renderItem={renderEntrega}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={fetchEntregasSinEscandallo}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInfo: { flex: 1 },
  fecha: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 4 },
  kilos: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  fincaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  fincaText: { fontSize: 14, color: '#1A237E', fontWeight: '600', marginLeft: 4 },
  rightSide: { alignItems: 'center', justifyContent: 'center' },
  btnLabel: { fontSize: 10, color: '#D32F2F', fontWeight: 'bold', marginBottom: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 10 },
  emptySub: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 5 },
});