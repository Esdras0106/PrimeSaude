import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
    token: string | null;
    user: any;
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AUTH_STORAGE_KEY = '@primesaude:auth';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const restoreAuth = async () => {
            try {
                const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (!stored) return;

                const parsed = JSON.parse(stored);
                if (parsed?.token && parsed?.user) {
                    setToken(parsed.token);
                    setUser(parsed.user);
                }
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
            }
        };

        restoreAuth();
    }, []);

    const login = async (tokenReceived: string, userReceived: any) => {
        setToken(tokenReceived);
        setUser(userReceived);

        try {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: tokenReceived, user: userReceived }));
        } catch (error) {
            console.error('Erro ao salvar sessão:', error);
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);

        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('Erro ao limpar sessão:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);