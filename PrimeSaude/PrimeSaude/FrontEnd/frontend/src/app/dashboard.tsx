import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const perfil = user?.perfil?.toUpperCase();

  // Permissões ajustadas de acordo com as especificações de requisitos
  const eAdmin = perfil === 'ADMIN';
  const podeAgendar = perfil === 'ATENDENTE';
  const podeVerConsultas = ['ATENDENTE', 'MEDICO', 'PACIENTE'].includes(perfil || '');

  return (
    <ScrollView style={styles.container}>
      {/* Banner de boas-vindas */}
      <View style={styles.headerCard}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.welcome}>Bem-vindo(a), {user?.nome || 'Usuário'}!</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.perfil || 'PERFIL NÃO DEFINIDO'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulos Disponíveis</Text>

      {/* Painel do Administrador (Gestão do Sistema) */}
      {eAdmin && (
        <>
          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => router.push('/usuarios' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>👤</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.menuTitle}>Gestão de Usuários</Text>
                <Text style={styles.menuSub}>Cadastrar, listar, ativar ou inativar acessos do sistema</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => router.push('/medicos' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>🩺</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.menuTitle}>Corpo Médico</Text>
                <Text style={styles.menuSub}>Cadastrar e vincular médicos com CRM e especialidades</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => router.push('/pacientes' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.menuTitle}>Cadastro de Pacientes</Text>
                <Text style={styles.menuSub}>Gerenciar registros de pacientes da clínica</Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Módulo de Agendamento (Exclusivo do Atendente) */}
      {podeAgendar && (
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => router.push('/agendar')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>+</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.menuTitle}>Agendar Nova Consulta</Text>
              <Text style={styles.menuSub}>Marcar horários para médicos e pacientes</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Módulo de Visualização de Agendamentos */}
      {podeVerConsultas && (
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => router.push('/consultas' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBoxSecondary}>
              <Text style={styles.cardIconSecondary}>📅</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.menuTitle}>
                {perfil === 'MEDICO' && 'Minha Agenda'}
                {perfil === 'PACIENTE' && 'Meus Agendamentos'}
                {perfil === 'ATENDENTE' && 'Consultas Agendadas'}
              </Text>
              <Text style={styles.menuSub}>
                {perfil === 'MEDICO' && 'Visualizar horários de atendimento e pacientes'}
                {perfil === 'PACIENTE' && 'Acompanhar histórico e próximos agendamentos'}
                {perfil === 'ATENDENTE' && 'Visualizar a agenda completa da clínica'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6f5' },
  headerCard: {
    backgroundColor: '#1a2e22',
    padding: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(122, 184, 154, 0.2)',
  },
  userBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d5a40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#7ab89a',
  },
  userBadgeText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  welcome: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(122, 184, 154, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  roleText: { color: '#7ab89a', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a2e22', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8e4',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2d5a40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardIconBoxSecondary: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 90, 64, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconSecondary: { fontSize: 18 },
  cardTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a2e22' },
  menuSub: { fontSize: 12, color: '#60646C', marginTop: 2 },
});