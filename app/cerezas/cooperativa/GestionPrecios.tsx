import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function GestionPrecios() {
  const [cat, setCat] = useState('');
  const [precio, setPrecio] = useState('');
  const [fInicio, setFInicio] = useState(''); // Formato YYYY-MM-DD
  const [fFin, setFFin] = useState('');

  const guardarPrecio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('precios_calibres').insert({
      user_id: user?.id,
      categoria: cat.toUpperCase(),
      precio: parseFloat(precio),
      fecha_inicio: fInicio,
      fecha_fin: fFin
    });
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Éxito", "Precio guardado");
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Categoría (ej: MAGNA)" onChangeText={setCat} style={styles.input} />
      <TextInput placeholder="Precio (€/kg)" onChangeText={setPrecio} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Fecha Inicio (YYYY-MM-DD)" onChangeText={setFInicio} style={styles.input} />
      <TextInput placeholder="Fecha Fin (YYYY-MM-DD)" onChangeText={setFFin} style={styles.input} />
      <Button title="Guardar Precio" onPress={guardarPrecio} color="#15803d" />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 20 }, input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 } });