export async function CreateComment(commentContent, postId, token) {
    try {
        const response = await fetch('http://localhost:3000/api/comment', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: commentContent, postId }),
        });

        if (response.status === 201) {
            const data = await response.json();
            return { status: response.status, newComment: data.comment };
        } else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

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
