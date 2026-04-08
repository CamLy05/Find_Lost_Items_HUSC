import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated on mount
        if (pb.authStore.isValid && pb.authStore.model) {
            setCurrentUser(pb.authStore.model);
        }
        setInitialLoading(false);

        // Listen for auth changes
        const unsubscribe = pb.authStore.onChange((token, model) => {
            setCurrentUser(model);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
            setCurrentUser(authData.record);
            return authData.record;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const signup = async (email, password, name, role) => {
        try {
            const userData = {
                email,
                password,
                passwordConfirm: password,
                name,
                role,
            };
            const record = await pb.collection('users').create(userData, { $autoCancel: false });

            // Auto-login after signup
            const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
            setCurrentUser(authData.record);
            return authData.record;
        } catch (error) {
            throw new Error(error.message || 'Signup failed');
        }
    };

    const logout = () => {
        pb.authStore.clear();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        userRole: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        initialLoading,
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};