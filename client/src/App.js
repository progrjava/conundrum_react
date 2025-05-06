import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignInUp from './components/SignInUp';
import PersonalAccount from './components/PersonalAccount';
import GameGenerator from './components/GameGenerator';
import { initializeSupabase } from './config/supabaseClient';
import { UIUtils } from './js/UIUtils';

const AppContent = () => {
    const [isBlackTheme, setIsBlackTheme] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [supabaseInstance, setSupabaseInstance] = useState(null);

    const toggleTheme = () => {
        setIsBlackTheme(!isBlackTheme);
    };

    // Определяем LTI режим
    const isLTI = window.location.search.includes('lti=true');
    const ltiUserId = isLTI ? new URLSearchParams(window.location.search).get('user_id') : null;
    const ltiContextId = new URLSearchParams(window.location.search).get('context_id');

    // Initialize Supabase
    useEffect(() => {
        const init = async () => {
            try {
                // Initialize Supabase
                const supabase = await initializeSupabase();
                setSupabaseInstance(supabase);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize Supabase:', error);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Handle auth state (Moved inside AppContent)
    useEffect(() => {
        let mounted = true;
        let authListener = null;

        const setupAuth = async () => {
            if (!supabaseInstance) return;

            try {
                // Get initial session
                const { data: { session }, error } = await supabaseInstance.auth.getSession();
                if (error) {
                    console.error('Error getting session:', error);
                    if (mounted) {
                        setIsAuth(false);
                        setUser(null);
                    }
                } else {
                    if (mounted) {
                        console.log('Initial session:', !!session);
                        setIsAuth(!!session);
                        setUser(session?.user || null);
                    }
                }

                // Listen for auth changes
                const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange(async (event, session) => {
                    console.log('Auth state changed:', event, { hasSession: !!session });
                    if (!mounted) return;

                    if (event === 'SIGNED_IN' && session?.user) {
                        setIsAuth(true);
                        setUser(session.user);
                    } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                        setIsAuth(false);
                        setUser(null);
                        // Clear any local storage data
                        window.localStorage.removeItem('supabase.auth.token');
                    }
                });

                authListener = subscription;

                if (mounted) {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Auth setup error:', error);
                if (mounted) {
                    setIsAuth(false);
                    setUser(null);
                    setIsLoading(false);
                }
            }
        };

        setupAuth();

        return () => {
            mounted = false;
            if (authListener) {
                authListener.unsubscribe();
            }
        };
    }, [supabaseInstance]);

    useEffect(() => {
        // Проверяем, является ли пользователь LTI пользователем и устанавливаем значение в localStorage
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('lti')) {
            localStorage.setItem('lti', 'true');
        } else {
            localStorage.removeItem('lti');
        }
    }, []);

    if (isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    // Если это LTI режим, сразу перенаправляем на GameGenerator
    if (isLTI) {
        return (
            <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
                <GameGenerator
                    isBlackTheme={isBlackTheme}
                    toggleTheme={toggleTheme}
                    user={user}
                    supabase={supabaseInstance}
                    ltiUserId={ltiUserId}
                    ltiContextId={ltiContextId}
                />
            </div>
        );
    }

    return (
        <Router>
            <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <MainPage
                                isBlackTheme={isBlackTheme}
                                toggleTheme={toggleTheme}
                                isAuth={isAuth}
                            />
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            isAuth ? (
                                <Navigate to="/account" replace/>
                            ) : (
                                <SignInUp
                                    isBlackTheme={isBlackTheme}
                                    toggleTheme={toggleTheme}
                                    supabase={supabaseInstance}
                                />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                    <Route path="/logout" element={<Navigate to="/" replace/>}/>
                    <Route
                        path="/account"
                        element={
                            isAuth ? (
                                <PersonalAccount
                                    isBlackTheme={isBlackTheme}
                                    toggleTheme={toggleTheme}
                                    user={user}
                                    supabase={supabaseInstance}
                                />
                            ) : (
                                <Navigate to="/register" replace/>
                            )
                        }
                    />
                    <Route
                        path="/gamegenerator"
                        element={
                            (isAuth || localStorage.getItem('lti') === 'true') ? ( // Добавлена проверка LTI режима
                                <GameGenerator
                                    isBlackTheme={isBlackTheme}
                                    toggleTheme={toggleTheme}
                                    user={user}
                                    supabase={supabaseInstance}
                                    ltiUserId={ltiUserId}
                                    ltiContextId={ltiContextId}
                                />
                            ) : (
                                <Navigate to="/register" replace/>
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <AppContent/>
    );
};

export default App;