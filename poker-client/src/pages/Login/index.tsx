import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'store';
import { joinGame } from 'utils/socket';

import './style.scss';

const Login = () => {
    const navigate = useNavigate();
    const { isJoined } = useSelector((state) => state.player);
    if (isJoined) {
        navigate('/find-rooms');
    }

    const [username, setUsername] = useState("");

    const handleUsernameChange = (e: React.FormEvent<HTMLInputElement>) => {
        setUsername(e.currentTarget.value);
    }

    const login = () => {
        if (username) {
            joinGame(username);
        }
    }

    return (
        <div className='login'>
            <div className='login-field'>
                <div className='flex username-field'>
                    <div className="username">
                        <input
                            placeholder='Username'
                            onChange={handleUsernameChange}
                        />
                    </div>
                </div>
                <div className="login-btn flex h-center" onClick={login}>
                    Login
                </div>
            </div>
        </div>
    );
}

export default Login;