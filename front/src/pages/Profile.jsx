import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import ContentWriting from '../components/ContentWriting';
import {
    GetFivePostsFromUser,
    GetOnePost,
    DeletePost,
} from '../services/post.service';
import {
    GetProfile,
    ModifyProfile,
    DeleteProfile,
} from '../services/user.service';

import DefaultProfilePicture from '../assets/icons/default-profile-picture.svg';

let name = '';

export default function Profile() {
    const [customMessage, setCustomMessage] = useState('');
    const [posts, setPosts] = useState([]);
    const [file, setFile] = useState();
    const [profilePicture, setProfilePicture] = useState('');

    const [profilePageNumber, setProfilePageNumber] = useState(1);
    const profilePageNumberRef = useRef(profilePageNumber);
    const _setProfilePageNumber = (newValue) => {
        profilePageNumberRef.current = newValue;
        setProfilePageNumber(newValue);
    };

    const [reachedLastProfilePost, setReachedLastProfilePost] = useState(false);
    const reachedLastProfilePostRef = useRef(reachedLastProfilePost);
    const _setReachedLastProfilePost = (newValue) => {
        reachedLastProfilePostRef.current = newValue;
        setReachedLastProfilePost(newValue);
    };

    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(loading);
    const _setLoading = (newValue) => {
        loadingRef.current = newValue;
        setLoading(newValue);
    };

    const navigate = useNavigate();

    const params = useParams();
    const { postPublishMode } = useContext(PostPublishContext);
    const { token, userId, admin, handleLogout } = useContext(AuthContext);

    const deleteProfileDialog = document.getElementById('deleteProfileDialog');

    function handlePictureUpload(evt) {
        setFile(evt.target.files[0]);
    }

    async function handlePictureSubmit(evt) {
        evt.preventDefault();
        let formData = new FormData();
        formData.append('image', file);

        const response = await ModifyProfile(params.id, formData, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else setProfilePicture(response.profilePictureUrl);
        } else setCustomMessage(response);
    }

    function showDeletePostDialog() {
        deleteProfileDialog.showModal();
    }

    async function handleDeleteProfile(userId) {
        const response = await DeleteProfile(userId, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else handleLogout();
        } else setCustomMessage(response);
    }

    async function handleDeletePost(postId) {
        const response = await DeletePost(postId, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else window.location.reload();
        } else setCustomMessage(response);
    }

    async function refreshPost(postId) {
        const response = await GetOnePost(postId, token);
        setPosts(
            posts.map((post) => {
                if (post._id !== postId) return post;
                else return response.newPost;
            })
        );
    }

    const handleScroll = async () => {
        if (loadingRef.current === true) return;
        if (
            window.location.href.includes('profile') &&
            window.innerHeight + Math.ceil(window.scrollY) >=
                document.body.offsetHeight + 80 &&
            reachedLastProfilePostRef.current === false
        ) {
            FetchFivePostsFromUser();
        }
    };

    async function FetchFivePostsFromUser() {
        if (loading === true) return;
        _setLoading(true);
        const response = await GetFivePostsFromUser(
            params.id,
            profilePageNumberRef.current,
            token
        );
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                setPosts((posts) => [...posts, ...response.newPosts]);
                _setProfilePageNumber(profilePageNumberRef.current + 1);
            }
            if (response.newPosts.length < 5) _setReachedLastProfilePost(true);
        } else setCustomMessage(response);
        _setLoading(false);
    }

    async function FetchProfile() {
        try {
            if (loading === true) return;
            const response = await GetProfile(params.id, token);
            if (response.status) {
                if (response.status === 401) navigate('/');
                else {
                    name = `${response.profileData.firstName} ${response.profileData.lastName}`;
                    setProfilePicture(response.profileData.profilePictureUrl);
                    FetchFivePostsFromUser();
                }
            } else setCustomMessage(response);
        } catch (error) {
            setCustomMessage(`${error.message}`);
            console.error(error);
        }
    }

    useEffect(() => {
        FetchProfile();
        setTimeout(() => {
            window.addEventListener('scroll', handleScroll);
        }, 500);
        return window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {postPublishMode && <ContentWriting contentType="postCreation" />}
            <section className="profile-wrapper">
                {/* A refactoriser dans un composant */}
                <p className="custom-message">{customMessage}</p>
                <div className="image-wrapper">
                    <img
                        src={
                            profilePicture === ''
                                ? DefaultProfilePicture
                                : profilePicture
                        }
                        alt={name}
                        className="profile-picture"
                    />
                    <form onSubmit={handlePictureSubmit}>
                        <input
                            type="file"
                            accept=".jpg, .jpeg, .png, .gif, .webp"
                            onChange={handlePictureUpload}
                        />
                        <button type="submit">Confirmer</button>
                    </form>
                </div>
                <dialog id="deleteProfileDialog">
                    <form method="dialog">
                        <p>Souhaitez-vous réellement supprimer ce profil ?</p>
                        <p className="alert">Cette action est irréversible.</p>
                        <p>
                            Tous vos messages et commentaires et toutes vos
                            données seront définitivement supprimés.
                        </p>
                        <div className="deleteProfileDialog__button-div">
                            <button
                                value="cancel"
                                className="deleteProfileDialog__button"
                                autoFocus
                            >
                                Annuler
                            </button>
                            <button
                                value="confirm"
                                className="deleteProfileDialog__button"
                                onClick={() => handleDeleteProfile(params.id)}
                            >
                                Confirmer
                            </button>
                        </div>
                    </form>
                </dialog>
                <div className="profile-info">
                    <h1>{name}</h1>
                    {(admin === true ||
                        admin === 'true' ||
                        userId === params.id) && (
                        <button
                            className="profile-delete-button"
                            onClick={() => showDeletePostDialog()}
                        >
                            Supprimer le profil
                        </button>
                    )}
                </div>
                {posts.map((post) => (
                    <Post
                        key={post._id}
                        id={post._id}
                        author={post.userId}
                        text={post.text}
                        imageUrl={post.imageUrl}
                        numberOfLikes={post.numberOfLikes}
                        likeUserIds={post.likeUserIds}
                        creationTimestamp={post.creationTimestamp}
                        modificationTimestamp={post.modificationTimestamp}
                        handleDeletePost={handleDeletePost}
                        refreshPost={refreshPost}
                    />
                ))}
                {reachedLastProfilePost && (
                    <p>
                        Vous avez atteint le dernier message. Il n'y a plus rien
                        à voir.
                    </p>
                )}
            </section>
        </>
    );
}
