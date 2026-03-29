
import React, { createContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types.ts';
import { apiLogin, getSelfProfile } from '../services/api.ts';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<LoginResponse>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('hostel-token');
            if (token) {
                try {
                    const selfProfile = await getSelfProfile();
                    setUser(selfProfile);
                } catch (error) {
                    console.error("Session validation failed", error);
                    localStorage.removeItem('hostel-token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        validateToken();
    }, []);

    const login = async (email: string, pass: string): Promise<LoginResponse> => {
        setLoading(true);
        try {
            const response = await apiLogin(email, pass);
            if (response.token && response.user) {
                localStorage.setItem('hostel-token', response.token);
                setUser(response.user);
                return response;
            }
            throw new Error("Invalid login response from server.");
        } catch (error) {
            console.error("Login failed", error);
            // Re-throw the error to be handled by the LoginPage component
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hostel-token');
    };

    const value = { user, login, logout, loading };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};