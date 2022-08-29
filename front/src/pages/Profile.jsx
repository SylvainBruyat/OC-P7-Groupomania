import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import PostPublish from '../components/PostPublish';
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
let reachedLastProfilePost = false;

export default function Profile() {
    const [customMessage, setCustomMessage] = useState('');
    const [posts, setPosts] = useState([]);
    const [file, setFile] = useState();
    const [profilePicture, setProfilePicture] = useState('');

    const navigate = useNavigate();

    let profilePageNumber = 1;

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
            else setPosts(posts.filter((post) => post._id !== postId));
            /* else {
                const deletedIndex = posts.findIndex(
                    (post) => post._id === postId
                );
                const pageOfDeletedPost = Math.ceil((deletedIndex + 1) / 5);
                setPosts(posts.slice(0, (pageOfDeletedPost - 1) * 5));
                console.log('pageNumber dans handleDeletePost');
                profilePageNumber = pageOfDeletedPost;
                console.log('FetchFivePostsFromUser');
                FetchFivePostsFromUser();
            } */
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

    //TODO Séparer le useEffect en 2 ?
    useEffect(() => {
        window.onscroll = async function () {
            if (
                window.location.href.includes('profile') &&
                window.innerHeight + Math.ceil(window.scrollY) >=
                    document.body.offsetHeight + 80 &&
                reachedLastProfilePost === false
            ) {
                profilePageNumber++;
                const response = await GetFivePostsFromUser(
                    params.id,
                    profilePageNumber,
                    token
                );
                if (response.status) {
                    if (response.status === 401) navigate('/');
                    else setPosts((posts) => [...posts, ...response.newPosts]);
                    if (response.newPosts.length < 5)
                        reachedLastProfilePost = true;
                } else setCustomMessage(response);
            }
        };

        async function FetchProfile() {
            try {
                const response = await GetProfile(params.id, token);
                if (response.status) {
                    if (response.status === 401) navigate('/');
                    else {
                        name = `${response.profileData.firstName} ${response.profileData.lastName}`;
                        setProfilePicture(
                            response.profileData.profilePictureUrl
                        );

                        const postsResponse = await GetFivePostsFromUser(
                            params.id,
                            profilePageNumber,
                            token
                        );
                        if (postsResponse.status) {
                            setPosts((posts) => [
                                ...posts,
                                ...postsResponse.newPosts,
                            ]);
                        } else setCustomMessage(postsResponse);
                    }
                } else setCustomMessage(response);
            } catch (error) {
                setCustomMessage(`${error.message}`);
                console.error(error);
            }
        }
        FetchProfile();
    }, [profilePageNumber, params, token]);

    return (
        <>
            {postPublishMode ? <PostPublish /> : <></>}
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
