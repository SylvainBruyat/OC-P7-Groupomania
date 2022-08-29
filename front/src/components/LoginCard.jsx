import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../utils/Context';
import { Login } from '../services/user.service';

export default function LoginCard() {
    const [userLoginInfo, setUserInfo] = useState({
        email: '',
        password: '',
    });

    const { handleLogin } = useContext(AuthContext);

    const [customMessage, setCustomMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const origin = location.state?.from?.pathname || '/home';

    function handleChange(evt) {
        const { name, value } = evt.target;
        setUserInfo({ ...userLoginInfo, [name]: value });
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        const response = await Login(userLoginInfo);
        if (response.status) {
            await handleLogin(response.token);
            navigate(origin);
        } else setCustomMessage(response);
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
                    maxLength={200}
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
                    maxLength={200}
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
