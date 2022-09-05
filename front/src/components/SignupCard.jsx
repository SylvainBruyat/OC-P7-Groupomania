import { useState } from 'react';

import { Signup } from '../services/user.service';

export default function SignupCard(props) {
    const [userSignupInfo, setUserInfo] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const [customMessage, setCustomMessage] = useState('');

    const { toggleMode } = props;

    function handleChange(evt) {
        const { name, value } = evt.target;
        setUserInfo({ ...userSignupInfo, [name]: value });
        setCustomMessage('');
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        const response = await Signup(userSignupInfo);
        if (response.status) {
            setUserInfo({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
            });
            setCustomMessage(response.message);
            setTimeout(() => {
                toggleMode();
            }, 2000);
        } else setCustomMessage(response);
    }

    return (
        <div className="signup-card">
            <form onSubmit={(evt) => handleSubmit(evt)}>
                <label htmlFor="email">
                    Adresse e-mail <span>*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Entrez votre adresse e-mail"
                    value={userSignupInfo.email}
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
                    placeholder="Créez un mot de passe"
                    value={userSignupInfo.password}
                    minLength={8}
                    maxLength={200}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <p>
                    Le mot de passe doit faire au moins 8 caractères et contenir
                    au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère
                    spécial
                </p>
                <label htmlFor="firstName">
                    Prénom <span>*</span>
                </label>
                <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder="Votre prénom"
                    value={userSignupInfo.firstName}
                    maxLength={50}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <label htmlFor="lastName">
                    Nom <span>*</span>
                </label>
                <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder="Votre nom"
                    value={userSignupInfo.lastName}
                    maxLength={50}
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <p>
                    <span>*</span>Champ requis
                </p>
                <button type="submit">Inscription</button>
            </form>
            <p className="custom-message">{customMessage}</p>
        </div>
    );
}
