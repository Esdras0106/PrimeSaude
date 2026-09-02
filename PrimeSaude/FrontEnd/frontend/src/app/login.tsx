import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroMsg, setErroMsg] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setErroMsg('');

    if (!email || !senha) {
      setErroMsg('Informe o e-mail e a senha.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          senha: senha.trim() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErroMsg(data.error || `Erro ${response.status}: Falha ao autenticar.`);
        return;
      }

      login(data.token, data.user);
      router.replace('/dashboard');
    } catch (error: any) {
      console.error("Erro no Login:", error);
      setErroMsg(error.message || 'Falha de comunicação com o servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Logo Badge do Figma */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>P</Text>
        </View>

        <Text style={styles.title}>PrimeSaúde</Text>
        <Text style={styles.subtitle}>SISTEMA DE GESTÃO DE SAÚDE</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardSubtitle}>Insira suas credenciais para entrar no sistema</Text>

          {erroMsg ? <Text style={styles.errorBox}>{erroMsg}</Text> : null}

          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@primesaude.com"
            placeholderTextColor="rgba(200, 221, 208, 0.4)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(200, 221, 208, 0.4)"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar no Sistema</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/cadastro')}>
            <Text style={styles.linkText}>Não tem conta? <Text style={styles.linkHighlight}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#1a2e22' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2d5a40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 184, 154, 0.3)',
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 10, letterSpacing: 2, color: 'rgba(200, 221, 208, 0.7)', textAlign: 'center', marginBottom: 24, marginTop: 2 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#15241b',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 184, 154, 0.2)',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: 'rgba(200, 221, 208, 0.6)', marginBottom: 20 },
  errorBox: {
    backgroundColor: 'rgba(192, 57, 43, 0.2)',
    color: '#ff8e8e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.4)',
    fontSize: 13,
  },
  label: { fontSize: 10, fontWeight: 'bold', color: '#c8ddd0', marginBottom: 6, letterSpacing: 1 },
  input: {
    backgroundColor: '#1a2e22',
    borderWidth: 1,
    borderColor: 'rgba(122, 184, 154, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#FFF',
  },
  button: {
    backgroundColor: '#2d5a40',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(122, 184, 154, 0.3)',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: 'rgba(200, 221, 208, 0.7)', fontSize: 13 },
  linkHighlight: { color: '#7ab89a', fontWeight: 'bold' },
});