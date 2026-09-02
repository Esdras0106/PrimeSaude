import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface FormData {
    idPaciente: string;
    idMedico: string;
    dataConsulta: string;
    horaConsulta: string;
    motivo: string;
    observacoes: string;
}

export default function AgendamentoConsultaScreen() {
    const { token, user } = useAuth(); // Recupera o Token e o Usuário logado
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: { idPaciente: '', idMedico: '', dataConsulta: '', horaConsulta: '', motivo: '', observacoes: '' }
    });

    const onSubmit = async (data: FormData) => {
        if (!token) {
            Alert.alert('Sessão Expirada', 'Por favor, realize o login novamente.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/consultas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envio do JWT para validações (RF-002/RF-039)
                },
                body: JSON.stringify(data)
            });

            const resData = await response.json();

            if (!response.ok) {
                Alert.alert('Erro no Agendamento', resData.error || 'Falha ao agendar consulta.');
                return;
            }

            Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
            reset();
        } catch (error) {
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor backend.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.welcomeText}>Operador: {user?.nome} ({user?.perfil})</Text>

            <Text style={styles.label}>ID do Paciente *</Text>
            <Controller
                control={control}
                rules={{ required: 'ID do Paciente é obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" placeholder="Ex: 1" />
                )}
                name="idPaciente"
            />
            {errors.idPaciente && <Text style={styles.errorText}>{errors.idPaciente.message}</Text>}

            <Text style={styles.label}>ID do Médico *</Text>
            <Controller
                control={control}
                rules={{ required: 'ID do Médico é obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" placeholder="Ex: 2" />
                )}
                name="idMedico"
            />
            {errors.idMedico && <Text style={styles.errorText}>{errors.idMedico.message}</Text>}

            <Text style={styles.label}>Data da Consulta (AAAA-MM-DD) *</Text>
            <Controller
                control={control}
                rules={{ required: 'Data é obrigatória' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="2026-09-10" />
                )}
                name="dataConsulta"
            />
            {errors.dataConsulta && <Text style={styles.errorText}>{errors.dataConsulta.message}</Text>}

            <Text style={styles.label}>Hora da Consulta (HH:MM) *</Text>
            <Controller
                control={control}
                rules={{ required: 'Horário é obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="14:30" />
                )}
                name="horaConsulta"
            />
            {errors.horaConsulta && <Text style={styles.errorText}>{errors.horaConsulta.message}</Text>}

            <Text style={styles.label}>Motivo</Text>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ex: Consulta de rotina" />
                )}
                name="motivo"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>Confirmar Agendamento</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#F5F7FA', flexGrow: 1 },
    welcomeText: { fontSize: 14, color: '#003366', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
    errorText: { color: '#D9534F', fontSize: 12, marginBottom: 10 },
    button: { backgroundColor: '#0056B3', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});