import { useContext, useState } from 'react';

import { PostEditContext, AuthContext } from '../utils/Context';

import closeButton from '../assets/icons/close-button.svg';

export default function PostEdit() {
    const [postContent, setPostContent] = useState({ text: '', image: null });

    const { togglePostEditMode } = useContext(PostEditContext);
    const { token } = useContext(AuthContext);

    function handlePostContentChange(evt) {
        const { name, value } = evt.target;
        setPostContent({ ...postContent, [name]: value });
    }

    function handlePostPublishing(evt) {
        evt.preventDefault();
        PublishPost();
    }

    async function PublishPost() {
        try {
            const response = await fetch('http://localhost:3000/api/post', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postContent),
            });
            if (response.status === 201) {
                setPostContent({ text: '', image: null });
                togglePostEditMode();
            } else if (response.status === 500) {
                throw new Error(
                    'Une erreur est survenue côté serveur. Veuillez réessayer ultérieurement.'
                );
            } else throw new Error('Erreur inconnue');
        } catch (error) {
            console.error(error);
        }
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
                        onClick={togglePostEditMode}
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
                        required
                    ></textarea>
                    <button type="submit" className="post-edit__submit-button">
                        Publier
                    </button>
                </form>
            </div>
        </div>
    );
}
