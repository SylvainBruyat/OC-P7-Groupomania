import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthContext } from './Context';

export default function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);
    const location = useLocation();

    if (token === null || token === 'null')
        return <Navigate to="/" replace state={{ from: location }} />;

    return children;
}
