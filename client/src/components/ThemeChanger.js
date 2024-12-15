import React, { Component } from 'react';
import '../css/themeChanger.css';

const ThemeChanger = ({isBlackTheme, toggleTheme, page}) => {
    return (
        <div id={`${page ? 'game-theme-changer' : ''}`} className='theme-changer'>
            <svg id={`${page ? 'game-black-theme-switch' : ''}`} className='black-theme-switch' onClick={() => toggleTheme(true)} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                stroke-width="4" d="M4 15.342C4 22.332 9.667 28 16.658 28c4.97 0 
                9.27-2.864 11.342-7.032-11.342 0-16.968-5.626-16.968-16.968A12.658 
                12.658 0 0 0 4 15.342Z"/>
            </svg>
            <svg id={`${page ? 'game-white-theme-switch' : ''}`} className='white-theme-switch' onClick={() => toggleTheme(false)}  xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                <g stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-path="url(#a)">
                    <path d="M16 24a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM29.333 16h1.334M16 2.667V1.333M16 
                    30.667v-1.334M26.667 26.667l-1.334-1.334M26.667 5.333l-1.334 1.334M5.333 26.667l1.334-1.334M5.333 
                    5.333l1.334 1.334M1.333 16h1.334"/>
                </g>
            </svg>
        </div>
    )
}


export default ThemeChanger