import { useState, useEffect, useContext } from 'react';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import PostPublish from '../components/PostPublish';
import { GetFivePosts } from '../services/post.service';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [customMessage, setCustomMessage] = useState('');

    const { postPublishMode, togglePostPublishMode } =
        useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    let pageNumber = 1;

    useEffect(() => {
        window.onscroll = async function () {
            if (
                window.location.href.includes('home') &&
                window.innerHeight + window.scrollY >=
                    document.body.offsetHeight
            ) {
                pageNumber++;
                const response = await GetFivePosts(pageNumber, token);
                if (response.status)
                    setPosts((posts) => [...posts, ...response.newPosts]);
                else setCustomMessage(response);
            }
        };

        async function FetchFivePosts() {
            const response = await GetFivePosts(pageNumber, token);
            if (response.status)
                setPosts((posts) => [...posts, ...response.newPosts]);
            else setCustomMessage(response);
        }
        FetchFivePosts();
    }, [pageNumber, token]);

    return (
        <div className="home-wrapper">
            <h1>Groupomania - Fil d'actualité</h1>
            <button onClick={togglePostPublishMode}>
                Cliquez ici pour rédiger un post
            </button>
            {postPublishMode ? <PostPublish /> : <></>}
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
        </div>
    );
}
