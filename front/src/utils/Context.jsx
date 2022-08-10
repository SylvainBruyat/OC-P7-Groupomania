import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const savedToken = sessionStorage.getItem('token');
    const savedUserId = sessionStorage.getItem('userId');
    const [token, setToken] = useState(savedToken ? savedToken : null);
    const [userId, setUserId] = useState(savedUserId ? savedUserId : null);
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
    }, [token, userId]);

    const handleLogin = async (loginData) => {
        setToken(loginData.token);
        setUserId(loginData.userId);
    };

    const handleLogout = async () => {
        setToken(null);
        setUserId(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider
            value={{ token, setToken, userId, handleLogin, handleLogout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const PostEditContext = createContext();

export const PostEditProvider = ({ children }) => {
    const [postEditMode, setPostEditMode] = useState(false);

    const togglePostEditMode = () => {
        setPostEditMode(!postEditMode);
    };

    return (
        <PostEditContext.Provider value={{ postEditMode, togglePostEditMode }}>
            {children}
        </PostEditContext.Provider>
    );
};
