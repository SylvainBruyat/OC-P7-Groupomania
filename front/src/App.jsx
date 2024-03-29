import { Routes, Route } from 'react-router-dom';

import SignupLogin from './pages/SignupLogin';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';

import { AuthProvider, PostPublishProvider } from './utils/Context';
import ProtectedRoute from './utils/ProtectedRoute';

import './styles/app.css';

export default function App() {
    return (
        <>
            <AuthProvider>
                <PostPublishProvider>
                    <Header />
                    <Routes>
                        <Route path="/" element={<SignupLogin />} />
                        <Route
                            path="/home"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/:id"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </PostPublishProvider>
            </AuthProvider>
        </>
    );
}
