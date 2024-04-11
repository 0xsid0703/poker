import Login from 'pages/Login';
import { ReactNode } from 'react';
import { useSelector } from 'store';

const Authenticated = ({ children }: { children: ReactNode }) => {
    const { isJoined } = useSelector((state) => state.player);
    if (!isJoined) {
        return <Login />
    }
    return <>{children}</>
};

export default Authenticated;