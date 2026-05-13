/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenuCerezas() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Destino de la Cereza 🍒</Text>
      
      {/* BOTÓN COOPERATIVA */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#1565C0' }]} 
        onPress={() => router.push('./cerezas/cooperativa')}
      >
        <MaterialCommunityIcons name="home-group" size={60} color="white" />
        <Text style={styles.cardText}>COOPERATIVA</Text>
      </TouchableOpacity>

      {/* BOTÓN ALMACÉN */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#455A64' }]} 
        onPress={() => router.push('./cerezas/almacen')}
      >
        <MaterialCommunityIcons name="warehouse" size={60} color="white" />
        <Text style={styles.cardText}>ALMACÉN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { height: 150, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
  cardText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 }
});