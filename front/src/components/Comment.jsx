import { useState, useContext } from 'react';

import { AuthContext } from '../utils/Context';

import { LikeComment } from '../services/comment.service';

export default function Comment(props) {
    const { token, userId } = useContext(AuthContext);

    const [like, setLike] = useState(
        props.likeUserIds.includes(`${userId}`) ? 1 : 0
    );

    const { refreshComment } = props;

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

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

    async function handleLike(commentId) {
        const response = await LikeComment(commentId, like, token);
        if (response.status) {
            toggleLike();
            refreshComment(commentId, response.comment);
        } //else setCustomMessage(response);
    }

    return (
        <div className="comment-card">
            <div className="comment-card__name-text">
                <a
                    href={`/profile/${props.author._id}`}
                    className="comment-card__name-text__name"
                >
                    {`${props.author.firstName} ${props.author.lastName}`}
                </a>
                <p>{props.text}</p>
            </div>
            <p className="comment-card__create-time">Posté le {creationTime}</p>
            {props.modificationTimestamp === null ? null : (
                <p className="comment-card__modify-time">
                    Modifié le {modificationTime}
                </p>
            )}
            <div className="comment-card__like">
                {like === 0 ? (
                    <button
                        className="comment-card__like__like-button"
                        onClick={() => handleLike(props.id)}
                    >
                        J'aime
                    </button>
                ) : (
                    <button
                        className="comment-card__like__like-button liked"
                        onClick={() => handleLike(props.id)}
                    >
                        J'aime
                    </button>
                )}
                <span>
                    {props.numberOfLikes > 0 ? props.numberOfLikes : null}
                </span>
            </div>
        </div>
    );
}
