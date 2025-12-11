import GameLogotype from '../assets/svg/GameLogotype';
import '../css/main.css';

export const Main = () => {
    
    return (
        <main>
        <div className="background-video-main"/>
        <div className="ellipse-bg"></div>
        <div className='main-logo-title'>
            <GameLogotype />
        </div>
        </main>
    )
}

export default Main