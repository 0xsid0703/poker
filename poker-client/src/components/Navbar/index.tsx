import { Link } from 'react-router-dom';
import { SlUser } from 'react-icons/sl';

import './style.scss';
import { useSelector } from 'store';

const Navbar = () => {
    const { player } = useSelector((state) => state.player);
    if (!player) return <></>;
    return (
        <div className="navbar">
            <nav>
                <ul>
                    <li>
                        <Link to="/find-rooms">Find Room</Link>
                    </li>
                    <li>
                        <Link to="/create-room">Create Room</Link>
                    </li>
                </ul>
            </nav>
            <div className="profile">
                <div className="v-center avatar">
                    <SlUser />
                </div>
                <div className="v-center">
                    <div>{player.name}</div>
                    <div>${player.balance}</div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;