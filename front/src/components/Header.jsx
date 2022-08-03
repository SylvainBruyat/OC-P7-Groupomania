import redLogo from '../assets/icon-left-font-resized.png';

export default function Header() {
    return (
        <header>
            <a href="/">
                <img src={redLogo} alt="Logo Groupomania" />
            </a>
        </header>
    );
}
