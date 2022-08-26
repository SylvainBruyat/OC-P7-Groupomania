import { useContext, useState } from 'react';

import { AuthContext } from '../utils/Context';
import { CreateComment } from '../services/comment.service';

import closeButton from '../assets/icons/close-button.svg';

export default function CommentPublish(props) {
    const [commentContent, setCommentContent] = useState('');

    const { token } = useContext(AuthContext);
    const { insertComment, toggleCommentPublishMode } = props;
    const postId = props.postId;

    function handleCommentContentChange(evt) {
        setCommentContent(evt.target.value);
    }

    function handleCommentPublishing(evt) {
        evt.preventDefault();
        PublishComment();
    }

    async function PublishComment() {
        const response = await CreateComment(commentContent, postId, token);
        if (response.status) {
            insertComment(response.newComment);
            setCommentContent('');
            toggleCommentPublishMode();
        } else throw new Error(response);
    }

    return (
        <div className="comment-edit__background">
            <div className="comment-edit__interface">
                <div className="comment-edit__top-bar">
                    <h2>Rédiger un commentaire</h2>
                    <img
                        src={closeButton}
                        alt="Fermer l'interface d'écriture de commentaire"
                        className="comment-edit__close-button"
                        onClick={toggleCommentPublishMode}
                    />
                </div>
                <form
                    className="comment-edit__form"
                    onSubmit={(evt) => handleCommentPublishing(evt)}
                >
                    <textarea
                        id="text"
                        name="text"
                        placeholder="Ecrivez votre commentaire ici"
                        value={commentContent.commentText}
                        onChange={(evt) => handleCommentContentChange(evt)}
                        required
                        autoFocus
                    ></textarea>
                    <div className="comment-edit__bottom-bar">
                        <button
                            type="submit"
                            className="comment-edit__submit-button"
                        >
                            Publier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
