import { useEffect, useState, useContext } from 'react';

import { AuthContext } from '../utils/Context';
import Comment from './Comment';
//import PostEdit from '../components/PostEdit';

import likeLogoEmpty from '../assets/icons/like-empty.svg';
import likeLogoFull from '../assets/icons/like-full.svg';
import commentLogo from '../assets/icons/comment.svg';
import editLogo from '../assets/icons/edit.svg';
import deleteLogo from '../assets/icons/delete-button.svg';

export default function Post(props) {
    const [comments, setComments] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const [like, setLike] = useState(
        props.likeUserIds.includes(`${props.author._id}`) ? 1 : 0
    );

    const { token } = useContext(AuthContext);
    /* const { postEditMode, togglePostEditMode } = useContext(PostEditContext); */

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

    useEffect(() => {
        async function FetchComments() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/comment/${props.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setComments(data);
                } else if (response.status === 404) {
                    setCustomMessage("Ce message n'existe pas.");
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
        FetchComments();
    }, [props.id, token]);

    function formatTime(timestamp) {
        if (timestamp === null) return null;
        //Extracts an array with [year, month, date]
        const date = timestamp.split('T')[0].split('-');
        //Extracts an array with [hours, minutes, seconds]
        const time = timestamp.split('T')[1].split('.')[0].split(':');
        return `${date[2]}/${date[1]}/${date[0]} à ${time[0]}h${time[1]}`;
    }
    const creationTime = formatTime(props.creationTimestamp);
    const modificationTime = formatTime(props.modificationTimestamp);

    async function handleLike(postId) {
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
                toggleLike();
            } else if (response.status === 404) {
                setCustomMessage("Ce message n'existe pas.");
            } else if (response.status === 409) {
                const data = await response.json();
                if (data.message === 'Post already liked')
                    setCustomMessage(
                        'Vous ne pouvez pas liker plusieurs fois un post'
                    );
                setCustomMessage(
                    "Vous n'avez pas de like à supprimer sur ce post"
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

    async function handleDelete(postId) {
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
            if (response.status === 200) {
                //TODO Recharger la page (ou le moins d'éléments possibles) pour faire disparaitre le post supprimé
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

    return (
        <article className="post-card">
            <div className="post-card__content">
                {/* A refactoriser dans un composant */}
                <p className="custom-message">{customMessage}</p>
                <div className="post-card__name-text">
                    <div className="post-card__name-text__name-edit">
                        <a
                            href={`/profile/${props.author._id}`}
                            className="post-card__name-text__name"
                        >
                            {`${props.author.firstName} ${props.author.lastName}`}
                        </a>
                        <button className="post-card__name-text__edit-menu">
                            <img
                                src={editLogo}
                                alt="Bouton Modifier"
                                title="Modifier ce message"
                                /* onClick={togglePostEditMode} */
                            />
                        </button>
                        {/* {postEditMode ? (
                        <PostEdit
                            id={props.id}
                            userId={props.userId}
                            text={props.text}
                            imageUrl={props.imageUrl}
                        />
                    ) : (
                        <></>
                    )} */}
                    </div>
                    <p>{props.text}</p>
                </div>
                {props.imageUrl === '' ? null : (
                    <img
                        src={props.imageUrl}
                        alt=""
                        className="post-card_picture"
                    />
                )}
                <p className="post-card__create-time">
                    Posté le {creationTime}
                </p>
                {props.modificationTimestamp === null ? null : (
                    <p className="post-card__modify-time">
                        Modifié le {modificationTime}
                    </p>
                )}
                <div className="post-card__like-comment">
                    <button
                        className="post-card__like-comment__like-button"
                        onClick={() => handleLike(props.id)}
                    >
                        {like === 0 ? (
                            <img
                                className="post-card__like-comment__like-icon"
                                src={likeLogoEmpty}
                                alt="Liker"
                                height={20}
                                width={20}
                            />
                        ) : (
                            <img
                                className="post-card__like-comment__like-icon liked"
                                src={likeLogoFull}
                                alt="Liker"
                                height={20}
                                width={20}
                            />
                        )}
                    </button>
                    <span>
                        {props.numberOfLikes > 0 ? props.numberOfLikes : null}
                    </span>
                    <button className="post-card__like-comment__comment-button">
                        <img
                            className="post-card__like-comment__comment-icon"
                            src={commentLogo}
                            alt="Commenter"
                        />
                        <span>Commenter</span>
                    </button>
                </div>
                <div className="post-card__comments">
                    {comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            author={comment.userId}
                            text={comment.text}
                            numberOfLikes={comment.numberOfLikes}
                            creationTimestamp={comment.creationTimestamp}
                            modificationTimestamp={
                                comment.modificationTimestamp
                            }
                        />
                    ))}
                </div>
            </div>
            <div
                className="delete-button-container"
                onClick={() => handleDelete(props.id)}
            >
                <img
                    src={deleteLogo}
                    alt="Bouton supprimer"
                    title="Supprimer ce message"
                    className="delete-button"
                />
            </div>
        </article>
    );
}
