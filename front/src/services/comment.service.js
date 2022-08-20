export async function GetAllComments(postId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/comment/${postId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            const comments = await response.json();
            return { status: response.status, comments };
        } else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}
