/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function EntregasPendientes() {
  const [loading, setLoading] = useState(true);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<any>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  useEffect(() => {
    fetchPendientes();
  }, []);

  async function fetchPendientes() {
    setLoading(true);
    try {
      // Filtro mejorado: busca si es exactamente 0 O si es nulo
      const { data, error } = await supabase
        .from('entregas_almacen')
        .select('*, asentadores(nombre)')
        .or('precio_venta_bruto.eq.0,precio_venta_bruto.is.null') 
        .order('fecha', { ascending: false });

      if (error) throw error;
      setPendientes(data || []);
    } catch (error: any) {
      Alert.alert("Error al cargar", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function actualizarPrecio() {
    const precioNum = parseFloat(nuevoPrecio.replace(',', '.'));
    
    if (!nuevoPrecio || isNaN(precioNum) || precioNum <= 0) {
      Alert.alert("Error", "Introduce un precio mayor a 0 (ej: 0.75)");
      return;
    }

    const { error } = await supabase
      .from('entregas_almacen')
      .update({ precio_venta_bruto: precioNum })
      .eq('id', selectedEntrega.id);

    if (error) {
      Alert.alert("Error", "No se pudo actualizar el precio");
    } else {
      Alert.alert("Éxito", "Precio guardado. Ahora aparecerá en Consultas.");
      setModalVisible(false);
      setNuevoPrecio('');
      fetchPendientes(); // Recargar la lista inmediatamente
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pendientes de Precio 🏷️</Text>
        <TouchableOpacity onPress={fetchPendientes}>
          <Text style={{color: '#1B5E20'}}>Actualizar</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#1B5E20" />
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPendientes} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => {
                setSelectedEntrega(item);
                setModalVisible(true);
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.miembro}>{item.miembro_familia}</Text>
                <Text style={styles.fecha}>{item.fecha}</Text>
              </View>
              <Text style={styles.info}>{item.asentadores?.nombre} | {item.variedad}</Text>
              <Text style={styles.kilos}>{item.kilos_netos} kg ({item.cajones_entregados} cajones)</Text>
              <Text style={styles.tapTip}>Toca aquí para poner el precio</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay entregas pendientes.</Text>
              <Text style={styles.emptySub}>Si acabas de añadir una, desliza hacia abajo para refrescar.</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Precio de Venta</Text>
            <Text style={styles.modalSub}>{selectedEntrega?.miembro_familia} - {selectedEntrega?.variedad}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={nuevoPrecio}
              onChangeText={setNuevoPrecio}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={actualizarPrecio}>
                <Text style={styles.btnText}>GUARDAR PRECIO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFA000' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  miembro: { fontWeight: 'bold', fontSize: 16 },
  fecha: { color: '#888', fontSize: 12 },
  info: { color: '#666', marginTop: 4 },
  kilos: { fontWeight: 'bold', marginTop: 5, color: '#1B5E20' },
  tapTip: { fontSize: 11, color: '#FFA000', marginTop: 10, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  emptySub: { fontSize: 12, color: '#999', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalSub: { textAlign: 'center', color: '#666', marginBottom: 20 },
  input: { borderBottomWidth: 2, borderColor: '#1B5E20', fontSize: 24, textAlign: 'center', marginBottom: 25 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, padding: 12, alignItems: 'center' },
  btnSave: { flex: 2, backgroundColor: '#1B5E20', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});