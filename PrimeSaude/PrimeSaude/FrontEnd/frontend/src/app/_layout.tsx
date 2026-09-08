import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function NavigationLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a2e22' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'PrimeSaúde' }} />
      <Stack.Screen name="agendar" options={{ title: 'Agendamento de Consulta' }} />
      <Stack.Screen name="consultas" options={{ title: 'Consultas' }} />
      <Stack.Screen name="usuarios" options={{ title: 'Usuários' }} />
      <Stack.Screen name="medicos" options={{ title: 'Médicos' }} />
      <Stack.Screen name="pacientes" options={{ title: 'Pacientes' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(192, 57, 43, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.4)',
  },
  logoutText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 13,
  },
});