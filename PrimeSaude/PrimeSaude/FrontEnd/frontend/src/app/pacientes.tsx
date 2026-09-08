import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

type Paciente = {
  idPaciente: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
};

export default function PacientesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPacientes = async () => {
      if (!token) {
        setLoading(false);
        setErrorMessage('Sessão expirada. Faça login novamente.');
        router.replace('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/pacientes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await response.text();
        let data: any = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(text || 'Resposta inválida do servidor.');
        }

        if (!response.ok) {
          throw new Error(data?.error || `Erro ${response.status}: não foi possível carregar os pacientes.`);
        }

        setPacientes(Array.isArray(data) ? data : []);
        setErrorMessage('');
      } catch (error: any) {
        console.error('Erro ao buscar pacientes:', error);
        setPacientes([]);
        setErrorMessage(error.message || 'Não foi possível carregar os pacientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Pacientes</Text>
      <Text style={styles.subtitle}>Pacientes cadastrados no sistema.</Text>

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Erro ao buscar pacientes: {errorMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#2d5a40" />
          <Text style={styles.loadingText}>Carregando pacientes...</Text>
        </View>
      ) : pacientes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum paciente cadastrado.</Text>
        </View>
      ) : (
        pacientes.map((paciente) => (
          <View key={paciente.idPaciente} style={styles.card}>
            <Text style={styles.cardTitle}>{paciente.nome}</Text>
            <Text style={styles.item}>CPF: {paciente.cpf}</Text>
            <Text style={styles.item}>Nascimento: {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.item}>E-mail: {paciente.email}</Text>
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
  errorCard: {
    backgroundColor: 'rgba(192, 57, 43, 0.12)',
    borderColor: 'rgba(192, 57, 43, 0.45)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#8e1d1d',
    fontSize: 13,
    fontWeight: '600',
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
