import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const savedAdmin = sessionStorage.getItem('admin');
    const savedToken = sessionStorage.getItem('token');
    const savedUserId = sessionStorage.getItem('userId');
    const [admin, setAdmin] = useState(savedAdmin ? savedAdmin : null);
    const [token, setToken] = useState(savedToken ? savedToken : null);
    const [userId, setUserId] = useState(savedUserId ? savedUserId : null);
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem('admin', admin);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
    }, [admin, token, userId]);

    const handleLogin = async (token) => {
        const decodedToken = jwt_decode(token);
        setAdmin(decodedToken.admin);
        setToken(token);
        setUserId(decodedToken.userId);
    };

    const handleLogout = async () => {
        setAdmin(null);
        setToken(null);
        setUserId(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider
            value={{ admin, token, userId, handleLogin, handleLogout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const PostPublishContext = createContext();

export const PostPublishProvider = ({ children }) => {
    const [postPublishMode, setPostPublishMode] = useState(false);

    const togglePostPublishMode = () => {
        setPostPublishMode(!postPublishMode);
    };

    return (
        <PostPublishContext.Provider
            value={{ postPublishMode, togglePostPublishMode }}
        >
            {children}
        </PostPublishContext.Provider>
    );
};
