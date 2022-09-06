import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import { CreatePost, ModifyPost } from '../services/post.service';
import { CreateComment, ModifyComment } from '../services/comment.service';

import closeButton from '../assets/icons/close-button.svg';
import imageUploadButton from '../assets/icons/image-upload-button.svg';

export default function ContentWriting(props) {
    const contentType = props.contentType;
    const postId = props.postId;
    const [content, setContent] = useState({
        text:
            contentType === 'postModification' ||
            contentType === 'commentModification'
                ? props.text
                : '',
        image: null,
    });

    const navigate = useNavigate();

    const { togglePostPublishMode } = useContext(PostPublishContext);
    const { token } = useContext(AuthContext);
    const {
        togglePostEditMode,
        toggleCommentPublishMode,
        toggleCommentEditMode,
        refreshPost,
        refreshComment,
        insertComment,
    } = props;

    let h2Content = '';
    if (contentType === 'postModification') h2Content = 'Modifier un message';
    else if (contentType === 'postCreation') h2Content = 'Rédiger un message';
    else if (contentType === 'commentModification')
        h2Content = 'Modifier un commentaire';
    else if (contentType === 'commentCreation')
        h2Content = 'Rédiger un commentaire';

    let closeAction;
    if (contentType === 'postModification') closeAction = togglePostEditMode;
    else if (contentType === 'postCreation')
        closeAction = togglePostPublishMode;
    else if (contentType === 'commentModification')
        closeAction = toggleCommentEditMode;
    else if (contentType === 'commentCreation')
        closeAction = toggleCommentPublishMode;

    function handleContentChange(evt) {
        if (evt.target.name === 'text') {
            setContent({ ...content, text: evt.target.value });
        } else {
            setContent({ ...content, image: evt.target.files[0] });
        }
    }

    function handleSubmit(evt) {
        evt.preventDefault();
        PublishContent();
    }

    async function PublishContent() {
        let response;
        if (contentType === 'postModification')
            response = await ModifyPost(props.id, content, token);
        else if (contentType === 'postCreation')
            response = await CreatePost(content, token);
        else if (contentType === 'commentModification')
            response = await ModifyComment(props.id, content.text, token);
        else if (contentType === 'commentCreation')
            response = await CreateComment(content.text, postId, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                setContent({ text: '', image: null });
            }
            if (contentType === 'postModification') {
                togglePostEditMode();
                refreshPost(props.id);
            } else if (contentType === 'postCreation') {
                togglePostPublishMode();
                window.location.reload();
            } else if (contentType === 'commentModification') {
                toggleCommentEditMode();
                refreshComment(props.id, response.comment);
            } else if (contentType === 'commentCreation') {
                insertComment(response.newComment);
                toggleCommentPublishMode();
            }
        } else throw new Error(response);
    }

    const handleEvent = (evt) => {
        console.log(evt);
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.target.click();
        }
    };

    useEffect(() => {
        const imageUploadLabel = document.querySelector('.image-upload-label');
        setTimeout(() => {
            imageUploadLabel.addEventListener('keyup', handleEvent);
        }, 500);
        return imageUploadLabel.removeEventListener('keyup', handleEvent);
    }, []);

    return (
        <div className="content-writing__background">
            <div className="content-writing__interface">
                <div className="content-writing__top-bar">
                    <h2>{h2Content}</h2>
                    <button
                        className="content-writing__close-button"
                        onClick={closeAction}
                    >
                        <img
                            src={closeButton}
                            alt="Fermer l'interface d'écriture"
                            className="content-writing__close-icon"
                        />
                    </button>
                </div>
                <form
                    className="content-writing__form"
                    onSubmit={(evt) => handleSubmit(evt)}
                >
                    <textarea
                        id="text"
                        name="text"
                        placeholder="Ecrivez votre message ici"
                        value={content.text}
                        onChange={(evt) => handleContentChange(evt)}
                        maxLength={5000}
                        required
                        autoFocus
                    ></textarea>
                    <div className="content-writing__bottom-bar">
                        {(contentType === 'postModification' ||
                            contentType === 'postCreation') && (
                            <label
                                htmlFor="post-image-upload"
                                className="image-upload-label"
                            >
                                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                <img
                                    src={imageUploadButton}
                                    alt="Bouton d'ajout d'une image"
                                    title="Ajouter une image"
                                    className="content-writing__image-upload-button"
                                    tabIndex={0}
                                />
                                <input
                                    type="file"
                                    name="image"
                                    id="post-image-upload"
                                    onChange={(evt) => handleContentChange(evt)}
                                />
                            </label>
                        )}
                        <button
                            type="submit"
                            className="content-writing__submit-button"
                        >
                            Publier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
