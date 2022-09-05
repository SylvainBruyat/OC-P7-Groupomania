import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../utils/Context';
import ContentWriting from './ContentWriting';

import { LikeComment } from '../services/comment.service';
import formatTime from '../utils/formatTime';

export default function Comment(props) {
    const { token, userId, admin } = useContext(AuthContext);

    const [like, setLike] = useState(
        props.likeUserIds.includes(`${userId}`) ? 1 : 0
    );

    const [isCommentMenuVisible, setIsCommentMenuVisible] = useState(false);
    const [commentEditMode, setCommentEditMode] = useState(false);

    const navigate = useNavigate();

    const { refreshComment, handleDeleteComment } = props;

    const deleteCommentDialog = document.getElementById(
        `deleteCommentDialog-${props.id}`
    );

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

    const toggleCommentEditMode = () => {
        setCommentEditMode(!commentEditMode);
    };

    const creationTime = formatTime(props.creationTimestamp);
    const modificationTime = formatTime(props.modificationTimestamp);

    async function handleLike(commentId) {
        const response = await LikeComment(commentId, like, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                toggleLike();
                refreshComment(commentId, response.comment);
            }
        }
    }

    function showCommentMenu() {
        setIsCommentMenuVisible(!isCommentMenuVisible);
    }

    function showDeleteCommentDialog() {
        deleteCommentDialog.showModal();
    }

    return (
        <div className="comment-card">
            <div className="comment-card__content">
                <div className="comment-card__name-text">
                    <a
                        href={`/profile/${props.author._id}`}
                        className="comment-card__name-text__name"
                    >
                        {`${props.author.firstName} ${props.author.lastName}`}
                    </a>
                    <p>{props.text}</p>
                </div>
                <p className="comment-card__create-time">
                    Posté le {creationTime}
                </p>
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
            {(admin === true ||
                admin === 'true' ||
                userId === props.author._id) && (
                <div
                    className="comment-card__actions"
                    onClick={() => showCommentMenu()}
                >
                    <button className="comment-card__menu_opener">...</button>
                    {isCommentMenuVisible && (
                        <div className="comment-card__actions-menu">
                            <button
                                className="comment-card__modify-button"
                                title="Modifier ce commentaire"
                                onClick={toggleCommentEditMode}
                            >
                                Modifier
                            </button>
                            <button
                                className="comment-card__delete-button"
                                title="Supprimer ce commentaire"
                                onClick={() => showDeleteCommentDialog()}
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                    {commentEditMode ? (
                        <ContentWriting
                            id={props.id}
                            userId={props.userId}
                            text={props.text}
                            toggleCommentEditMode={toggleCommentEditMode}
                            refreshComment={refreshComment}
                            contentType="commentModification"
                        />
                    ) : (
                        <></>
                    )}
                </div>
            )}
            <dialog
                className="deleteCommentDialog"
                id={`deleteCommentDialog-${props.id}`}
            >
                <form method="dialog">
                    <p>Souhaitez-vous réellement supprimer ce commentaire ?</p>
                    <div className="deleteCommentDialog__button-div">
                        <button
                            value="cancel"
                            className="deleteCommentDialog__button"
                            autoFocus
                        >
                            Annuler
                        </button>
                        <button
                            value="confirm"
                            className="deleteCommentDialog__button"
                            onClick={() => handleDeleteComment(props.id)}
                            data-commentid={props.id}
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
}
