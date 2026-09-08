import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

type Medico = {
  idMedico: number;
  nome: string;
  crm: string;
  especialidade: string;
  email: string;
};

export default function MedicosScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicos = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/medicos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Não foi possível carregar os médicos.');
        }

        setMedicos(data);
      } catch (error: any) {
        console.error('Erro ao buscar médicos:', error);
        setMedicos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Corpo Médico</Text>
      <Text style={styles.subtitle}>Médicos cadastrados no sistema.</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#2d5a40" />
          <Text style={styles.loadingText}>Carregando médicos...</Text>
        </View>
      ) : medicos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum médico cadastrado.</Text>
        </View>
      ) : (
        medicos.map((medico) => (
          <View key={medico.idMedico} style={styles.card}>
            <Text style={styles.cardTitle}>{medico.nome}</Text>
            <Text style={styles.item}>CRM: {medico.crm}</Text>
            <Text style={styles.item}>Especialidade: {medico.especialidade}</Text>
            <Text style={styles.item}>E-mail: {medico.email}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
        <Text style={styles.primaryButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f6f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2e22',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5a52',
    marginBottom: 20,
  },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8e4',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#1a2e22',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8e4',
    marginBottom: 20,
  },
  emptyText: {
    color: '#4b5a52',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8e4',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2e22',
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    color: '#303a35',
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#2d5a40',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
