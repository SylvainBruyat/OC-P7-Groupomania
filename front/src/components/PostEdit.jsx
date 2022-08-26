import { useContext, useState } from 'react';

import { AuthContext } from '../utils/Context';
import { ModifyPost } from '../services/post.service';

import closeButton from '../assets/icons/close-button.svg';
import imageUploadButton from '../assets/icons/image-upload-button.svg';

export default function PostEdit(props) {
    const [postContent, setPostContent] = useState({
        text: props.text,
        image: null,
    });

    const { token } = useContext(AuthContext);
    const { togglePostEditMode, refreshPost } = props;

    function handlePostContentChange(evt) {
        if (evt.target.name === 'text') {
            setPostContent({ ...postContent, text: evt.target.value });
        } else {
            setPostContent({ ...postContent, image: evt.target.files[0] });
        }
    }

    function handlePostEditing(evt) {
        evt.preventDefault();
        EditPost();
    }

    async function EditPost() {
        const response = await ModifyPost(props.id, postContent, token);
        if (response.status) {
            setPostContent({ text: '', image: null });
            togglePostEditMode();
            refreshPost(props.id);
        } else throw new Error(response);
    }

    return (
        <div className="post-edit__background">
            <div className="post-edit__interface">
                <div className="post-edit__top-bar">
                    <h2>Modifier un message</h2>
                    <img
                        src={closeButton}
                        alt="Fermer l'interface d'écriture de post"
                        className="post-edit__close-button"
                        onClick={togglePostEditMode}
                    />
                </div>
                <form
                    className="post-edit__form"
                    onSubmit={(evt) => handlePostEditing(evt)}
                >
                    <textarea
                        id="text"
                        name="text"
                        placeholder="Ecrivez votre message ici"
                        value={postContent.text}
                        onChange={(evt) => handlePostContentChange(evt)}
                        required
                        autoFocus
                    ></textarea>
                    <div className="post-edit__bottom-bar">
                        <label htmlFor="post-image-upload">
                            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                            <img
                                src={imageUploadButton}
                                alt="Ajouter une image"
                                title="Ajouter une image"
                                className="post-edit__image-upload-button"
                            />
                            <input
                                type="file"
                                name="image"
                                id="post-image-upload"
                                onChange={(evt) => handlePostContentChange(evt)}
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
