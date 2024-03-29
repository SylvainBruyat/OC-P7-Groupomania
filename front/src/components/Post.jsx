import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../utils/Context';
import Comment from './Comment';
import ContentWriting from './ContentWriting';
import { LikePost } from '../services/post.service';
import { GetAllComments, DeleteComment } from '../services/comment.service';
import formatTime from '../utils/formatTime';

import likeLogoEmpty from '../assets/icons/like-empty.svg';
import likeLogoFull from '../assets/icons/like-full.svg';
import commentLogo from '../assets/icons/comment.svg';
import editLogo from '../assets/icons/edit.svg';
import deleteLogo from '../assets/icons/delete-button.svg';

export default function Post(props) {
    const { handleDeletePost, refreshPost } = props;
    const [comments, setComments] = useState([]);
    const { token, userId, admin } = useContext(AuthContext);

    const [like, setLike] = useState(
        props.likeUserIds.includes(`${userId}`) ? 1 : 0
    );
    const [postEditMode, setPostEditMode] = useState(false);
    const [commentPublishMode, setcommentPublishMode] = useState(false);

    const navigate = useNavigate();

    const togglePostEditMode = (evt) => {
        if (evt) evt.preventDefault();
        setPostEditMode(!postEditMode);
    };

    const toggleCommentPublishMode = (evt) => {
        if (evt) evt.preventDefault();
        setcommentPublishMode(!commentPublishMode);
    };

    const toggleLike = () => {
        setLike(like === 0 ? 1 : 0);
    };

    const deletePostDialog = document.getElementById(
        `deletePostDialog-${props.id}`
    );

    const creationTime = formatTime(props.creationTimestamp);
    const modificationTime = formatTime(props.modificationTimestamp);

    useEffect(() => {
        async function FetchComments() {
            const response = await GetAllComments(props.id, token);
            if (response.status) {
                if (response.status === 401) navigate('/');
                else setComments(response.comments);
            } else console.log(response);
        }
        FetchComments();
    }, [navigate, props.id, token]);

    async function handleLike(postId) {
        const response = await LikePost(postId, like, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                toggleLike();
                refreshPost(postId);
            }
        } else console.log(response);
    }

    async function insertComment(newComment) {
        setComments((comments) => [...comments, newComment]);
    }

    async function refreshComment(commentId, newComment) {
        setComments(
            comments.map((comment) => {
                if (comment._id !== commentId) return comment;
                else return newComment;
            })
        );
    }

    function showDeletePostDialog() {
        deletePostDialog.showModal();
    }

    async function handleDeleteComment(commentId) {
        const response = await DeleteComment(commentId, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else
                setComments(
                    comments.filter((comment) => comment._id !== commentId)
                );
        } else console.log(response);
    }

    return (
        <article className="post-card">
            <div className="post-card__content">
                <div className="post-card__name-text">
                    <div className="post-card__name-text__name-edit">
                        <a
                            href={`/profile/${props.author._id}`}
                            className="post-card__name-text__name"
                        >
                            {`${props.author.firstName} ${props.author.lastName}`}
                        </a>
                        {(admin === true ||
                            admin === 'true' ||
                            userId === props.author._id) && (
                            <button
                                className="post-card__name-text__edit-menu"
                                onClick={togglePostEditMode}
                            >
                                <img
                                    src={editLogo}
                                    alt="Bouton Modifier"
                                    title="Modifier ce message"
                                />
                            </button>
                        )}
                        {postEditMode && (
                            <ContentWriting
                                id={props.id}
                                text={props.text}
                                imageUrl={props.imageUrl}
                                refreshPost={refreshPost}
                                togglePostEditMode={togglePostEditMode}
                                contentType="postModification"
                            />
                        )}
                    </div>
                    <p>{props.text}</p>
                </div>
                {props.imageUrl !== '' && (
                    <img
                        src={props.imageUrl}
                        alt=""
                        className="post-card_picture"
                    />
                )}
                <p className="post-card__create-time">
                    Posté le {creationTime}
                </p>
                {props.modificationTimestamp !== null && (
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
                        {props.numberOfLikes > 0 && props.numberOfLikes}
                    </span>
                    <button
                        className="post-card__like-comment__comment-button"
                        onClick={toggleCommentPublishMode}
                    >
                        <img
                            className="post-card__like-comment__comment-icon"
                            src={commentLogo}
                            alt=""
                        />
                        <span>Commenter</span>
                    </button>
                    {commentPublishMode && (
                        <ContentWriting
                            postId={props.id}
                            toggleCommentPublishMode={toggleCommentPublishMode}
                            insertComment={insertComment}
                            contentType="commentCreation"
                        />
                    )}
                </div>
                <div className="post-card__comments">
                    {comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            id={comment._id}
                            author={comment.userId}
                            text={comment.text}
                            numberOfLikes={comment.numberOfLikes}
                            likeUserIds={comment.likeUserIds}
                            creationTimestamp={comment.creationTimestamp}
                            modificationTimestamp={
                                comment.modificationTimestamp
                            }
                            refreshComment={refreshComment}
                            handleDeleteComment={handleDeleteComment}
                        />
                    ))}
                </div>
            </div>
            <dialog
                className="deletePostDialog"
                id={`deletePostDialog-${props.id}`}
            >
                <form method="dialog">
                    <p>Souhaitez-vous réellement supprimer ce message ?</p>
                    <div className="deletePostDialog__button-div">
                        <button
                            value="cancel"
                            className="deletePostDialog__button"
                            autoFocus
                        >
                            Annuler
                        </button>
                        <button
                            value="confirm"
                            className="deletePostDialog__button"
                            onClick={() => handleDeletePost(props.id)}
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </dialog>
            {(admin === true ||
                admin === 'true' ||
                userId === props.author._id) && (
                <button
                    className="delete-button"
                    onClick={() => showDeletePostDialog()}
                >
                    <img
                        src={deleteLogo}
                        alt="Bouton supprimer"
                        title="Supprimer ce message"
                        className="delete-button__icon"
                    />
                </button>
            )}
        </article>
    );
}
