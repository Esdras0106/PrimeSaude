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
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <Text style={styles.labelPerfil}>Perfil de Acesso (ADMIN, ATENDENTE, MEDICO, PACIENTE):</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: PACIENTE"
                value={perfil}
                onChangeText={setPerfil}
                autoCapitalize="characters"
            />

            {perfil.trim().toUpperCase() === 'MEDICO' && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="CRM"
                        value={crm}
                        onChangeText={setCrm}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Especialidade"
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
                        value={cpf}
                        onChangeText={setCpf}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Data Nascimento (AAAA-MM-DD)"
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
    container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FA' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#003366', textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
    labelPerfil: { fontSize: 13, color: '#333', marginBottom: 5, fontWeight: '600', marginTop: 10 },
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
    button: { backgroundColor: '#0056B3', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    linkButton: { marginTop: 15, alignItems: 'center' },
    linkText: { color: '#0056B3', fontSize: 14, fontWeight: '600' }
});