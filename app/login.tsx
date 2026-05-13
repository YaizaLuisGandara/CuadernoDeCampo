import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // npx expo install @react-native-async-storage/async-storage

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados nuevos
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    cargarCredencialesGuardadas();
  }, []);

  // Carga el email si se guardó anteriormente
  async function cargarCredencialesGuardadas() {
    const savedEmail = await AsyncStorage.getItem('saved_email');
    const savedRemember = await AsyncStorage.getItem('remember_me');
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }

  async function handleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      // Lógica de recordar
      if (rememberMe) {
        await AsyncStorage.setItem('saved_email', email);
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('saved_email');
        await AsyncStorage.setItem('remember_me', 'false');
      }

      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error de acceso", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="fruit-cherries" size={80} color="#D32F2F" style={{ alignSelf: 'center' }} />
      <Text style={styles.title}>Cerezas App</Text>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry={!showPassword} // Aquí se controla la visibilidad
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialCommunityIcons 
            name={showPassword ? "eye-off" : "eye"} 
            size={22} 
            color="#D32F2F" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rememberRow}>
        <View style={styles.switchRow}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#ccc", true: "#ffcdd2" }}
            thumbColor={rememberMe ? "#D32F2F" : "#f4f3f4"}
          />
          <Text style={styles.rememberText}>Recordar mi correo</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginBtnText}>ENTRAR</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 30, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#333' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    marginBottom: 20,
    height: 55
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 10, color: '#666', fontSize: 14 },
  loginBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 2 },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});