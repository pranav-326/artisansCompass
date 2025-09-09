import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (name: string, email: string, password: string, bio: string) => Promise<User>;
    logout: () => void;
    updateUser: (updatedData: { name: string; email: string; bio: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const signup = async (name: string, email: string, password: string, bio: string) => {
        const newUser = await authService.signup(name, email, password, bio);
        setUser(newUser);
        return newUser;
    };
    
    const updateUser = async (updatedData: { name: string; email: string; bio: string }) => {
        if (!user) {
            throw new Error("No user is currently logged in.");
        }
        const updatedUser = await authService.updateUser(user.email, updatedData);
        setUser(updatedUser);
        return updatedUser;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};