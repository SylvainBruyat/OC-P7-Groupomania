import { useEffect, useState } from 'react';

import Comment from './Comment';

import likeLogoEmpty from '../assets/like-empty.svg';
import likeLogoFull from '../assets/like-full.svg';
import commentLogo from '../assets/comment.svg';

export default function Post(props) {
    const [comments, setComments] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const [like, setLike] = useState(
        props.likeUserIds.includes(`${props.userId}`) ? 1 : 0
    );

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

    const savedToken = sessionStorage.getItem('token');

    useEffect(() => {
        async function FetchComments() {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/comment/${props.id}`,
                    {
                        headers: { Authorization: `Bearer ${savedToken}` },
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
    }, [props.id, savedToken]);

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
                        Authorization: `Bearer ${savedToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ like: likeValueToPost }),
                }
            );
            if (response.status === 201) {
                toggleLike();
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

    return (
        <article className="post-card">
            {/* A refactoriser dans un composant */}
            <p className="custom-message">{customMessage}</p>
            <div className="post-card__name-text">
                <div className="post-card__name-text__name-edit">
                    <p className="post-card__name-text__name">{props.author}</p>{' '}
                    {/* TODO Transformer le nom en lien vers le profil */}
                    <button className="post-card__name-text__edit-menu">
                        <span>...</span>
                    </button>
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
            <p className="post-card__create-time">Posté le {creationTime}</p>
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
                        modificationTimestamp={comment.modificationTimestamp}
                    />
                ))}
            </div>
        </article>
    );
}