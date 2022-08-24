export async function CreatePost(postContent, token) {
    try {
        let options = {};
        if (postContent.image === null) {
            options = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postContent),
            };
        } else {
            let formData = new FormData();
            formData.append('post', postContent.text);
            formData.append('image', postContent.image);

            options = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            };
        }

        const response = await fetch('http://localhost:3000/api/post', options);

        if (response.status === 201) {
            const data = await response.json();
            return { status: response.status, newPost: data.post };
        } else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function GetFivePosts(pageNumber, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/post?page=${pageNumber}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            const newPosts = await response.json();
            return { status: response.status, newPosts };
        } else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function GetFivePostsFromUser(userId, pageNumber, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/post/user/${userId}?page=${pageNumber}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            const newPosts = await response.json();
            return { status: response.status, newPosts };
        } else if (response.status === 403)
            return "Vous n'avez pas les droits pour accéder à cette ressource.";
        else if (response.status === 404)
            return "Cet utilisateur n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function GetOnePost(postId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/post/single/${postId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (response.status === 200) {
            const newPost = await response.json();
            return { status: response.status, newPost };
        } else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function ModifyPost(postId, postContent, token) {
    try {
        let options = {};
        if (postContent.image === null) {
            options = {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postContent),
            };
        } else {
            let formData = new FormData();
            formData.append('post', postContent.text);
            formData.append('image', postContent.image);

            options = {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            };
        }

        const response = await fetch(
            `http://localhost:3000/api/post/${postId}`,
            options
        );

        if (response.status === 200) return { status: response.status };
        else if (response.status === 403)
            return "Vous n'avez pas les droits pour effectuer cette action.";
        else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function DeletePost(postId, token) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/post/${postId}`,
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
        else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}

export async function LikePost(postId, like, token) {
    try {
        const likeValueToPost = like === 0 ? 1 : 0;
        const response = await fetch(
            `http://localhost:3000/api/post/${postId}/like`,
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
            return { status: response.status };
        } else if (response.status === 404) return "Ce message n'existe pas.";
        else if (response.status === 409) {
            const data = await response.json();
            if (data.message === 'Post already liked')
                return 'Vous ne pouvez pas liker plusieurs fois un message.';
            return "Vous n'avez pas de like à supprimer sur ce message.";
        } else if (response.status === 500)
            return 'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.';
        else return 'Erreur inconnue';
    } catch (error) {
        return error;
    }
}
