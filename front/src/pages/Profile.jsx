import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import PostPublish from '../components/PostPublish';
import { GetFivePostsFromUser } from '../services/post.service';
import { GetProfile, ModifyProfile } from '../services/user.service';

import DefaultProfilePicture from '../assets/icons/default-profile-picture.svg';

let name = '';
let profilePicture = '';

export default function Profile() {
    const [customMessage, setCustomMessage] = useState('');
    const [posts, setPosts] = useState([]); // Remplacer par useReducer pour pouvoir rajouter les posts à chaque appel API ?
    const [file, setFile] = useState();

    const params = useParams();
    const { postPublishMode, togglePostPublishMode } =
        useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    let pageNumber = 1;
    function handlePictureUpload(evt) {
        setFile(evt.target.files[0]);
    }

    async function handlePictureSubmit(evt) {
        evt.preventDefault();
        let formData = new FormData();
        formData.append('image', file);

        const response = await ModifyProfile(params.id, formData, token);
        if (response.status) console.log(response.message);
        else setCustomMessage(response);
    }

    useEffect(() => {
        window.onscroll = async function () {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight
            ) {
                pageNumber++;
                const response = await GetFivePostsFromUser(
                    params.id,
                    pageNumber,
                    token
                );
                if (response.status)
                    setPosts((posts) => [...posts, ...response.newPosts]);
                else setCustomMessage(response);
            }
        };

        async function FetchProfile() {
            try {
                const response = await GetProfile(params.id, token);
                if (response.status) {
                    name = `${response.profileData.firstName} ${response.profileData.lastName}`;
                    profilePicture = response.profileData.profilePictureUrl;

                    const postsResponse = await GetFivePostsFromUser(
                        params.id,
                        pageNumber,
                        token
                    );
                    if (postsResponse.status) {
                        setPosts((posts) => [
                            ...posts,
                            ...postsResponse.newPosts,
                        ]);
                    } else setCustomMessage(postsResponse);
                } else setCustomMessage(response);
            } catch (error) {
                setCustomMessage(`${error.message}`);
                console.error(error);
            }
        }
        FetchProfile();
    }, [params, token]);

    return (
        <>
            <button onClick={togglePostPublishMode}>
                Cliquez ici pour rédiger un post
            </button>
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
                <div className="profile-info">
                    <h1>{name}</h1>
                </div>
                {posts.map((post) => (
                    <Post
                        key={post._id}
                        id={post._id}
                        author={post.userId}
                        userId={post.userId}
                        text={post.text}
                        imageUrl={post.imageUrl}
                        numberOfLikes={post.numberOfLikes}
                        likeUserIds={post.likeUserIds}
                        creationTimestamp={post.creationTimestamp}
                        modificationTimestamp={post.modificationTimestamp}
                    />
                ))}
            </section>
        </>
    );
}
