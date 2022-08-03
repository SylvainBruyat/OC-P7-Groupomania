import { useState } from 'react';

export default function SignupCard() {
    const [userSignupInfo, setUserInfo] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const [customMessage, setCustomMessage] = useState('');

    async function fetchSignup(userSignupInfo) {
        try {
            const response = await fetch(
                'http://localhost:3000/api/user/signup',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userSignupInfo),
                }
            );
            if (response.status === 201) {
                setUserInfo({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                });
                //TODO Remplacer (ou compléter ?) par une redirection vers la page de connexion
                setCustomMessage(
                    'Votre compte a été créé avec succès. Vous pouvez vous y connecter dès maintenant.'
                );
            } else if (response.status === 400) {
                const data = await response.json();
                if (data.message === 'Invalid password') {
                    //TODO Exploiter data.failedCriteria pour indiquer quels critères ne sont pas respectés
                    setCustomMessage(
                        'Votre mot de passe ne correspond pas aux critères demandés. Veuillez réessayer.'
                    );
                }
            } else if (response.status === 409) {
                setCustomMessage(
                    'Un compte existe déjà avec cette adresse e-mail. Veuillez utiliser le formulaire de connection.'
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
        setUserInfo({ ...userSignupInfo, [name]: value });
        setCustomMessage('');
    }

    function handleSubmit(evt) {
        evt.preventDefault();
        fetchSignup(userSignupInfo);
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
                    required
                    onChange={(evt) => handleChange(evt)}
                />
                <p>
                    <span>*</span>Champ requis
                </p>
                <button type="submit">Inscription</button>
            </form>
            {/* A refactoriser dans un composant */}
            <p className="custom-message">{customMessage}</p>
        </div>
    );
}
