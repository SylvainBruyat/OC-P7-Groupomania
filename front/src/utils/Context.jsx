import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const savedToken = sessionStorage.getItem('token');
    const [token, setToken] = useState(savedToken ? savedToken : null);
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem('token', token);
    }, [token]);

    const handleLogin = async (receivedToken) => {
        setToken(receivedToken);
    };

    const handleLogout = async () => {
        setToken(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider
            value={{ token, setToken, handleLogin, handleLogout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
