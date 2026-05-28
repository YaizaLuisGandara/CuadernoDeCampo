/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function HistorialEntregas() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [escandalloSeleccionado, setEscandalloSeleccionado] = useState<any>(null);
  const [loadingLineas, setLoadingLineas] = useState(false);
  const [precios, setPrecios] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => { fetchHistorial(); }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('entregas_cerezas').select('*, fincas ( nombre )').eq('user_id', user.id).order('fecha', { ascending: false });
    setEntregas(data || []);
    setLoading(false);
  };

  const consultarDetalleEscandallo = async (entrega: any) => {
    setLoadingLineas(true);
    setModalVisible(true);
    setEscandalloSeleccionado({ entrega, lineas: [] });

    try {
      // 1. Traer precios vigentes para esa semana
      const { data: preciosData } = await supabase
        .from('precios_calibres')
        .select('*')
        .lte('fecha_inicio', entrega.fecha)
        .gte('fecha_fin', entrega.fecha);
      setPrecios(preciosData || []);

      // 2. Traer cabecera y líneas
      const { data: cabeceras } = await supabase.from('escandallos_cabecera').select('id, num_albaran').eq('fecha', entrega.fecha).eq('user_id', entrega.user_id);
      if (!cabeceras || cabeceras.length === 0) throw new Error("No hay detalle para este albarán.");

      const { data: lineas } = await supabase.from('escandallos_lineas').select('*').eq('escandallo_id', cabeceras[0].id);

      setEscandalloSeleccionado({
        entrega,
        num_albaran: cabeceras[0].num_albaran,
        lineas: lineas || []
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoadingLineas(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    let utchMostrable = "";
    if (item.observaciones) {
      if (item.observaciones.includes("UTCH Cooperativa:")) utchMostrable = item.observaciones.split("UTCH Cooperativa:")[1]?.trim() || "";
      else if (item.observaciones.includes("UTCH:")) utchMostrable = item.observaciones.split("UTCH:")[1]?.replace(")", "")?.trim() || "";
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.fecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
          <Text style={[styles.tag, item.escandallo_completado ? styles.tagOk : styles.tagPendiente]}>{item.escandallo_completado ? 'PAGADO / WEB' : 'PENDIENTE'}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.fincaNombre}>{item.fincas?.nombre || 'Entrega Cooperativa'}</Text>
            {utchMostrable !== "" && <Text style={styles.utchText}>UTCH: {utchMostrable}</Text>}
            <Text style={styles.variedad}>{item.variedad_cereza || 'Variedad estándar'}</Text>
          </View>
          <View style={styles.kilosCont}>
            <Text style={styles.kilosText}>{Number(item.kilos_netos).toFixed(3)} kg</Text>
          </View>
        </View>
        {item.escandallo_completado && (
          <TouchableOpacity style={styles.viewEscandalloBtn} onPress={() => consultarDetalleEscandallo(item)}>
            <MaterialCommunityIcons name="chart-pie" size={16} color="#15803d" />
            <Text style={styles.viewEscandalloTxt}>Ver Desglose y Precios</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Mis Entregas</Text>
        <TouchableOpacity onPress={fetchHistorial}><MaterialCommunityIcons name="refresh" size={24} color="#15803d" /></TouchableOpacity>
      </View>
      <FlatList data={entregas} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Albarán: {escandalloSeleccionado?.num_albaran}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><MaterialCommunityIcons name="close-circle" size={28} color="#666" /></TouchableOpacity>
            </View>
            {loadingLineas ? <ActivityIndicator size="large" color="#15803d" /> : (
              <ScrollView>
                <View style={{marginVertical: 10}}>
                   <Text style={{fontWeight: 'bold'}}>Kilos Totales: {Number(escandalloSeleccionado?.entrega?.kilos_netos).toFixed(3)} kg</Text>
                </View>

                {(() => {
                  let totalEntrega = 0;
                  escandalloSeleccionado?.lineas.forEach((linea: any) => {
                    const p = precios.find(pr => pr.categoria === linea.categoria_limpia);
                    if (p) totalEntrega += (linea.peso_neto * p.precio);
                  });
                  return (
                    <View style={styles.totalEntregaBox}>
                      <Text style={styles.totalEntregaText}>Total Estimado: {totalEntrega.toFixed(2)} €</Text>
                    </View>
                  );
                })()}

                {escandalloSeleccionado?.lineas.map((linea: any, i: number) => {
                  const precioInfo = precios.find(p => p.categoria === linea.categoria_limpia);
                  const totalFila = precioInfo ? (linea.peso_neto * precioInfo.precio) : 0;
                  return (
                    <View key={i} style={styles.lineaFila}>
                      <View>
                        <Text style={styles.calibreLimpio}>{linea.categoria_limpia}</Text>
                        {precioInfo && <Text style={{fontSize: 10, color: '#15803d', fontWeight: 'bold'}}>{precioInfo.precio} €/kg</Text>}
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text style={styles.lineaKilos}>{Number(linea.peso_neto).toFixed(3)} kg</Text>
                        {precioInfo && <Text style={{fontWeight: 'bold', color: '#D32F2F'}}>{totalFila.toFixed(2)} €</Text>}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fecha: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  tag: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  tagOk: { backgroundColor: '#C8E6C9', color: '#2E7D32' },
  tagPendiente: { backgroundColor: '#FFECB3', color: '#FFA000' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12 },
  fincaNombre: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  utchText: { fontSize: 12, color: '#15803d', fontWeight: '700', marginTop: 2 },
  variedad: { fontSize: 13, color: '#777', fontStyle: 'italic', marginTop: 2 },
  kilosCont: { alignItems: 'flex-end' },
  kilosText: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F' },
  viewEscandalloBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 10 },
  viewEscandalloTxt: { color: '#15803d', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  lineaFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  calibreLimpio: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  lineaKilos: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F' },
  totalEntregaBox: { backgroundColor: '#15803d', padding: 15, borderRadius: 10, marginVertical: 15, alignItems: 'center' },
  totalEntregaText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});