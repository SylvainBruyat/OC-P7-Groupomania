import { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';

import redLogo from '../assets/icon-left-font-resized.png';
import postWriteIcon from '../assets/icons/post-writing-icon.svg';

export default function Header() {
    const { handleLogout, userId } = useContext(AuthContext);
    const { togglePostPublishMode } = useContext(PostPublishContext);

    return (
        <header>
            <NavLink to="/home">
                <img
                    className="header-logo"
                    src={redLogo}
                    alt="Retour à l'accueil"
                />
            </NavLink>
            <ul className="header-links">
                <li>
                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            isActive ? 'active-link' : undefined
                        }
                    >
                        Accueil
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`/profile/${userId}`}
                        className={({ isActive }) =>
                            isActive ? 'active-link' : undefined
                        }
                    >
                        Profil
                    </NavLink>
                </li>
            </ul>
            <button
                className="post-writing__button"
                onClick={togglePostPublishMode}
            >
                <p>
                    <img
                        className="post-writing__icon"
                        src={postWriteIcon}
                        alt="Cliquez ici pour écrire un message"
                    />
                </p>
                <input placeholder="Ecrivez quelque chose"></input>
            </button>
            <button className="logout-button" onClick={() => handleLogout()}>
                Déconnexion
            </button>
        </header>
    );
}
