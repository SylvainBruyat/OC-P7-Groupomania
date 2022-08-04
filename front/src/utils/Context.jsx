import { useState, createContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const savedToken = sessionStorage.getItem('token');
    const [token, setToken] = useState(savedToken ? savedToken : null);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};
