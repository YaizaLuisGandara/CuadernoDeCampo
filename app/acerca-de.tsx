import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AcercaDe() {
  const anioActual = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Icono de la App (puedes cambiarlo por un logo) */}
        <MaterialCommunityIcons name="apple-safari" size={80} color="#1B5E20" />
        <Text style={styles.appName}>Gestión Campaña</Text>
        <Text style={styles.version}>Versión 1.0.0</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedad Intelectual</Text>
          <Text style={styles.text}>
            Esta aplicación ha sido diseñada y desarrollada íntegramente por:
          </Text>
          <Text style={styles.autorName}>Yaiza Luis Gándara</Text>
          <Text style={styles.text}>
            Todos los derechos de autor, lógica de cálculo y estructura de datos
            están protegidos por la licencia de propiedad privada del autor.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finalidad</Text>
          <Text style={styles.text}>
            Herramienta creada para el control de entregas, cálculo automático 
            de liquidaciones y transparencia en la gestión de la campaña agrícola familiar.
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#1B5E20" />
          <Text style={styles.cardText}>
            Software verificado y conectado de forma segura con Supabase Cloud.
          </Text>
        </View>

        <Text style={styles.copyright}>
          © {anioActual} Yaiza · Todos los derechos reservados.
        </Text>
        
        <Text style={styles.prohibido}>
          Queda prohibida la reproducción total o parcial de esta herramienta sin permiso expreso del autor.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  header: { 
    alignItems: 'center', 
    paddingVertical: 40, 
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4
  },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#1B5E20', marginTop: 10 },
  version: { fontSize: 14, color: '#666', marginTop: 5 },
  content: { padding: 25 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B5E20', textTransform: 'uppercase', marginBottom: 10 },
  text: { fontSize: 15, color: '#444', lineHeight: 22 },
  autorName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  cardInfo: { 
    flexDirection: 'row', 
    backgroundColor: '#E8F5E9', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 30
  },
  cardText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#2E7D32', fontWeight: '500' },
  copyright: { textAlign: 'center', fontSize: 13, color: '#333', fontWeight: 'bold' },
  prohibido: { textAlign: 'center', fontSize: 11, color: '#999', marginTop: 10, fontStyle: 'italic', paddingHorizontal: 20 }
});