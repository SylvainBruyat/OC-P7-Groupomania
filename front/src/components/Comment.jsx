//import likeLogoEmpty from '../assets/like-empty.svg';
//import likeLogoFull from '../assets/like-full.svg';

export default function Comment(props) {
    function formatTime(timestamp) {
        if (timestamp === null) return null;
        //Extracts an array with [year, month, date]
        const date = timestamp.split('T')[0].split('-');
        //Extracts an array with [hours, minutes, seconds]
        const time = timestamp.split('T')[1].split('.')[0].split(':');
        return `${date[2]}/${date[1]}/${date[0]} à ${time[0]}h${time[1]}`;
    }
    const creationTime = formatTime(props.creationTimestamp);
    const modificationTime = formatTime(props.modificationTimestamp);

    return (
        <div className="comment-card">
            <div className="comment-card__name-text">
                <p className="comment-card__name-text__name">{props.author}</p>{' '}
                {/* TODO Transformer le nom en lien vers le profil */}
                <p>{props.text}</p>
            </div>
            <p className="comment-card__create-time">Posté le {creationTime}</p>
            {props.modificationTimestamp === null ? null : (
                <p className="comment-card__modify-time">
                    Modifié le {modificationTime}
                </p>
            )}
            <div className="comment-card__like">
                <button className="comment-card__like__like-button">
                    J'aime
                    {/* <img
                        className="comment-card__like__like-icon"
                        src={likeLogoEmpty}
                        alt="Liker"
                    /> */}
                </button>
                <span>
                    {props.numberOfLikes > 0 ? props.numberOfLikes : null}
                </span>
            </div>
        </div>
    );
}
