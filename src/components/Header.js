import React from 'react'

export default function Header() {
    
    return (
        <header>
            <div>
                <button className='start-button'>
                    Начать
                </button>
                <button className='about-button'>
                    О проекте
                </button>
                <button className='manual-button'>
                    Инструкция
                </button>
            </div>
        </header>
    )
}
