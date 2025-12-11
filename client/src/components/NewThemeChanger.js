import '../css/newThemeChanger.css';

const NewThemeChanger = ({isBlackTheme, toggleTheme}) => {
    return isBlackTheme ? (
        <button className='theme-changer-button' onClick={toggleTheme}>
            <svg className='theme-switcher-icon  sun' viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 16.4545C14.0124 16.4545 16.4545 14.0124 16.4545 11C16.4545 7.98749 14.0124 5.54541 11 5.54541C7.98749 5.54541 5.54541 7.98749 5.54541 11C5.54541 14.0124 7.98749 16.4545 11 16.4545Z" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.0909 11H21" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 1.90909V1" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 20.9999V20.0908" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.2727 18.2726L17.3636 17.3635" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.2727 3.72729L17.3636 4.63639" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.72729 18.2726L4.63639 17.3635" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.72729 3.72729L4.63639 4.63639" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 11H1.90909" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    ) : 
    (
        <button className='theme-changer-button' onClick={toggleTheme}>
            <svg className='theme-switcher-icon moon' viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 10.4518C1 16.2774 5.7226 21 11.5482 21C15.6899 21 19.274 18.6131 21 15.1399C11.5482 15.1399 6.86012 10.4518 6.86012 1C3.3869 2.72604 1 6.31017 1 10.4518Z" stroke="#513888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    )
}


export default NewThemeChanger