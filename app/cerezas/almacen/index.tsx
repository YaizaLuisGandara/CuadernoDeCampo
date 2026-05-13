import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function AlmacenIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKilos: 0,
    totalCajones: 0,
    balanceCajas: 0, // Cajones metidos - Cajones sacados
    pendientesPrecio: 0
  });

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: entregas, error } = await supabase
        .from('entregas_almacen')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (entregas) {
        const kilos = entregas.reduce((acc, curr) => acc + (Number(curr.kilos_netos) || 0), 0);
        const inCajas = entregas.reduce((acc, curr) => acc + (curr.cajones_entregados || 0), 0);
        const outCajas = entregas.reduce((acc, curr) => acc + (curr.cajones_vacios_sacados || 0), 0);
        const sinPrecio = entregas.filter(e => !e.precio_venta_bruto || e.precio_venta_bruto === 0).length;

        setStats({
          totalKilos: kilos,
          totalCajones: inCajas,
          balanceCajas: inCajas - outCajas,
          pendientesPrecio: sinPrecio
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#1B5E20" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Almacén 🏗️</Text>
        <Text style={styles.subtitle}>Campaña de Cerezas</Text>
      </View>

      {/* Tarjetas de Resumen Rápido */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Kilos</Text>
          <Text style={styles.statValue}>{stats.totalKilos.toLocaleString()}</Text>
          <Text style={styles.statUnit}>kg</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Balance Cajas</Text>
          <Text style={[styles.statValue, { color: stats.balanceCajas < 0 ? '#D32F2F' : '#2E7D32' }]}>
            {stats.balanceCajas}
          </Text>
          <Text style={styles.statUnit}>{stats.balanceCajas < 0 ? 'Debes' : 'En stock'}</Text>
        </View>
      </View>

      {/* Alerta de Precios Pendientes */}
      {stats.pendientesPrecio > 0 && (
        <TouchableOpacity 
          style={styles.alertCard}
          onPress={() => router.push('./almacen/pendientes')}
        >
          <MaterialCommunityIcons name="alert-circle" size={24} color="#F57C00" />
          <Text style={styles.alertText}>Tienes {stats.pendientesPrecio} entregas sin precio de venta.</Text>
        </TouchableOpacity>
      )}

      {/* Menú de Opciones */}
      <View style={styles.menu}>
        <MenuButton 
          title="Nueva Entrega" 
          icon="plus-circle" 
          color="#1B5E20" 
          onPress={() => router.push('./almacen/nueva-entrega')} 
        />
        <MenuButton 
          title="Consultar entregas" 
          icon="account-group" 
          color="#1976D2" 
          onPress={() => router.push('./almacen/consultas')} 
        />
        <MenuButton 
          title="Entregas Pendientes" 
          icon="alert-circle" 
          color="#F57C00" 
          onPress={() => router.push('./almacen/pendientes')} 
        />
        <MenuButton 
          title="Asentadores" 
          icon="handshake" 
          color="#6A1B9A" 
          onPress={() => router.push('/asentadores')} 
        />
        <MenuButton 
          title="Ajustes Almacén" 
          icon="cog" 
          color="#455A64" 
          onPress={() => router.push('./almacen/configuracion')} 
        />
        <MenuButton 
          title="Tratamientos" 
          icon="flask-outline" 
          color="#2E7D32" 
          onPress={() => router.push('./almacen/tratamientos')} 
        />
      </View>
    </ScrollView>
  );
}

function MenuButton({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={28} color="white" />
      </View>
      <Text style={styles.menuBtnText}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9', padding: 20 },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B5E20' },
  subtitle: { fontSize: 16, color: '#666' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 15, elevation: 3, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 5 },
  statUnit: { fontSize: 12, color: '#999' },
  alertCard: { backgroundColor: '#FFF3E0', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 25, borderLeftWidth: 5, borderLeftColor: '#F57C00' },
  alertText: { marginLeft: 10, color: '#E65100', fontWeight: '500', flex: 1 },
  menu: { marginBottom: 40 },
  menuBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuBtnText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' }
});