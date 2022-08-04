import { Routes, Route } from 'react-router-dom';

import SignupLogin from './pages/SignupLogin';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';

import './styles/app.css';
import { AuthProvider } from './utils/Context';

export default function App() {
    return (
        <>
            <AuthProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<SignupLogin />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile/:id" element={<Profile />} />
                </Routes>
            </AuthProvider>
        </>
    );
}
