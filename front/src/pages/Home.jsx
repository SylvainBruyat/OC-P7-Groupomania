import { useContext } from 'react';

import PostEdit from '../components/PostEdit';
import { PostEditContext } from '../utils/Context';

export default function Home() {
    const { postEditMode, togglePostEditMode } = useContext(PostEditContext);

    return (
        <div className="home-wrapper">
            <h1>Home page</h1>
            <button onClick={togglePostEditMode}>
                Cliquez ici pour rédiger un post
            </button>
            {postEditMode ? <PostEdit /> : <></>}
        </div>
    );
}
