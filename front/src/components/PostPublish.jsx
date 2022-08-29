import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PostPublishContext, AuthContext } from '../utils/Context';
import { CreatePost } from '../services/post.service';

import closeButton from '../assets/icons/close-button.svg';
import imageUploadButton from '../assets/icons/image-upload-button.svg';

export default function PostPublish() {
    const [postContent, setPostContent] = useState({ text: '', image: null });

    const { togglePostPublishMode } = useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    const navigate = useNavigate();

    function handlePostContentChange(evt) {
        if (evt.target.name === 'text') {
            setPostContent({ ...postContent, text: evt.target.value });
        } else {
            setPostContent({ ...postContent, image: evt.target.files[0] });
        }
    }

    function handlePostPublishing(evt) {
        evt.preventDefault();
        PublishPost();
    }

    async function PublishPost() {
        const response = await CreatePost(postContent, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                setPostContent({ text: '', image: null });
                togglePostPublishMode();
                window.location.reload();
            }
        } else throw new Error(response);
    }

    return (
        <div className="post-edit__background">
            <div className="post-edit__interface">
                <div className="post-edit__top-bar">
                    <h2>Rédiger un message</h2>
                    <img
                        src={closeButton}
                        alt="Fermer l'interface d'écriture de post"
                        className="post-edit__close-button"
                        onClick={togglePostPublishMode}
                    />
                </div>
                <form
                    className="post-edit__form"
                    onSubmit={(evt) => handlePostPublishing(evt)}
                >
                    <textarea
                        id="text"
                        name="text"
                        placeholder="Ecrivez votre message ici"
                        value={postContent.postText}
                        onChange={(evt) => handlePostContentChange(evt)}
                        maxLength={5000}
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
