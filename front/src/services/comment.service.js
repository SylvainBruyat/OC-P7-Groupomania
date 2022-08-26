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
        } else if (response.status === 401) return { status: response.status };
        else if (response.status === 500)
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
        } else if (response.status === 401) return { status: response.status };
        else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function ModifyComment(commentId, commentContent, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/comment/${commentId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentContent),
            }
        );

        if (response.status === 200) {
            const newComment = await response.json();
            return { status: response.status, newComment };
        } else if (response.status === 401) return { status: response.status };
        else if (response.status === 403)
            return "Vous n'avez pas les droits pour effectuer cette action.";
        else if (response.status === 404) return "Ce commentaire n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function DeleteComment(commentId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/comment/${commentId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.status === 200) return { status: response.status };
        else if (response.status === 401) return { status: response.status };
        else if (response.status === 403)
            return "Vous n'avez pas les droits pour effectuer cette action.";
        else if (response.status === 404) return "Ce commentaire n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function LikeComment(commentId, like, token) {
    try {
        const likeValueToPost = like === 0 ? 1 : 0;
        const response = await fetch(
            `http://localhost:3000/api/comment/${commentId}/like`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ like: likeValueToPost }),
            }
        );
        if (response.status === 201) {
            const data = await response.json();
            return { status: response.status, comment: data.comment };
        } else if (response.status === 401) return { status: response.status };
        else if (response.status === 404) return "Ce commentaire n'existe pas.";
        else if (response.status === 409) {
            const data = await response.json();
            if (data.message === 'Comment already liked')
                return 'Vous ne pouvez pas liker plusieurs fois un commentaire.';
            return "Vous n'avez pas de like à supprimer sur ce commentaire.";
        } else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}
