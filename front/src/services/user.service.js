export async function Signup(userSignupInfo) {
    try {
        const response = await fetch('http://localhost:3000/api/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userSignupInfo),
        });
        if (response.status === 201) {
            return {
                status: response.status,
                message:
                    'Votre compte a été créé avec succès. Vous pouvez vous y connecter dès maintenant.',
            };
        } else if (response.status === 400) {
            const data = await response.json();
            if (data.message === 'Invalid password') {
                //TODO Exploiter data.failedCriteria pour indiquer quels critères ne sont pas respectés
                return 'Votre mot de passe ne correspond pas aux critères demandés. Veuillez réessayer.';
            } else
                return 'Requête invalide. Veuillez vérifier les informations fournies dans le formulaire et réessayer';
        } else if (response.status === 409) {
            return 'Un compte existe déjà avec cette adresse e-mail. Veuillez utiliser le formulaire de connection.';
        } else if (response.status === 500) {
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        } else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function Login(userLoginInfo) {
    try {
        const response = await fetch('http://localhost:3000/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userLoginInfo),
        });
        if (response.status === 200) {
            const data = await response.json();
            return { status: response.status, data };
        } else if (response.status === 401) {
            return 'Mot de passe invalide. Veuillez réessayer';
        } else if (response.status === 404) {
            return "Il n'y a pas de compte associé à cette adresse e-mail. Veuillez utiliser le formulaire d'inscription.";
        } else if (response.status === 500) {
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        } else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function GetProfile(userId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/user/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            const profileData = await response.json();
            return { status: response.status, profileData };
        } else if (response.status === 403)
            return "Vous n'avez pas les droits pour accéder à cette ressource.";
        else if (response.status === 404) return "Ce profil n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function ModifyProfile(userId, formData, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/user/${userId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );
        if (response.status === 200) {
            const data = await response.json();
            return {
                status: response.status,
                profilePictureUrl: data.profilePictureUrl,
            };
        } else if (response.status === 403)
            return "Vous n'avez pas les droits pour effectuer cette action.";
        else if (response.status === 404) return "Ce profil n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function DeleteProfile(userId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/user/${userId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 200) return { status: response.status };
        else if (response.status === 403)
            return "Vous n'avez pas les droits pour effectuer cette action.";
        else if (response.status === 404)
            return "Cet utilisateur n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}
