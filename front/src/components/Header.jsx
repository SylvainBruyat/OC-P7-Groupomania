import { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext, PostPublishContext } from '../utils/Context';

import redLogo from '../assets/icon-left-font-resized.png';
import homepageButton from '../assets/icons/homepage-button.svg';
import profileButton from '../assets/icons/profile-button.svg';
import postWriteIcon from '../assets/icons/post-writing-icon.svg';
import disconnectButton from '../assets/icons/logout-icon.svg';

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
                        <img
                            src={homepageButton}
                            alt="Accueil"
                            className="homepage-link__icon"
                        />
                        <span className="homepage-link__text">Accueil</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`/profile/${userId}`}
                        className={({ isActive }) =>
                            isActive ? 'active-link' : undefined
                        }
                    >
                        <img
                            src={profileButton}
                            alt="Profil"
                            className="profile-link__icon"
                        />
                        <span className="profile-link__text">Profil</span>
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
                <img
                    src={disconnectButton}
                    alt="Déconnexion"
                    className="logout-button__icon"
                />
                <span className="logout-button__text">Déconnexion</span>
            </button>
        </header>
    );
}
