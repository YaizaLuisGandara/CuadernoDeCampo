import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResumenCampana() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ kilos: 0, dinero: 0, entregas: 0 });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Contamos las entregas totales y sumamos kilos
      const { data: entregas, error: errEntregas } = await supabase
        .from('entregas_cerezas')
        .select('kilos_netos');

      // 2. Sumamos el dinero de la tabla escandallos
      const { data: escandallos, error: errEscandallos } = await supabase
        .from('escandallos')
        .select('precio_total_ganado');

      if (errEntregas || errEscandallos) throw new Error("Error al traer datos");

      const totalKilos = entregas?.reduce((acc, curr) => acc + curr.kilos_netos, 0) || 0;
      const totalDinero = escandallos?.reduce((acc, curr) => acc + curr.precio_total_ganado, 0) || 0;

      setStats({
        kilos: totalKilos,
        dinero: totalDinero,
        entregas: entregas?.length || 0
      });

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#D32F2F" style={{flex:1}} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Resumen de Campaña 🍒</Text>

      {/* Tarjeta de Kilos */}
      <View style={[styles.mainCard, { borderLeftColor: '#D32F2F' }]}>
        <MaterialCommunityIcons name="scale-balance" size={32} color="#D32F2F" />
        <Text style={styles.cardLabel}>KILOS TOTALES</Text>
        <Text style={styles.cardValue}>{stats.kilos.toLocaleString()} kg</Text>
        <Text style={styles.cardSub}>{stats.entregas} entregas realizadas</Text>
      </View>

      {/* Tarjeta de Dinero */}
      <View style={[styles.mainCard, { borderLeftColor: '#2E7D32' }]}>
        <MaterialCommunityIcons name="cash-multiple" size={32} color="#2E7D32" />
        <Text style={styles.cardLabel}>ESTIMACIÓN INGRESOS</Text>
        <Text style={[styles.cardValue, { color: '#2E7D32' }]}>{stats.dinero.toFixed(2)} €</Text>
        <Text style={styles.cardSub}>Basado en escandallos completados</Text>
      </View>

      {/* Tarjeta de Media */}
      <View style={[styles.mainCard, { borderLeftColor: '#1565C0' }]}>
        <MaterialCommunityIcons name="chart-line" size={32} color="#1565C0" />
        <Text style={styles.cardLabel}>PRECIO MEDIO</Text>
        <Text style={[styles.cardValue, { color: '#1565C0' }]}>
          {stats.kilos > 0 ? (stats.dinero / stats.kilos).toFixed(2) : "0.00"} €/kg
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#333' },
  mainCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    borderLeftWidth: 8,
  },
  cardLabel: { fontSize: 14, color: '#666', fontWeight: 'bold', marginTop: 5 },
  cardValue: { fontSize: 32, fontWeight: '900', color: '#333', marginVertical: 5 },
  cardSub: { fontSize: 12, color: '#999' }
});