import { useState } from 'react';

import SignupCard from '../components/SignupCard';
import LoginCard from '../components/LoginCard';

export default function SignupLogin() {
    const [mode, setMode] = useState('Connexion');
    const toggleMode = () => {
        setMode(mode === 'Connexion' ? 'Inscription' : 'Connexion');
    };

    return (
        <div className="signup-login-wrapper">
            {mode === 'Connexion' ? (
                <LoginCard className="card" />
            ) : (
                <SignupCard className="card" toggleMode={toggleMode} />
            )}
            <p className="signup-login-message">
                {mode === 'Connexion'
                    ? "Vous n'avez pas encore de compte ? "
                    : 'Vous avez déjà un compte ? '}
                <button onClick={toggleMode} className="link-button">
                    {mode === 'Connexion'
                        ? 'Inscrivez-vous !'
                        : 'Connectez-vous !'}
                </button>
            </p>
        </div>
    );
}
