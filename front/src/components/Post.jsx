import { useEffect, useState, useContext } from 'react';

import { AuthContext } from '../utils/Context';
import Comment from './Comment';
import PostEdit from './PostEdit';
import CommentPublish from './CommentPublish';
import { LikePost } from '../services/post.service';
import { GetAllComments } from '../services/comment.service';

import likeLogoEmpty from '../assets/icons/like-empty.svg';
import likeLogoFull from '../assets/icons/like-full.svg';
import commentLogo from '../assets/icons/comment.svg';
import editLogo from '../assets/icons/edit.svg';
import deleteLogo from '../assets/icons/delete-button.svg';

export default function Post(props) {
    const { handleDelete, refreshPost } = props;
    const [comments, setComments] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const { token, userId } = useContext(AuthContext);

    const [like, setLike] = useState(
        props.likeUserIds.includes(`${userId}`) ? 1 : 0
    );
    const [postEditMode, setPostEditMode] = useState(false);
    const [commentPublishMode, setcommentPublishMode] = useState(false);

    const togglePostEditMode = () => {
        setPostEditMode(!postEditMode);
    };

    const toggleCommentPublishMode = () => {
        setcommentPublishMode(!commentPublishMode);
    };

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

    const deletePostDialog = document.getElementById('deletePostDialog');

    useEffect(() => {
        async function FetchComments() {
            const response = await GetAllComments(props.id, token);
            if (response.status) setComments(response.comments);
            else setCustomMessage(response);
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
        const response = await LikePost(postId, like, token);
        if (response.status) {
            toggleLike();
            refreshPost(postId);
        } else setCustomMessage(response);
    }

    async function insertComment(newComment) {
        setComments((comments) => [...comments, newComment]);
    }

    function showDeletePostDialog() {
        deletePostDialog.showModal();
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
                                onClick={togglePostEditMode}
                            />
                        </button>
                        {postEditMode ? (
                            <PostEdit
                                id={props.id}
                                userId={props.userId}
                                text={props.text}
                                imageUrl={props.imageUrl}
                                togglePostEditMode={togglePostEditMode}
                                refreshPost={refreshPost}
                            />
                        ) : (
                            <></>
                        )}
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
                            />
                        ) : (
                            <img
                                className="post-card__like-comment__like-icon liked"
                                src={likeLogoFull}
                                alt="Liker"
                            />
                        )}
                    </button>
                    <span>
                        {props.numberOfLikes > 0 ? props.numberOfLikes : null}
                    </span>
                    <button
                        className="post-card__like-comment__comment-button"
                        onClick={toggleCommentPublishMode}
                    >
                        <img
                            className="post-card__like-comment__comment-icon"
                            src={commentLogo}
                            alt="Commenter"
                        />
                        <span>Commenter</span>
                    </button>
                    {commentPublishMode ? (
                        <CommentPublish
                            postId={props.id}
                            toggleCommentPublishMode={toggleCommentPublishMode}
                            insertComment={insertComment}
                        />
                    ) : (
                        <></>
                    )}
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
            <dialog id="deletePostDialog">
                <form method="dialog">
                    <p>Souhaitez-vous réellement supprimer ce message ?</p>
                    <div className="deletePostDialog__button-div">
                        <button
                            value="cancel"
                            className="deletePostDialog__button"
                        >
                            Annuler
                        </button>
                        <button
                            value="confirm"
                            className="deletePostDialog__button"
                            onClick={() => handleDelete(props.id)}
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </dialog>
            <div
                className="delete-button-container"
                onClick={() => showDeletePostDialog()}
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
