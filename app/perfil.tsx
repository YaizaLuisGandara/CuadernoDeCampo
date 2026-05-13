/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function PerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{email: string, role: string, id: string} | null>(null);
  
  // Estados para el Modal de Contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserData({ id: user.id, email: user.email || '', role: profile?.role || 'agricultor' });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleUpdatePassword() {
    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("¡Éxito!", "Contraseña actualizada correctamente.");
      setModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#D32F2F" />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={60} color="white" />
        </View>
        <Text style={styles.userEmail}>{userData?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: userData?.role === 'admin' ? '#1A237E' : '#2E7D32' }]}>
          <Text style={styles.roleText}>{userData?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* OPCIONES */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.optionItem} onPress={() => setModalVisible(true)}>
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="lock-reset" size={24} color="#1976D2" />
          </View>
          <Text style={styles.optionText}>Cambiar mi Contraseña</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* MODAL CAMBIO CONTRASEÑA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Contraseña</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.modalInput}
                placeholder="Nueva contraseña"
                secureTextEntry={!showPass}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <MaterialCommunityIcons name={showPass ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={[styles.modalInput, { marginBottom: 20 }]}
                placeholder="Confirmar contraseña"
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <MaterialCommunityIcons name={showPass ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdatePassword} disabled={updating}>
                {updating ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Actualizar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await supabase.auth.signOut(); router.replace('/login'); }}>
        <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />
        <Text style={styles.logoutBtnText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerCard: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', marginTop: 20, elevation: 4 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userEmail: { fontSize: 18, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 15, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  roleText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  section: { marginTop: 30 },
  optionItem: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionText: { flex: 1, fontWeight: '500' },
  logoutBtn: { marginTop: 'auto', marginBottom: 30, flexDirection: 'row', backgroundColor: '#FFEBEE', padding: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  logoutBtnText: { color: '#D32F2F', fontWeight: 'bold', marginLeft: 10 },
  // Estilos Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', marginBottom: 15 },
  modalInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  confirmBtn: { flex: 1, backgroundColor: '#D32F2F', padding: 15, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' }
});