import PuzzleCreatorIcon from "../assets/svg/PuzzleCreatorIcon";
import NewThemeChanger from "./NewThemeChanger";
import '../css/gameMenu.css';
import SaveButton from "../assets/svg/SaveButton";
import DownloadPdf from "../assets/svg/DownloadPdf";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';


const GameMenu = ({
    isAuth, 
    isBlackTheme, 
    toggleTheme, 
    isLTI,
    isAuthenticated,
    isCurrentGameData,
    isEditing,
    handleEnterEditMode,
    handleActualSavePuzzle,
    handleDownloadPdf,
    isLoading,
    toggleFormCreatingPuzzle,
    isFormCreatingPuzzle
}) => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    const navToRegister = () => navigate('/register');
    const navToProfile = () => navigate('/account');

    const profileOnClick = isAuth ? navToProfile : navToRegister;

    return (
        <section className={`game-menu-sidebar ${open ? "open" : "closed"}`}>
            <button 
                className='game-menu-toggle-button'
                onClick={() => {
                    if (isFormCreatingPuzzle) {
                        setOpen(!open);
                        toggleFormCreatingPuzzle();
                    }
                    else {
                        setOpen(!open);
                    }
                }}
            >
                <svg viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.9934 0V40H0V0H18.2117V21.732C18.2117 22.8028 18.5668 23.693 19.2706 24.409C19.9743 25.125 20.8753 25.4798 21.9671 25.4798C23.0589 25.4798 23.9665 25.125 24.6966 24.409C25.4266 23.693 25.7883 22.8028 25.7883 21.732V0H44H43.9934Z" fill="#000"/>
                </svg>
            </button>
            <div className="game-menu-content">
                {!isLTI && (
                    <button className='game-menu-profile-button' onClick={profileOnClick}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.25 7a5.75 5.75 0 1 1 11.5 0 5.75 5.75 0 0 1-11.5 0ZM11.797 14.261a.755.755 0 0 1 .13-.011h.144c.044 0 .088.004.131.011l7.295 1.283a.64.64 0 0 1 .038.008c1.343.31 2.787 1.163 3.068 2.82a.73.73 0 0 1 .005.029l.113.877v.002c.265 2.009-1.328 3.47-3.21 3.47a.753.753 0 0 1-.123-.01h-14.9c-1.882 0-3.475-1.462-3.21-3.472l.114-.869a.753.753 0 0 1 .005-.03c.28-1.627 1.735-2.528 3.077-2.819a.719.719 0 0 1 .029-.006l7.294-1.283Z" fill="#000000"/>
                        </svg>
                    </button>
                )}
                <button 
                    className={`open-game-form-button ${isFormCreatingPuzzle ? 'clicked' : ''}`}
                    onClick={toggleFormCreatingPuzzle}>
                    <PuzzleCreatorIcon />
                </button>
                <NewThemeChanger isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
                
                {!isLTI && isAuthenticated && isCurrentGameData && !isEditing && (
                    <>
                        <button
                            onClick={handleEnterEditMode}
                            className="game-action-button edit-puzzle-button"
                            title='Редактировать слова и подсказки'
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.0207 5.82839L15.8491 2.99996L20.7988 7.94971L17.9704 10.7781M13.0207 5.82839L3.41405 15.435C3.22652 15.6225 3.12116 15.8768 3.12116 16.1421V20.6874H7.66648C7.93181 20.6874 8.18613 20.582 8.37367 20.3945L17.9704 10.7781M13.0207 5.82839L17.9704 10.7781" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button
                            onClick={handleActualSavePuzzle}
                            className="game-action-button save-puzzle-button"
                            title='Сохранить в свои головоломки'
                            disabled={isLoading}
                        >
                            <SaveButton />
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            className="game-action-button download-pdf-button"
                            title='Cкачать в PDF'
                            disabled={isLoading}
                        >
                            <DownloadPdf />
                        </button>
                    </>
                )}
                
            </div>
        </section>
    );
}

export default GameMenu;