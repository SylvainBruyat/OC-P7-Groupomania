import { useContext, useState } from 'react';

import { AuthContext } from '../utils/Context';
import { ModifyComment } from '../services/comment.service';

import closeButton from '../assets/icons/close-button.svg';

export default function CommentEdit(props) {
    const [commentContent, setCommentContent] = useState({
        text: props.text,
        image: null,
    });

    const { token } = useContext(AuthContext);
    const { toggleCommentEditMode, refreshComment } = props;

    function handleCommentContentChange(evt) {
        if (evt.target.name === 'text') {
            setCommentContent({ ...commentContent, text: evt.target.value });
        } else {
            setCommentContent({
                ...commentContent,
                image: evt.target.files[0],
            });
        }
    }

    function handleCommentEditing(evt) {
        evt.preventDefault();
        EditComment();
    }

    async function EditComment() {
        const response = await ModifyComment(props.id, commentContent, token);
        if (response.status) {
            setCommentContent({ text: '', image: null });
            toggleCommentEditMode();
            refreshComment(props.id, response.newComment.comment);
        } else throw new Error(response);
    }

    return (
        <div className="comment-edit__background">
            <div className="comment-edit__interface">
                <div className="comment-edit__top-bar">
                    <h2>Modifier un commentaire</h2>
                    <img
                        src={closeButton}
                        alt="Fermer l'interface d'écriture de comment"
                        className="comment-edit__close-button"
                        onClick={toggleCommentEditMode}
                    />
                </div>
                <form
                    className="comment-edit__form"
                    onSubmit={(evt) => handleCommentEditing(evt)}
                >
                    <textarea
                        id="text"
                        name="text"
                        placeholder="Ecrivez votre message ici"
                        value={commentContent.text}
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
