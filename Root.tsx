import React from 'react';
import { useAuth } from './context/AuthContext';
import App from './App';
import AuthPage from './pages/AuthPage';
import Spinner from './components/Spinner';

const Root: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spinner message="Initializing..." />
            </div>
        );
    }

    return isAuthenticated ? <App /> : <AuthPage />;
};

export default Root;