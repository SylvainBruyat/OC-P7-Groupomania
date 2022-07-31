import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginCard() {
    const [userLoginInfo, setUserInfo] = useState({
        email: '',
        password: '',
    });

    const savedToken = sessionStorage.getItem('token');
    const [token, setToken] = useState(
        savedToken ? JSON.parse(savedToken) : []
    );

    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        sessionStorage.setItem('token', JSON.stringify(token));
    }, [token]);

    const navigate = useNavigate();

    async function FetchLogin(userInfo) {
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
                setToken(data.token);
                //TODO Redirection à changer vers /home
                navigate(`/profile/${data.userId}`);
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
                <label htmlFor="email">Adresse e-mail</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Entrez votre adresse e-mail"
                    value={userLoginInfo.email}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <label htmlFor="password">Mot de passe</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Entrez votre mot de passe"
                    value={userLoginInfo.password}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <button type="submit">Connexion</button>
            </form>
            {/* A refactoriser dans un composant */}
            <p className="custom-message">{customMessage}</p>
        </div>
    );
}
