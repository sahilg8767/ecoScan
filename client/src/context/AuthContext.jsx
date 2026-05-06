import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ecoToken');
        const userData = localStorage.getItem('ecoUser');
        if (token && userData) {
            setUser(JSON.parse(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://127.0.0.1:5001/api/auth/login', { email, password });
        localStorage.setItem('ecoToken', res.data.token);
        localStorage.setItem('ecoUser', JSON.stringify(res.data.user));
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://127.0.0.1:5001/api/auth/register', { name, email, password });
        localStorage.setItem('ecoToken', res.data.token);
        localStorage.setItem('ecoUser', JSON.stringify(res.data.user));
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    };

    const logout = () => {
        localStorage.removeItem('ecoToken');
        localStorage.removeItem('ecoUser');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
