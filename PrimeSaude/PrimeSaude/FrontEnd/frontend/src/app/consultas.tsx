import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ConsultasScreen() {
    const [consultas, setConsultas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [observacoes, setObservacoes] = useState<{ [key: number]: string }>({});
    const [salvando, setSalvando] = useState<number | null>(null);
    const { token, user } = useAuth();

    const perfilUpper = user?.perfil ? user.perfil.toUpperCase() : '';
    const isMedicoOuAdmin = perfilUpper === 'MEDICO' || perfilUpper === 'ADMIN';

    useEffect(() => {
        fetchConsultas();
    }, [token]);

    const fetchConsultas = async () => {
        try {
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3000/api/consultas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Erro', data.error || 'Não foi possível carregar as consultas.');
                return;
            }

            setConsultas(data);

            const obsIniciais: { [key: number]: string } = {};
            data.forEach((item: any) => {
                obsIniciais[item.idConsulta] = item.observacoes || '';
            });
            setObservacoes(obsIniciais);
        } catch (error) {
            console.error('Erro ao buscar consultas:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleConcluirConsulta = async (idConsulta: number) => {
        try {
            setSalvando(idConsulta);
            const response = await fetch(`http://localhost:3000/api/consultas/${idConsulta}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'CONCLUIDO',
                    observacoes: observacoes[idConsulta] || ''
                })
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Erro', data.error || 'Falha ao concluir a consulta.');
                return;
            }

            Alert.alert('Sucesso', 'Consulta concluída com sucesso!');
            fetchConsultas();
        } catch (error) {
            console.error('Erro ao atualizar consulta:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        } finally {
            setSalvando(null);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const podeEditar = isMedicoOuAdmin && item.status === 'AGENDADA';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.date}>{formatarData(item.dataConsulta)} às {item.horaConsulta}</Text>
                    <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
                </View>

                <Text style={styles.text}><Text style={styles.bold}>Paciente:</Text> {item.pacienteNome}</Text>
                <Text style={styles.text}><Text style={styles.bold}>Médico:</Text> {item.medicoNome}</Text>

                {item.motivo ? (
                    <Text style={styles.text}><Text style={styles.bold}>Motivo:</Text> {item.motivo}</Text>
                ) : null}

                {/* Edição permitida para Médico/Admin em consultas pendentes */}
                {podeEditar ? (
                    <View style={styles.actionContainer}>
                        <Text style={styles.labelObs}>Observações Médicas:</Text>
                        <TextInput
                            style={styles.inputObs}
                            placeholder="Digite as observações da consulta..."
                            multiline
                            numberOfLines={3}
                            value={observacoes[item.idConsulta] || ''}
                            onChangeText={(text) => setObservacoes({ ...observacoes, [item.idConsulta]: text })}
                        />
                        <TouchableOpacity 
                            style={styles.buttonConcluir} 
                            onPress={() => handleConcluirConsulta(item.idConsulta)}
                            disabled={salvando === item.idConsulta}
                        >
                            <Text style={styles.buttonText}>
                                {salvando === item.idConsulta ? 'Salvando...' : 'Concluir Consulta'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Exibição formatada das observações atualizadas para ATENDENTE e demais perfis */
                    item.observacoes ? (
                        <View style={styles.obsDisplayContainer}>
                            <Text style={styles.text}>
                                <Text style={styles.bold}>Observações do Médico:</Text> {item.observacoes}
                            </Text>
                        </View>
                    ) : null
                )}
            </View>
        );
    };

    const formatarData = (dataIso: string) => {
        if (!dataIso) return '';
        const data = new Date(dataIso);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'AGENDADA': return { color: '#B8860B' };
            case 'REALIZADA':
            case 'CONCLUIDO': return { color: '#28A745' };
            case 'CANCELADA': return { color: '#DC3545' };
            default: return { color: '#666' };
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0056B3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Agendamentos</Text>
            
            {consultas.length === 0 ? (
                <Text style={styles.empty}>Nenhuma consulta encontrada para o seu perfil.</Text>
            ) : (
                <FlatList
                    data={consultas}
                    keyExtractor={(item) => item.idConsulta.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f5', padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1a2e22', marginBottom: 20, textAlign: 'center', marginTop: 10 },
    list: { paddingBottom: 20 },
    empty: { textAlign: 'center', color: '#4b5a52', fontSize: 16, marginTop: 40 },
    card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E1E4E8', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
    date: { fontSize: 16, fontWeight: 'bold', color: '#1a2e22' },
    status: { fontSize: 14, fontWeight: 'bold' },
    text: { fontSize: 15, color: '#303a35', marginBottom: 4 },
    bold: { fontWeight: '600', color: '#1a2e22' },
    actionContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
    obsDisplayContainer: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    labelObs: { fontSize: 14, fontWeight: '600', color: '#1a2e22', marginBottom: 6 },
    inputObs: { backgroundColor: '#F9FBFD', borderWidth: 1, borderColor: '#dfe7e2', borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: 'top', marginBottom: 10, color: '#1a2e22' },
    buttonConcluir: { backgroundColor: '#2d5a40', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});