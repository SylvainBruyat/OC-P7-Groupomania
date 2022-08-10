import { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../utils/Context';

import redLogo from '../assets/icon-left-font-resized.png';

export default function Header() {
    const { handleLogout, userId } = useContext(AuthContext);

    return (
        <header>
            <NavLink to="/home">
                <img src={redLogo} alt="Retour à l'accueil" />
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
            <button className="logout-button" onClick={() => handleLogout()}>
                Déconnexion
            </button>
        </header>
    );
}
