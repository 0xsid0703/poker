import Authenticated from 'components/Authenticated';
import Layout from 'layouts/Layout';
import CreateRoom from 'pages/CreateRoom';
import FindRoom from 'pages/FindRoom';
import Playground from 'pages/Playground';
import StandBy from 'pages/StandBy';
import { createBrowserRouter } from 'react-router-dom';
const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Authenticated>
                <Layout />
            </Authenticated>
        ),
        children: [
            {
                path: '/',
                element: <FindRoom />
            },
            {
                path: 'find-rooms',
                element: <FindRoom />
            },
            {
                path: 'create-room',
                element: <CreateRoom />
            },
            {
                path: 'playground',
                element: <Playground />
            },
            {
                path: 'stand-by',
                element: <StandBy />
            }
        ]
    }
]);

export default router;