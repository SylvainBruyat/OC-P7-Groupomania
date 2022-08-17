import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import PostPublish from '../components/PostPublish';

import DefaultProfilePicture from '../assets/icons/default-profile-picture.svg';

let name = '';
let profilePicture = '';

export default function Profile() {
    const [customMessage, setCustomMessage] = useState('');
    const [posts, setPosts] = useState([]); // Remplacer par useReducer pour pouvoir rajouter les posts à chaque appel API ?
    const [file, setFile] = useState();

    const params = useParams();
    const { postPublishMode, togglePostPublishMode } =
        useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    function handlePictureUpload(evt) {
        setFile(evt.target.files[0]);
    }

    async function handlePictureSubmit(evt) {
        evt.preventDefault();
        try {
            let formData = new FormData();

            formData.append('image', file);

            const response = await fetch(
                `http://localhost:3000/api/user/${params.id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );
            if (response.status === 200) {
                console.log('Image de profil correctement enregistrée.');
                //TODO Afficher l'image nouvellement chargée
                //FetchProfile() n'est pas accessible ici
            } else if (response.status === 403) {
                setCustomMessage(
                    "Vous n'avez pas les droits pour effectuer cette action."
                );
            } else if (response.status === 404) {
                setCustomMessage("Ce profil n'existe pas.");
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

    useEffect(() => {
        async function FetchFivePosts() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/post/user/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setPosts(data); //TODO A corriger : écrase les posts précédents si on en redemande 5 nouveaux
                    // Utiliser useReducer à la place de useState ?
                    // Utiliser le spread Operator ?
                } else if (response.status === 403) {
                    setCustomMessage(
                        "Vous n'avez pas les droits pour accéder à cette ressource."
                    );
                } else if (response.status === 404) {
                    setCustomMessage("Cet utilisateur n'existe pas.");
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

        async function FetchProfile() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/user/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    name = `${data.firstName} ${data.lastName}`;
                    profilePicture = data.profilePictureUrl;
                    FetchFivePosts();
                } else if (response.status === 403) {
                    setCustomMessage(
                        "Vous n'avez pas les droits pour accéder à cette ressource."
                    );
                } else if (response.status === 404) {
                    setCustomMessage("Ce profil n'existe pas.");
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
        FetchProfile();
    }, [params, token]);

    return (
        <>
            <button onClick={togglePostPublishMode}>
                Cliquez ici pour rédiger un post
            </button>
            {postPublishMode ? <PostPublish /> : <></>}
            <section className="profile-wrapper">
                {/* A refactoriser dans un composant */}
                <p className="custom-message">{customMessage}</p>
                <div className="image-wrapper">
                    <img
                        src={
                            profilePicture === ''
                                ? DefaultProfilePicture
                                : profilePicture
                        }
                        alt={name}
                        className="profile-picture"
                    />
                    <form onSubmit={handlePictureSubmit}>
                        <input
                            type="file"
                            accept=".jpg, .jpeg, .png, .gif, .webp"
                            onChange={handlePictureUpload}
                        />
                        <button type="submit">Confirmer</button>
                    </form>
                </div>
                <div className="profile-info">
                    <h1>{name}</h1>
                </div>
                {posts.map((post) => (
                    <Post
                        key={post._id}
                        id={post._id}
                        author={post.userId}
                        userId={post.userId}
                        text={post.text}
                        imageUrl={post.imageUrl}
                        numberOfLikes={post.numberOfLikes}
                        likeUserIds={post.likeUserIds}
                        creationTimestamp={post.creationTimestamp}
                        modificationTimestamp={post.modificationTimestamp}
                    />
                ))}
            </section>
        </>
    );
}
