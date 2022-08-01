import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import DefaultProfilePicture from '../assets/default-profile-picture.svg';
import Post from '../components/Post';

let name = ''; // Remplacer par firstName + lastName récupérés de la BDD

export default function Profile() {
    const [customMessage, setCustomMessage] = useState('');
    const [posts, setPosts] = useState([]);

    const params = useParams();

    const savedToken = sessionStorage.getItem('token');

    useEffect(() => {
        async function FetchFivePosts() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/post/user/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setPosts(data); //TODO A corriger : écrase les posts précédents si on en redemande 5 nouveaux
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
                        headers: { Authorization: `Bearer ${savedToken}` },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    name = `${data.firstName} ${data.lastName}`;
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
    }, [params, savedToken]);

    return (
        <div className="profile-wrapper">
            {/* A refactoriser dans un composant */}
            <p className="custom-message">{customMessage}</p>
            <div className="image-wrapper">
                <img
                    src={DefaultProfilePicture}
                    alt={name}
                    className="profile-picture"
                />
                <button>Modifier</button>
            </div>
            <div className="profile-info">
                <h1>{name}</h1>
                {/* Modification du mot de passe. A implémenter plus tard */}
            </div>
            {posts.map((post) => (
                <Post
                    key={post._id}
                    id={post._id}
                    author={name}
                    userId={post.userId}
                    text={post.text}
                    imageUrl={post.imageUrl}
                    numberOfLikes={post.numberOfLikes}
                    likeUserIds={post.likeUserIds}
                    creationTimestamp={post.creationTimestamp}
                    modificationTimestamp={post.modificationTimestamp}
                />
            ))}
        </div>
    );
}
