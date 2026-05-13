/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function MenuPrincipal() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inicializarApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/login');
          return;
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profiles?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error en inicialización:", err);
      } finally {
        setLoading(false);
      }
    };

    inicializarApp();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* BOTÓN ACERCA DE (AUTORÍA) */}
        <TouchableOpacity 
          style={styles.infoBtn} 
          onPress={() => router.push('/acerca-de')}
        >
          <MaterialCommunityIcons name="information-outline" size={28} color="#666" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.welcome}>Bienvenido,</Text>
          <Text style={styles.title}>Gestión Agrícola</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
          <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />
          <Text style={styles.logoutTxt}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN ADMIN */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.adminCard} 
          onPress={() => router.push('/admin')}
        >
          <MaterialCommunityIcons name="shield-check" size={32} color="white" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.adminText}>PANEL DE CONTROL ADMIN</Text>
            <Text style={styles.adminSub}>Gestionar usuarios, fincas y estadísticas</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* GRID DE BOTONES */}
      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#D32F2F' }]} 
          onPress={() => router.push('/cerezas')}
        >
          <MaterialCommunityIcons name="fruit-cherries" size={50} color="white" />
          <Text style={styles.cardText}>CEREZAS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#2E7D32' }]} 
          onPress={() => router.push('/fincas')}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={50} color="white" />
          <Text style={styles.cardText}>MIS FINCAS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#795548' }]} 
          onPress={() => Alert.alert("Próximamente", "Módulo de castañas en desarrollo")}
        >
          <MaterialCommunityIcons name="food-apple" size={50} color="white" />
          <Text style={styles.cardText}>CASTAÑAS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#455A64' }]} 
          onPress={() => router.push('./perfil')}
        >
          <MaterialCommunityIcons name="account-cog" size={50} color="white" />
          <Text style={styles.cardText}>MI PERFIL</Text>
        </TouchableOpacity>
      </View>

      {/* PIE DE PÁGINA DE PROPIEDAD */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Yaiza Luis Gándara</Text>
        <Text style={styles.footerSub}>Software de Propiedad Privada</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 25 },
  infoBtn: { padding: 5 },
  welcome: { fontSize: 16, color: '#666' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  logoutBtn: { alignItems: 'center', padding: 5 },
  logoutTxt: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  
  adminCard: { 
    backgroundColor: '#1A237E', 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25,
    elevation: 4
  },
  adminText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  adminSub: { color: '#C5CAE9', fontSize: 12, marginTop: 2 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    height: 150, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    elevation: 3 
  },
  cardText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  
  footer: { marginTop: 30, alignItems: 'center', opacity: 0.5 },
  footerText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  footerSub: { fontSize: 10, color: '#666' }
});