/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PanelCooperativa() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión Cooperativa</Text>

      {/* REGISTRO DE KILOS */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => router.push('/cerezas/cooperativa/entregas')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#FF5252' }]}>
          <MaterialCommunityIcons name="scale-balance" size={30} color="white" />
        </View>
        <View>
          <Text style={styles.menuText}>Registrar Entrada</Text>
          <Text style={styles.menuSubtext}>Anota los kilos diarios</Text>
        </View>
      </TouchableOpacity>

      {/* ESCANDALLOS */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => router.push('/cerezas/cooperativa/escandallos')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#FFD740' }]}>
          <MaterialCommunityIcons name="calculator" size={30} color="black" />
        </View>
        <View>
          <Text style={styles.menuText}>Escandallos</Text>
          <Text style={styles.menuSubtext}>Consultar escandallos en la Web</Text>
        </View>
      </TouchableOpacity>
      {/* PRECIOS */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => router.push('/cerezas/cooperativa/GestionPrecios')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#53ff40' }]}>
          <MaterialCommunityIcons name="calculator" size={30} color="black" />
        </View>
        <View>
          <Text style={styles.menuText}>Precios</Text>
          <Text style={styles.menuSubtext}>Precios de los Escandallos</Text>
        </View>
      </TouchableOpacity>

      {/* Registro de Entregas */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => router.push('/cerezas/cooperativa/historial')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#1565C0' }]}>
          <MaterialCommunityIcons name="chart-bar" size={30} color="white" />
        </View>
        <View>
          <Text style={styles.menuText}>Historial de Entregas</Text>
          <Text style={styles.menuSubtext}>Escandallos con Precios</Text>
        </View>
      </TouchableOpacity>

      {/* TRATAMIENTOS */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => router.push('/cerezas/cooperativa/tratamientos')} 
      >
        <View style={[styles.iconBox, { backgroundColor: '#00d5ff' }]}>
          <MaterialCommunityIcons name="spray" size={30} color="black" />
        </View>
        <View>
          <Text style={styles.menuText}>Tratamientos</Text>
          <Text style={styles.menuSubtext}>Cuaderno de fitosanitarios</Text>
        </View>
      </TouchableOpacity>
          </ScrollView>
        );
      }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 26, fontWeight: 'bold', marginVertical: 20, color: '#333' },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', 
    padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3 
  },
  iconBox: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 18, fontWeight: 'bold' },
  menuSubtext: { fontSize: 14, color: '#777' }
});