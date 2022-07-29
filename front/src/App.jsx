import { Routes, Route } from 'react-router-dom';

import SignupLogin from './pages/SignupLogin';
import Home from './pages/Home';
import Profile from './pages/Profile';

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<SignupLogin />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </>
    );
}
