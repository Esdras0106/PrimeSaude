<<<<<<< HEAD:PrimeSaude/FrontEnd/frontend/src/app/agendar.tsx
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, View } from 'react-native';
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
    const [cadastroDesativado, setCadastroDesativado] = useState('');
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
                const mensagemErro = resData.error || 'Falha ao agendar consulta.';
                const cadastroInativo = response.status === 409 &&
                    (mensagemErro.includes('paciente inativo') || mensagemErro.includes('médico inativo'));

                if (cadastroInativo) {
                    setCadastroDesativado(
                        `${mensagemErro}\n\nVerifique o cadastro e selecione um paciente ou médico ativo para continuar.`
                    );
                } else {
                    Alert.alert('Erro no Agendamento', mensagemErro);
                }
                return;
            }

            Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
            reset();
        } catch (error) {
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor backend.');
        }
    };

    return (
        <View style={styles.screen}>
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
        <Modal
            visible={Boolean(cadastroDesativado)}
            transparent
            animationType="fade"
            onRequestClose={() => setCadastroDesativado('')}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Cadastro desativado</Text>
                    <Text style={styles.modalMessage}>{cadastroDesativado}</Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setCadastroDesativado('')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.modalButtonText}>Entendi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f4f6f5' },
    container: { padding: 20, backgroundColor: '#f4f6f5', flexGrow: 1 },
    welcomeText: { fontSize: 14, color: '#1a2e22', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#1a2e22', marginBottom: 5 },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#dfe7e2',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
        color: '#1a2e22',
    },
    errorText: { color: '#b42318', fontSize: 12, marginBottom: 10 },
    button: { backgroundColor: '#2d5a40', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(26, 46, 34, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 24,
        borderWidth: 1,
        borderColor: '#dfe7e2',
    },
    modalTitle: { color: '#1a2e22', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    modalMessage: { color: '#303a35', fontSize: 15, lineHeight: 22, marginBottom: 20 },
    modalButton: { backgroundColor: '#2d5a40', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
=======
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
    container: { padding: 20, backgroundColor: '#f4f6f5', flexGrow: 1 },
    welcomeText: { fontSize: 14, color: '#1a2e22', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#1a2e22', marginBottom: 5 },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#dfe7e2',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
        color: '#1a2e22',
    },
    errorText: { color: '#b42318', fontSize: 12, marginBottom: 10 },
    button: { backgroundColor: '#2d5a40', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/FrontEnd/frontend/src/app/agendar.tsx
});