import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import ContentWriting from '../components/ContentWriting';
import { GetFivePosts, GetOnePost, DeletePost } from '../services/post.service';

let reachedLastPost = false;

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [customMessage, setCustomMessage] = useState('');

    const { postPublishMode } = useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    const navigate = useNavigate();

    let homePageNumber = 1;

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
            else window.location.reload();
        } else setCustomMessage(response);
    }

    //TODO Séparer le useEffect en 2 ?
    useEffect(() => {
        window.onscroll = async function () {
            if (
                window.location.href.includes('home') &&
                window.innerHeight + Math.ceil(window.scrollY) >=
                    document.body.offsetHeight + 80 &&
                reachedLastPost === false
            ) {
                homePageNumber++;
                const response = await GetFivePosts(homePageNumber, token);
                if (response.status) {
                    if (response.status === 401) navigate('/');
                    else setPosts((posts) => [...posts, ...response.newPosts]);
                    if (response.newPosts.length < 5) reachedLastPost = true;
                } else setCustomMessage(response);
            }
        };

        async function FetchFivePosts() {
            reachedLastPost = false;
            const response = await GetFivePosts(homePageNumber, token);
            if (response.status) {
                if (response.status === 401) navigate('/');
                else setPosts((posts) => [...posts, ...response.newPosts]);
                if (response.newPosts.length < 5) reachedLastPost = true;
            } else setCustomMessage(response);
        }
        FetchFivePosts();
    }, [homePageNumber, token]);

    return (
        <div className="home-wrapper">
            <h1>Groupomania - Fil d'actualité</h1>
            {postPublishMode && <ContentWriting contentType="postCreation" />}
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
                    refreshPost={refreshPost}
                    handleDeletePost={handleDeletePost}
                />
            ))}
            {reachedLastPost && (
                <p>
                    Vous avez atteint le dernier message. Il n'y a plus rien à
                    voir.
                </p>
            )}
        </div>
    );
}
