import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Publish from './pages/Publish';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'forum',
        element: <Forum />,
      },
      {
        path: 'publish',
        element: <Publish />,
      },
    ],
  },
]);