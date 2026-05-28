/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function EscandallosScreen() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useFocusEffect se ejecuta cada vez que el usuario vuelve a ver esta pantalla.
  // Es perfecto para que, al regresar del Scraper, los datos se actualicen solos.
  useFocusEffect(
    useCallback(() => {
      fetchEntregasSinEscandallo();
    }, [])
  );

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

  if (loading && entregas.length === 0) {
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
      
      {/* BOTÓN DE SINCRONIZACIÓN AUTOMÁTICA POR WEB SCRAPING */}
      <TouchableOpacity 
        style={styles.syncButton}
        onPress={() => router.push('./scraper')}
      >
        <MaterialCommunityIcons name="cloud-sync" size={24} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.syncButtonText}>Sincronizar desde la Web</Text>
      </TouchableOpacity>

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
  subtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#15803d',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 10 },
  emptySub: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 5 },
});