import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    const switchModeHandler = () => {
        setIsLoginMode(prevMode => !prevMode);
        setError(null);
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                await signup(name, email, password, bio);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-serif text-[#92400d] tracking-tight">Artisan's Compass</h1>
                <p className="mt-2 text-lg text-stone-600">Welcome! Please sign in or create an account to continue.</p>
            </header>
            <main className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
                <h2 className="text-2xl font-semibold text-stone-700 text-center mb-6">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={submitHandler} className="space-y-6">
                    {!isLoginMode && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                                    Your Name or Brand Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="e.g., Jane Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-stone-700">
                                    About You or Your Craft (Bio)
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="e.g., Third-generation woodworker..."
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-stone-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                            placeholder="••••••"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-amber-800 hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-stone-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (isLoginMode ? 'Logging in...' : 'Signing up...') : (isLoginMode ? 'Login' : 'Create Account')}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={switchModeHandler} className="font-medium text-amber-700 hover:text-amber-600">
                        {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                    </button>
                </div>
            </main>
             <footer className="w-full max-w-4xl text-center mt-8 py-4">
                <p className="text-stone-500">Powered by Gemini</p>
            </footer>
        </div>
    );
};

export default AuthPage;