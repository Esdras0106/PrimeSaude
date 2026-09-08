import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('ATENDENTE'); // Padrão

    // Campos Extras
    const [crm, setCrm] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');

    const router = useRouter();

    const handleRegister = async () => {
        if (!nome || !email || !senha || !perfil) {
            Alert.alert('Atenção', 'Preencha todos os campos básicos.');
            return;
        }

        const perfilUpper = perfil.trim().toUpperCase();

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome, 
                    email, 
                    senha, 
                    perfil: perfilUpper,
                    crm, 
                    especialidade, 
                    cpf, 
                    dataNascimento 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Erro no Cadastro', data.error || 'Não foi possível cadastrar.');
                return;
            }

            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
            router.replace('/login');
        } catch (error) {
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor backend.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Cadastre-se no sistema PrimeSaúde</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                placeholderTextColor="#6a7d71"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#6a7d71"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#6a7d71"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <Text style={styles.labelPerfil}>Perfil de Acesso (ADMIN, ATENDENTE, MEDICO, PACIENTE):</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: PACIENTE"
                placeholderTextColor="#6a7d71"
                value={perfil}
                onChangeText={setPerfil}
                autoCapitalize="characters"
            />

            {perfil.trim().toUpperCase() === 'MEDICO' && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="CRM"
                        placeholderTextColor="#6a7d71"
                        value={crm}
                        onChangeText={setCrm}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Especialidade"
                        placeholderTextColor="#6a7d71"
                        value={especialidade}
                        onChangeText={setEspecialidade}
                    />
                </>
            )}

            {perfil.trim().toUpperCase() === 'PACIENTE' && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="CPF (Somente números)"
                        placeholderTextColor="#6a7d71"
                        value={cpf}
                        onChangeText={setCpf}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Data Nascimento (AAAA-MM-DD)"
                        placeholderTextColor="#6a7d71"
                        value={dataNascimento}
                        onChangeText={setDataNascimento}
                    />
                </>
            )}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Já possui uma conta? Faça login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4f6f5' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1a2e22', textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#4b5a52', textAlign: 'center', marginBottom: 20 },
    labelPerfil: { fontSize: 13, color: '#1a2e22', marginBottom: 5, fontWeight: '600', marginTop: 10 },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#dfe7e2',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 16,
        color: '#1a2e22',
    },
    button: { backgroundColor: '#2d5a40', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    linkButton: { marginTop: 15, alignItems: 'center' },
    linkText: { color: '#2d5a40', fontSize: 14, fontWeight: '600' }
});