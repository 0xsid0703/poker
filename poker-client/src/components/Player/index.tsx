import './style.scss';

interface PlayerProps {
    avatar: string,
    username: string,
    balance: number,
}

const Player = (props: PlayerProps) => {
    return (
        <div className="player">
            <div className="avatar">
                <img src={props.avatar} alt="avatar" width={90} height={90} />
            </div>
            <div className="detail">
                <div className="username flex h-center">{props.username}</div>
                <hr></hr>
                <div className="balance flex h-center">${props.balance}</div>
            </div>
        </div>
    );
}

export default Player;