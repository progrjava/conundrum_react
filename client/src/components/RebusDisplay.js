import React, { useState } from 'react';
import '../css/RebusDisplay.css';

const RebusDisplay = ({ gameData }) => {
    if (!gameData || !gameData.rebuses) return null;

    return (
        <div className="rebus-game-container">
            <h2>Ребусы</h2>
            <div className="rebuses-list">
                {gameData.rebuses.map((rebus, index) => (
                    <RebusCard key={index} rebus={rebus} index={index} />
                ))}
            </div>
        </div>
    );
};

const RebusCard = ({ rebus, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <div className="rebus-card">
            <div className="rebus-number">{index + 1}.</div>
            
            <div className="rebus-content">
                {rebus.parts.map((part, partIndex) => (
                    <div key={partIndex} className="rebus-part">
                        {part.type === 'text' && (
                            <span className="rebus-text-part">{part.content}</span>
                        )}

                        {part.type === 'image' && (
                            <div className="rebus-image-wrapper">
                                {part.subtract_start > 0 && (
                                    <div className="commas commas-left">
                                        {",".repeat(part.subtract_start)}
                                    </div>
                                )}

                                <img 
                                    src={part.imageUrl} 
                                    alt="rebus part" 
                                    className="rebus-image"
                                />

                                {part.subtract_end > 0 && (
                                    <div className="commas commas-right">
                                        {",".repeat(part.subtract_end)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="rebus-answer-section">
                {showAnswer ? (
                    <span className="rebus-answer-text">{rebus.word}</span>
                ) : (
                    <button className="btn-show-answer" onClick={() => setShowAnswer(true)}>
                        Показать ответ
                    </button>
                )}
            </div>
        </div>
    );
};

export default RebusDisplay;
