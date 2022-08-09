import { useState, useContext } from 'react';
import { /* useLocation,  */ useNavigate } from 'react-router-dom';

import { AuthContext } from '../utils/Context';

export default function LoginCard() {
    const [userLoginInfo, setUserInfo] = useState({
        email: '',
        password: '',
    });

    const { handleLogin } = useContext(AuthContext);

    const [customMessage, setCustomMessage] = useState('');

    const navigate = useNavigate();
    //TODO Décommenter ces 2 lignes avant livraison pour gérer la redirection post-login
    //const location = useLocation();
    //const origin = location.state?.from?.pathname || '/home';

    async function FetchLogin() {
        try {
            const response = await fetch(
                'http://localhost:3000/api/user/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userLoginInfo),
                }
            );
            if (response.status === 200) {
                const data = await response.json();
                await handleLogin(data.token);
                navigate(`/profile/${data.userId}`); //TODO Remplacer par navigate(origin) avant livraison
            } else if (response.status === 401) {
                setCustomMessage('Mot de passe invalide. Veuillez réessayer');
            } else if (response.status === 404) {
                setCustomMessage(
                    "Il n'y a pas de compte associé à cette adresse e-mail. Veuillez utiliser le formulaire d'inscription."
                );
            } else if (response.status === 500) {
                throw new Error(
                    'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.'
                );
            } else throw new Error('Erreur inconnue');
        } catch (error) {
            setCustomMessage(`${error.message}`);
            console.error(error);
        }
    }

    function handleChange(evt) {
        const { name, value } = evt.target;
        setUserInfo({ ...userLoginInfo, [name]: value });
    }

    function handleSubmit(evt) {
        evt.preventDefault();
        FetchLogin(userLoginInfo);
    }

    return (
        <div className="login-card">
            <form onSubmit={(evt) => handleSubmit(evt)}>
                <label htmlFor="email">
                    Adresse e-mail <span>*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Entrez votre adresse e-mail"
                    value={userLoginInfo.email}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <label htmlFor="password">
                    Mot de passe <span>*</span>
                </label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Entrez votre mot de passe"
                    value={userLoginInfo.password}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <p>
                    <span>*</span>Champ requis
                </p>
                <button type="submit">Connexion</button>
            </form>
            {/* A refactoriser dans un composant */}
            <p className="custom-message">{customMessage}</p>
        </div>
    );
}
