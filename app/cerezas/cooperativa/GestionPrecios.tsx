import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function GestionPrecios() {
  const [cat, setCat] = useState('');
  const [precio, setPrecio] = useState('');
  const [fInicio, setFInicio] = useState('');
  const [fFin, setFFin] = useState('');
  const [precios, setPrecios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPrecios();
  }, []);

  const cargarPrecios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('precios_calibres')
      .select('*')
      .order('fecha_inicio', { ascending: false });
    
    if (error) Alert.alert("Error", error.message);
    else setPrecios(data || []);
    setLoading(false);
  };

  const guardarPrecio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('precios_calibres').insert({
      user_id: user?.id,
      categoria: cat.toUpperCase().trim(),
      precio: parseFloat(precio),
      fecha_inicio: fInicio,
      fecha_fin: fFin
    });

    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Éxito", "Precio guardado");
      setCat(''); setPrecio(''); 
      cargarPrecios(); // Recarga la lista tras insertar
    }
  };

  const eliminarPrecio = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este precio?", [
      { text: "Cancelar" },
      { 
        text: "Eliminar", 
        style: 'destructive', 
        onPress: async () => {
          const { error } = await supabase.from('precios_calibres').delete().eq('id', id);
          if (error) Alert.alert("Error", error.message);
          else cargarPrecios(); // <-- Esto garantiza que la lista se actualice
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Botón de Refresco Manual */}
      <View style={styles.header}>
        <Text style={styles.title}>Precios</Text>
        <TouchableOpacity onPress={cargarPrecios} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="refresh" size={24} color="#15803d" />
        </TouchableOpacity>
      </View>

      <TextInput placeholder="Categoría (ej: MAGNA)" value={cat} onChangeText={setCat} style={styles.input} />
      <TextInput placeholder="Precio (€/kg)" value={precio} onChangeText={setPrecio} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Inicio (YYYY-MM-DD)" value={fInicio} onChangeText={setFInicio} style={styles.input} />
      <TextInput placeholder="Fin (YYYY-MM-DD)" value={fFin} onChangeText={setFFin} style={styles.input} />
      <Button title="Guardar Precio" onPress={guardarPrecio} color="#15803d" />

      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={precios}
          keyExtractor={(item) => item.id.toString()}
          style={{marginTop: 20}}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.catText}>{item.categoria}</Text>
                <Text style={styles.dateText}>{item.fecha_inicio} al {item.fecha_fin}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.precioText}>{item.precio}€</Text>
                <TouchableOpacity onPress={() => eliminarPrecio(item.id)} style={{marginLeft: 15}}>
                  <MaterialCommunityIcons name="trash-can" size={24} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  refreshBtn: { padding: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: 'white' },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', marginBottom: 8, borderRadius: 8, alignItems: 'center' },
  catText: { fontWeight: 'bold', fontSize: 16 },
  dateText: { fontSize: 12, color: '#666' },
  precioText: { fontWeight: 'bold', fontSize: 16, color: '#15803d' }
});