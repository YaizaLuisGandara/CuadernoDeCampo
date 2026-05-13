import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function AjustesAsentadores() {
  const [loading, setLoading] = useState(false);
  const [asentadores, setAsentadores] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({
    comision_pct: '12.5',
    iva_pct: '12',
    porte_fijo: '0.17',
    cajon_fijo: '0.21',
    irpf_pct: '2',
    tipo_calculo: 'nanez'
  });

  useEffect(() => { cargarAsentadores(); }, []);

  async function cargarAsentadores() {
    const { data } = await supabase.from('asentadores').select('*');
    if (data) {
      setAsentadores(data);
      if (data.length > 0) seleccionarAsentador(data[0]);
    }
  }

  const seleccionarAsentador = (asentador: any) => {
    setSelectedId(asentador.id);
    setForm({
      comision_pct: asentador.comision_pct?.toString() || '0',
      iva_pct: asentador.iva_pct?.toString() || '0',
      porte_fijo: asentador.porte_fijo?.toString() || '0',
      cajon_fijo: asentador.cajon_fijo?.toString() || '0',
      irpf_pct: asentador.irpf_pct?.toString() || '0',
      tipo_calculo: asentador.tipo_calculo || 'nanez'
    });
  };

  async function guardarAjustes() {
    setLoading(true);
    const { error } = await supabase.from('asentadores').update({
      comision_pct: parseFloat(form.comision_pct.replace(',', '.')),
      iva_pct: parseFloat(form.iva_pct.replace(',', '.')),
      porte_fijo: parseFloat(form.porte_fijo.replace(',', '.')),
      cajon_fijo: parseFloat(form.cajon_fijo.replace(',', '.')),
      irpf_pct: parseFloat(form.irpf_pct.replace(',', '.')),
      tipo_calculo: form.tipo_calculo
    }).eq('id', selectedId);

    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Éxito", "Configuración del asentador guardada.");
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración de Asentadores ⚙️</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Selecciona Asentador para configurar:</Text>
        <Picker
          selectedValue={selectedId}
          onValueChange={(itemValue) => {
            const a = asentadores.find(i => i.id === itemValue);
            if (a) seleccionarAsentador(a);
          }}
        >
          {asentadores.map(a => <Picker.Item key={a.id} label={a.nombre} value={a.id} />)}
        </Picker>

        <View style={styles.row}>
          <View style={{flex:1, marginRight:10}}>
            <Text style={styles.subLabel}>% Comisión</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.comision_pct} onChangeText={(t)=>setForm({...form, comision_pct:t})} />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.subLabel}>% IVA</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.iva_pct} onChangeText={(t)=>setForm({...form, iva_pct:t})} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{flex:1, marginRight:10}}>
            <Text style={styles.subLabel}>Porte (€/kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.porte_fijo} onChangeText={(t)=>setForm({...form, porte_fijo:t})} />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.subLabel}>Cajón (€/kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.cajon_fijo} onChangeText={(t)=>setForm({...form, cajon_fijo:t})} />
          </View>
        </View>

        <Text style={styles.subLabel}>Modelo de Cálculo</Text>
        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={[styles.typeBtn, form.tipo_calculo === 'nanez' && styles.typeBtnActive]}
            onPress={() => setForm({...form, tipo_calculo: 'nanez'})}
          >
            <Text style={form.tipo_calculo === 'nanez' ? styles.btnTextActive : {}}>NAÑEZ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, form.tipo_calculo === 'rafael' && styles.typeBtnActive]}
            onPress={() => setForm({...form, tipo_calculo: 'rafael'})}
          >
            <Text style={form.tipo_calculo === 'rafael' ? styles.btnTextActive : {}}>RAFAEL</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={guardarAjustes} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 3 },
  row: { flexDirection: 'row', marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  subLabel: { fontSize: 12, color: '#666' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 5, fontSize: 16 },
  btnGroup: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', borderRadius: 8 },
  typeBtnActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  btnTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1B5E20', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});