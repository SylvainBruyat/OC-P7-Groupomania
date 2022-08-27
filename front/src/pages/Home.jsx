import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import PostPublish from '../components/PostPublish';
import { GetFivePosts, GetOnePost, DeletePost } from '../services/post.service';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [customMessage, setCustomMessage] = useState('');

    const { postPublishMode } = useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    const navigate = useNavigate();

    let pageNumber = 1;

    async function insertPost(newPost) {
        setPosts((posts) => [newPost, ...posts]);
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

    async function handleDeletePost(postId) {
        const response = await DeletePost(postId, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else setPosts(posts.filter((post) => post._id !== postId));
        } else setCustomMessage(response);
    }

    //TODO Séparer le useEffect en 2 ?
    useEffect(() => {
        window.onscroll = async function () {
            if (
                window.location.href.includes('home') &&
                window.innerHeight + window.scrollY >=
                    document.body.offsetHeight + 80
            ) {
                pageNumber++;
                const response = await GetFivePosts(pageNumber, token);
                if (response.status) {
                    if (response.status === 401) navigate('/');
                    else setPosts((posts) => [...posts, ...response.newPosts]);
                } else setCustomMessage(response);
            }
        };

        async function FetchFivePosts() {
            const response = await GetFivePosts(pageNumber, token);
            if (response.status) {
                if (response.status === 401) navigate('/');
                else setPosts((posts) => [...posts, ...response.newPosts]);
            } else setCustomMessage(response);
        }
        FetchFivePosts();
    }, [pageNumber, token]);

    return (
        <div className="home-wrapper">
            <h1>Groupomania - Fil d'actualité</h1>
            {postPublishMode ? <PostPublish insertPost={insertPost} /> : <></>}
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
                    refreshPost={refreshPost}
                    handleDeletePost={handleDeletePost}
                />
            ))}
        </div>
    );
}
