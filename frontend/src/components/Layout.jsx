import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { SocketProvider } from '../context/SocketContext';

const Layout = () => {
    return (
        <SocketProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </SocketProvider>
    );
};

export default Layout;
