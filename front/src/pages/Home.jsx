import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';
import Post from '../components/Post';
import ContentWriting from '../components/ContentWriting';
import { GetFivePosts, GetOnePost, DeletePost } from '../services/post.service';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const [homePageNumber, setHomePageNumber] = useState(1);
    const [reachedLastPost, setReachedLastPost] = useState(false);
    const [loading, setLoading] = useState(false);

    const { postPublishMode } = useContext(PostPublishContext);
    const { token } = useContext(AuthContext);

    const navigate = useNavigate();

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

    window.onscroll = async function () {
        if (loading === true) return;
        if (
            window.location.href.includes('home') &&
            window.innerHeight + Math.ceil(window.scrollY) >=
                document.body.offsetHeight + 80 &&
            reachedLastPost === false
        ) {
            FetchFivePosts(homePageNumber);
        }
    };

    async function FetchFivePosts() {
        if (loading === true) return;
        setLoading(true);
        const response = await GetFivePosts(homePageNumber, token);
        if (response.status) {
            if (response.status === 401) navigate('/');
            else {
                setPosts((posts) => [...posts, ...response.newPosts]);
                setHomePageNumber((homePageNumber) => homePageNumber + 1);
            }
            if (response.newPosts.length < 5) setReachedLastPost(true);
        } else setCustomMessage(response);
        setLoading(false);
    }

    useEffect(() => {
        FetchFivePosts();
    }, []);

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
