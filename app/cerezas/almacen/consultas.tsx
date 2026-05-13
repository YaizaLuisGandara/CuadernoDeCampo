import { Picker } from '@react-native-picker/picker'; // Asegúrate de tener esta librería instalada
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function Consultas() {
  const [loading, setLoading] = useState(true);
  const [todasLasEntregas, setTodasLasEntregas] = useState<any[]>([]); // Guardamos todo
  const [entregasFiltradas, setEntregasFiltradas] = useState<any[]>([]); // Lo que mostramos
  const [miembros, setMiembros] = useState<string[]>([]);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState('TODOS');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchEntregas();
  }, []);

  async function fetchEntregas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('entregas_almacen')
      .select('*, asentadores(*)')
      .order('fecha', { ascending: false });

    if (data) {
      setTodasLasEntregas(data);
      setEntregasFiltradas(data);
      
      // Extraer nombres únicos de los miembros para el filtro
      const nombresUnicos: string[] = Array.from(
        new Set(data.map((item: any) => item.miembro_familia))
      ).filter(n => n); // Quitar nulos si los hay
      
      setMiembros(nombresUnicos);
    }
    setLoading(false);
  }

  // Función que se ejecuta al cambiar el filtro
  const filtrarPorMiembro = (nombre: string) => {
    setFiltroSeleccionado(nombre);
    if (nombre === 'TODOS') {
      setEntregasFiltradas(todasLasEntregas);
    } else {
      const filtradas = todasLasEntregas.filter(e => e.miembro_familia === nombre);
      setEntregasFiltradas(filtradas);
    }
  };

  // --- LÓGICA DE CÁLCULO EXCEL (Igual que antes) ---
  const calcularExcelExacto = (item: any) => {
    const kilosTotales = item.kilos_netos || 0;
    const precioVenta = item.precio_venta_bruto || 0;
    const nombreAsentador = item.asentadores?.nombre?.toUpperCase() || '';

    const L2 = item.comision_aplicada ?? 0;
    const L3 = item.iva_aplicado ?? 0;
    const L4 = item.porte_aplicado ?? 0;
    const L5 = item.cajon_aplicado ?? 0;
    const L6 = item.irpf_aplicado ?? 0;

    const H18 = kilosTotales * precioVenta;
    const H19 = H18 * (L2 / 100);
    let H20 = nombreAsentador.includes('NAÑEZ') ? H18 - H19 : H18;
    const H21 = H20 * (L3 / 100);
    const H22 = H20 + H21;
    const A23 = kilosTotales * L4;
    const C23 = kilosTotales * L5;
    const E23 = H22 * (L6 / 100);
    const H23 = A23 + C23 + E23;
    const H24 = H22 - H23;

    return { H18, H19, H21, H22, A23, C23, E23, H23, H24 };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas 📑</Text>

      {/* --- SELECTOR DE FILTRO --- */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por familiar:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filtroSeleccionado}
            onValueChange={(itemValue) => filtrarPorMiembro(itemValue)}
          >
            <Picker.Item label="👨‍👩‍👧‍👦 Ver todos los miembros" value="TODOS" />
            {miembros.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B5E20" />
      ) : (
        <FlatList 
          data={entregasFiltradas} 
          keyExtractor={(item) => item.id} 
          renderItem={({ item }) => {
            const { H24 } = calcularExcelExacto(item);
            return (
              <TouchableOpacity style={styles.card} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                <View style={styles.cardMain}>
                  <View>
                    <Text style={styles.miembro}>{item.miembro_familia}</Text>
                    <Text style={styles.subtext}>{item.asentadores?.nombre} · {item.fecha}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.precioLista}>{item.precio_venta_bruto?.toFixed(2)} €/kg</Text>
                    <Text style={styles.netoLista}>{H24.toFixed(2)} €</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No hay datos para este filtro.</Text>}
        />
      )}

      {/* --- MODAL DE DETALLE (El mismo que el anterior) --- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalle Liquidación</Text>
            {selectedItem && (() => {
              const c = calcularExcelExacto(selectedItem);
              return (
                <ScrollView>
                  <View style={styles.calcRow}><Text>Miembro:</Text><Text style={styles.boldText}>{selectedItem.miembro_familia}</Text></View>
                  <View style={styles.calcRow}><Text>Kilos Totales:</Text><Text>{selectedItem.kilos_netos} kg</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.calcRow}><Text>Total Líquido:</Text><Text>{c.H18.toFixed(2)}€</Text></View>
                  <View style={styles.calcRow}><Text>IVA:</Text><Text>+{c.H21.toFixed(2)}€</Text></View>
                  <View style={[styles.calcRow, {backgroundColor: '#f1f8e9'}]}><Text style={styles.boldText}>BRUTO:</Text><Text style={styles.boldText}>{c.H22.toFixed(2)}€</Text></View>
                  <View style={styles.calcRow}><Text>Gtos (Porte+Cajón+IRPF):</Text><Text>-{c.H23.toFixed(2)}€</Text></View>
                  <View style={styles.resumenCaja}>
                    <Text style={styles.resumenLabel}>IMPORTE FINAL</Text>
                    <Text style={styles.resumenValor}>{c.H24.toFixed(2)} €</Text>
                  </View>
                </ScrollView>
              );
            })()}
            <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f0', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginBottom: 15 },
  filterContainer: { marginBottom: 20, backgroundColor: '#fff', padding: 10, borderRadius: 10, elevation: 2 },
  filterLabel: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: 'bold' },
  pickerWrapper: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 3 },
  cardMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miembro: { fontSize: 16, fontWeight: 'bold' },
  subtext: { fontSize: 12, color: '#666' },
  precioLista: { fontSize: 13, color: '#2E7D32' },
  netoLista: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  boldText: { fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  resumenCaja: { marginTop: 20, padding: 15, backgroundColor: '#1B5E20', borderRadius: 10, alignItems: 'center' },
  resumenLabel: { color: '#fff', fontSize: 12 },
  resumenValor: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  btnClose: { marginTop: 20, backgroundColor: '#444', padding: 15, borderRadius: 10, alignItems: 'center' }
});