import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import { CreatePost, ModifyPost } from '../services/post.service';

import closeButton from '../assets/icons/close-button.svg';
import imageUploadButton from '../assets/icons/image-upload-button.svg';

export default function ContentWriting(props) {
    const contentType = props.contentType;
    const [content, setContent] = useState({
        text: contentType === 'postModification' ? props.text : '',
        image: null,
    });

    const navigate = useNavigate();

    const { togglePostPublishMode } = useContext(PostPublishContext);
    const { togglePostEditMode } = props;
    const { token } = useContext(AuthContext);
    const { refreshPost } = props;

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
        else response = await CreatePost(content, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                setContent({ text: '', image: null });
            }
            if (contentType === 'postModification') {
                togglePostEditMode();
                refreshPost(props.id);
            } else {
                togglePostPublishMode();
                window.location.reload();
            }
        } else throw new Error(response);
    }

    return (
        <div className="post-edit__background">
            <div className="post-edit__interface">
                <div className="post-edit__top-bar">
                    {contentType === 'postModification' ? (
                        <h2>Modifier un message</h2>
                    ) : (
                        <h2>Rédiger un message</h2>
                    )}
                    <img
                        src={closeButton}
                        alt="Fermer l'interface d'écriture"
                        className="post-edit__close-button"
                        onClick={
                            contentType === 'postModification'
                                ? togglePostEditMode
                                : togglePostPublishMode
                        }
                    />
                </div>
                <form
                    className="post-edit__form"
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
                    <div className="post-edit__bottom-bar">
                        <label htmlFor="post-image-upload">
                            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                            <img
                                src={imageUploadButton}
                                alt="Bouton d'ajout d'une image"
                                title="Ajouter une image"
                                className="post-edit__image-upload-button"
                            />
                            <input
                                type="file"
                                name="image"
                                id="post-image-upload"
                                onChange={(evt) => handleContentChange(evt)}
                            />
                        </label>
                        <button
                            type="submit"
                            className="post-edit__submit-button"
                        >
                            Publier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
