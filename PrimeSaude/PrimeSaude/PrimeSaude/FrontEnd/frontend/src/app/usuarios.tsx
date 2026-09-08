import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

type Usuario = {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  dataCadastro: string;
};

export default function UsuariosScreen() {
  const router = useRouter();
<<<<<<< HEAD:PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx
  const { token, user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const isAdmin = user?.perfil?.toUpperCase() === 'ADMIN';

  const alterarStatusUsuario = async (usuario: Usuario) => {
    if (!token || !isAdmin) {
      setErrorMessage('Apenas o administrador pode alterar o status de usuários.');
      return;
    }

    try {
      setUpdatingId(usuario.idUsuario);
      setErrorMessage('');

      const response = await fetch(`http://localhost:3000/api/usuarios/${usuario.idUsuario}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo: !usuario.ativo }),
      });

      const text = await response.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(text || 'Resposta inválida do servidor.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Erro ${response.status}: não foi possível alterar o status.`);
      }

      setUsuarios((prev) =>
        prev.map((item) =>
          item.idUsuario === usuario.idUsuario ? { ...item, ativo: !item.ativo } : item
        )
      );
    } catch (error: any) {
      console.error('Erro ao atualizar status do usuário:', error);
      setErrorMessage(error.message || 'Não foi possível atualizar o status do usuário.');
    } finally {
      setUpdatingId(null);
    }
  };
=======
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!token) {
        setLoading(false);
        setErrorMessage('Sessão expirada. Faça login novamente.');
        router.replace('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/usuarios', {
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
          throw new Error(data?.error || `Erro ${response.status}: não foi possível carregar os usuários.`);
        }

        setUsuarios(Array.isArray(data) ? data : []);
        setErrorMessage('');
      } catch (error: any) {
        console.error('Erro ao buscar usuários:', error);
        setUsuarios([]);
        setErrorMessage(error.message || 'Não foi possível carregar os usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestão de Usuários</Text>
      <Text style={styles.subtitle}>Usuários cadastrados no sistema.</Text>

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Erro ao buscar usuários: {errorMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#2d5a40" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      ) : usuarios.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum usuário cadastrado.</Text>
        </View>
      ) : (
        usuarios.map((usuario) => (
          <View key={usuario.idUsuario} style={styles.card}>
            <Text style={styles.cardTitle}>{usuario.nome}</Text>
            <Text style={styles.item}>E-mail: {usuario.email}</Text>
            <Text style={styles.item}>Perfil: {usuario.perfil}</Text>
<<<<<<< HEAD:PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx
            <View style={styles.statusRow}>
              <Text style={styles.item}>Status:</Text>
              <View style={[styles.statusBadge, usuario.ativo ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, usuario.ativo ? styles.activeText : styles.inactiveText]}>
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            <Text style={styles.item}>Data cadastro: {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}</Text>

            {isAdmin ? (
              <TouchableOpacity
                style={[styles.actionButton, usuario.ativo ? styles.desativarButton : styles.ativarButton]}
                onPress={() => alterarStatusUsuario(usuario)}
                disabled={updatingId === usuario.idUsuario}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>
                  {updatingId === usuario.idUsuario
                    ? 'Atualizando...'
                    : usuario.ativo
                      ? 'Desativar usuário'
                      : 'Ativar usuário'}
                </Text>
              </TouchableOpacity>
            ) : null}
=======
            <Text style={styles.item}>Status: {usuario.ativo ? 'Ativo' : 'Inativo'}</Text>
            <Text style={styles.item}>Data cadastro: {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}</Text>
>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx
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
<<<<<<< HEAD:PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  activeBadge: {
    backgroundColor: 'rgba(45, 90, 64, 0.12)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(192, 57, 43, 0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeText: {
    color: '#2d5a40',
  },
  inactiveText: {
    color: '#a62f2f',
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  ativarButton: {
    backgroundColor: '#2d5a40',
  },
  desativarButton: {
    backgroundColor: '#b23d3d',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
=======
>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/FrontEnd/frontend/src/app/usuarios.tsx
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
