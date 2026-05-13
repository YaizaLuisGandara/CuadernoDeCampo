/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AsentadoresIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [asentadores, setAsentadores] = useState<any[]>([]);

  useEffect(() => {
    fetchAsentadores();
  }, []);

  async function fetchAsentadores() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('asentadores')
        .select('*')
        .eq('user_id', user?.id)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setAsentadores(data || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const confirmarEliminacion = (id: string) => {
    Alert.alert(
      "Eliminar Asentador",
      "¿Estás seguro? Esto no borrará las entregas pasadas, pero no podrás seleccionarlo en nuevas entregas.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from('asentadores').delete().eq('id', id);
            if (error) Alert.alert("Error", "No se puede eliminar porque tiene entregas asociadas.");
            else fetchAsentadores();
          } 
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6A1B9A" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mis Asentadores</Text>
          <Text style={styles.subtitle}>{asentadores.length} registrados</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => router.push('/asentadores/AsentadoresScreen')}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={asentadores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="handshake" size={24} color="#6A1B9A" />
            </View>
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.comision}>Comisión: {item.comision_porcentaje}%</Text>
            </View>
            <TouchableOpacity onPress={() => confirmarEliminacion(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes asentadores configurados.</Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => router.push('/asentadores/AsentadoresScreen')}
            >
              <Text style={styles.emptyBtnText}>Añadir el primero</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#888' },
  addBtn: { backgroundColor: '#6A1B9A', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    elevation: 2 
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  info: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  comision: { fontSize: 14, color: '#6A1B9A', fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginBottom: 15 },
  emptyBtn: { backgroundColor: '#6A1B9A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold' }
});