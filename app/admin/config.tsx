/**
 * (c) 2024 - 2026 Yaiza Luis Gándara
 * Todos los derechos reservados.
 * Este software es propiedad privada y su copia o distribución 
 * sin autorización está prohibida.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AdminConfig() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Detalle
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFincas, setUserFincas] = useState<any[]>([]);
  const [loadingFincas, setLoadingFincas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('email', { ascending: true });
    if (error) Alert.alert("Error", error.message);
    else setUsers(data || []);
    setLoading(false);
  }

  // Carga las fincas específicas del usuario seleccionado
  async function fetchUserFincas(userId: string) {
    setLoadingFincas(true);
    const { data, error } = await supabase
      .from('fincas')
      .select('*')
      .eq('user_id', userId); // columna en la tabla fincas que hace ref al usuario
    
    if (!error) setUserFincas(data || []);
    setLoadingFincas(false);
  }

  const openUserDetail = (user: any) => {
    setSelectedUser(user);
    setUserFincas([]);
    setModalVisible(true);
    fetchUserFincas(user.id);
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) setSelectedUser({...selectedUser, role: newRole});
    }
  };

  const enviarResetPassword = (email: string) => {
    Alert.alert(
      "Restablecer Clave",
      `¿Enviar correo de recuperación a ${email}?`,
      [
        { text: "Cancelar" },
        { text: "Enviar", onPress: async () => {
          await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'com.agricola.app://reset-password',
          });
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) Alert.alert("Error", error.message);
          else Alert.alert("Éxito", "Correo enviado correctamente.");
        }}
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} color="#1A237E" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.subtitle}>{users.length} usuarios en el sistema</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => openUserDetail(item)}>
            <View style={styles.userInfo}>
              <MaterialCommunityIcons 
                name={item.role === 'admin' ? "shield-account" : "account-circle"} 
                size={40} 
                color={item.role === 'admin' ? "#D32F2F" : "#1A237E"} 
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.emailText}>{item.email}</Text>
                <Text style={[styles.roleText, {color: item.role === 'admin' ? '#D32F2F' : '#666'}]}>
                  {item.role.toUpperCase()}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        )}
      />

      {/* MODAL DE DETALLE COMPLETO */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Ficha de Usuario</Text>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedUser?.email}</Text>
                
                <Text style={[styles.detailLabel, {marginTop: 15}]}>ID de Usuario:</Text>
                <Text style={styles.detailId}>{selectedUser?.id}</Text>
              </View>

              {/* ACCIONES RÁPIDAS */}
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={styles.actionCard} 
                  onPress={() => toggleRole(selectedUser?.id, selectedUser?.role)}
                >
                  <MaterialCommunityIcons 
                    name={selectedUser?.role === 'admin' ? "account-arrow-down" : "shield-check"} 
                    size={24} color="#1A237E" 
                  />
                  <Text style={styles.actionCardText}>
                    {selectedUser?.role === 'admin' ? "Quitar Admin" : "Hacer Admin"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionCard, {backgroundColor: '#FFF3E0'}]} 
                  onPress={() => enviarResetPassword(selectedUser?.email)}
                >
                  <MaterialCommunityIcons name="email-lock" size={24} color="#E65100" />
                  <Text style={[styles.actionCardText, {color: '#E65100'}]}>Reset Clave</Text>
                </TouchableOpacity>
              </View>

              {/* SECCIÓN DE FINCAS */}
              <Text style={styles.sectionTitle}>Fincas Asignadas</Text>
              {loadingFincas ? (
                <ActivityIndicator color="#1A237E" />
              ) : userFincas.length > 0 ? (
                userFincas.map((finca) => (
                  <View key={finca.id} style={styles.fincaMiniCard}>
                    <MaterialCommunityIcons name="tree" size={20} color="#2E7D32" />
                    <View style={{marginLeft: 10}}>
                      <Text style={styles.fincaName}>{finca.nombre}</Text>
                      <Text style={styles.fincaExtra}>{finca.cultivo} - {finca.municipio}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noFincas}>Este usuario no tiene fincas registradas.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitle: { fontSize: 14, color: '#666' },
  userCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emailText: { fontSize: 16, fontWeight: '600', color: '#333' },
  roleText: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  
  // Estilos Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  closeBtn: { alignSelf: 'flex-end', padding: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A237E', marginBottom: 20 },
  detailBox: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, marginBottom: 20 },
  detailLabel: { fontSize: 12, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
  detailValue: { fontSize: 18, color: '#333', fontWeight: '500' },
  detailId: { fontSize: 10, color: '#AAA', fontFamily: 'monospace' },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionCard: { backgroundColor: '#E8EAF6', flex: 0.48, padding: 15, borderRadius: 15, alignItems: 'center' },
  actionCardText: { marginTop: 8, fontSize: 12, fontWeight: 'bold', color: '#1A237E' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  fincaMiniCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F1F8E9', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#C8E6C9' },
  fincaName: { fontWeight: 'bold', color: '#2E7D32' },
  fincaExtra: { fontSize: 11, color: '#666' },
  noFincas: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }
});