import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignInUp from './components/SignInUp';
import PersonalAccount from './components/PersonalAccount';
import GameGenerator from './components/GameGenerator';
import { initializeSupabase } from './config/supabaseClient';

const AppContent = () => {
    const [isBlackTheme, setIsBlackTheme] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [supabaseInstance, setSupabaseInstance] = useState(null);

    const toggleTheme = () => setIsBlackTheme(!isBlackTheme);

    useEffect(() => {
        let mounted = true;
        const urlParams = new URLSearchParams(window.location.search);
        const isLTI = urlParams.has('lti');

        const handleAuth = async () => {
            console.log("App.js: Starting auth process...");
            try {
                const supabase = await initializeSupabase();
                if (!mounted) return;
                setSupabaseInstance(supabase);

                const supabaseToken = urlParams.get('supabase_token');

                if (isLTI && supabaseToken) {
                    console.log("App.js: LTI mode detected. Setting session from token...");
                    await supabase.auth.setSession({
                        access_token: supabaseToken,
                        refresh_token: supabaseToken,
                    });
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    const currentUser = session?.user || null;
                    console.log('App.js: Final user state determined:', currentUser);
                    setUser(currentUser);
                }

                supabase.auth.onAuthStateChange((_event, session) => {
                    if (mounted) {
                        setUser(session?.user || null);
                    }
                });

            } catch (error) {
                console.error('App.js: Auth setup failed:', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        handleAuth();

        return () => { mounted = false; };
    }, []);

    if (isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    const isLTI = window.location.search.includes('lti=true');
    if (isLTI) {
        return (
            <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
                <GameGenerator
                    isBlackTheme={isBlackTheme}
                    toggleTheme={toggleTheme}
                    user={user}
                    isAuth={!!user}
                    supabase={supabaseInstance}
                />
            </div>
        );
    }

    return (
        <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
            <Routes>
                <Route path="/" element={<MainPage isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} isAuth={!!user} />} />
                <Route path="/register" element={user ? <Navigate to="/account" /> : <SignInUp isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} supabase={supabaseInstance} />} />
                <Route path="/gamegenerator" element={user ? <GameGenerator isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} user={user} isAuth={!!user} supabase={supabaseInstance} /> : <Navigate to="/register" />} />
                <Route path="/account" element={user ? <PersonalAccount isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} user={user} supabase={supabaseInstance} /> : <Navigate to="/register" />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

const App = () => <AppContent />;

export default App;