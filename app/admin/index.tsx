import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalKilos: 0, numEntregas: 0, promedio: 0, usuariosActivos: 0 });
  const [entregasRecientes, setEntregasRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosGlobales();
  }, []);

  async function cargarDatosGlobales() {
    setLoading(true);
    try {
      const { data: entregas, error } = await supabase
        .from('entregas_cerezas')
        .select(`
          id,
          kilos_netos,
          fecha,
          profiles ( email )
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;

      if (entregas) {
        const total = entregas.reduce((acc, curr) => acc + (Number(curr.kilos_netos) || 0), 0);
        
        // Extraemos los emails manejando si profiles viene como objeto o array
        const emails = entregas.map(e => {
          const profileData = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
          return profileData?.email;
        });
        
        const usuariosUnicos = new Set(emails.filter(Boolean)).size;

        setStats({ 
          totalKilos: total, 
          numEntregas: entregas.length,
          usuariosActivos: usuariosUnicos,
          promedio: entregas.length > 0 ? total / entregas.length : 0
        });
        setEntregasRecientes(entregas);
      }
    } catch (error: any) {
      console.error("Error cargando dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#D32F2F" />;

  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Panel de Control (ADMIN)</Text>
        <TouchableOpacity onPress={cargarDatosGlobales}>
          <MaterialCommunityIcons name="refresh" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
      
      {/* Tarjeta Principal de Kilos */}
      <View style={styles.card}>
        <Text style={styles.label}>Total Kilos Recolectados:</Text>
        <Text style={styles.bigValue}>{stats.totalKilos.toLocaleString()} kg</Text>
        <Text style={styles.subLabel}>{stats.numEntregas} entregas registradas</Text>
      </View>

      {/* Bloque de Resumen del Sistema */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Resumen del Sistema</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Agricultores activos:</Text>
          <Text style={styles.infoValue}>{stats.usuariosActivos}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Promedio por entrega:</Text>
          <Text style={styles.infoValue}>{stats.promedio.toFixed(2)} kg</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Últimas entregas (Global):</Text>
      
      <FlatList
        data={entregasRecientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // Normalización del email para evitar errores de tipo
          const profileData = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          const displayEmail = profileData?.email;

          return (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.userEmail}>
                  {displayEmail || 'Usuario desconocido'}
                </Text>
                <Text style={styles.itemFecha}>{item.fecha}</Text>
              </View>
              <View style={styles.itemKilos}>
                <Text style={styles.kilosValue}>{item.kilos_netos} kg</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No hay entregas registradas.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 4, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#D32F2F' },
  label: { fontSize: 14, color: '#666' },
  bigValue: { fontSize: 36, fontWeight: 'bold', color: '#D32F2F', marginVertical: 5 },
  subLabel: { fontSize: 12, color: '#999' },
  
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 25, elevation: 2 },
  infoTitle: { fontWeight: 'bold', marginBottom: 10, color: '#333', fontSize: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1 },
  userEmail: { fontWeight: 'bold', color: '#1976D2', fontSize: 14 },
  itemFecha: { color: '#888', fontSize: 12, marginTop: 2 },
  itemKilos: { backgroundColor: '#E8F5E9', padding: 8, borderRadius: 8 },
  kilosValue: { fontWeight: 'bold', color: '#2E7D32', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' }
});