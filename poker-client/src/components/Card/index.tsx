import './style.scss'

interface CardProps {
    cardValue?: number,
    isShow?: boolean,
}

const Card = (props: CardProps) => {
    const cardFolderUrl = "cards/";
    return (
        <div className='card'>
            <img src={props.isShow ? `${cardFolderUrl}${props.cardValue}.png` : "cards/back.png"} alt="card" width={70} height={100} />
        </div>
    );
}

export default Card;