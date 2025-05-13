// src/components/MyPuzzlesList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем импорт
import { getUserPuzzlesFromSupabase, deletePuzzleFromSupabase } // Предполагаем, что delete тоже будет в puzzleService
    from '../services/puzzleService';
import { UIUtils } from '../js/UIUtils'; // Для сообщений

const MyPuzzlesList = () => {
    const [puzzles, setPuzzles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Получаем функцию navigate

    useEffect(() => {
        const fetchPuzzles = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const userPuzzles = await getUserPuzzlesFromSupabase();
                setPuzzles(userPuzzles);
            } catch (err) {
                console.error("Error fetching user puzzles:", err);
                setError(err.message || 'Не удалось загрузить список ваших игр.');
                UIUtils.showError(err.message || 'Не удалось загрузить список ваших игр.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPuzzles();
    }, []);

    const handleDeletePuzzle = async (puzzleId, puzzleName) => {
        if (window.confirm(`Вы уверены, что хотите удалить игру "${puzzleName}"?`)) {
            try {
                // TODO: Реализовать deletePuzzleFromSupabase в puzzleService.js
                // await deletePuzzleFromSupabase(puzzleId);
                UIUtils.showSuccess(`Игра "${puzzleName}" удалена.`);
                // Обновляем список после удаления
                setPuzzles(currentPuzzles => currentPuzzles.filter(p => p.id !== puzzleId));
            } catch (err) {
                console.error("Error deleting puzzle:", err);
                UIUtils.showError(err.message || 'Не удалось удалить игру.');
            }
        }
    };

    const handleLoadPuzzle = (puzzleId) => {
        // Переходим на /gamegenerator с query-параметром ID пазла
        navigate(`/gamegenerator?load_puzzle_id=${puzzleId}`);
    };

    if (isLoading) {
        return <p>Загрузка ваших сохраненных игр...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Ошибка: {error}</p>;
    }

    if (puzzles.length === 0) {
        return <p>У вас пока нет сохраненных игр.</p>;
    }

    return (
        <div className="my-puzzles-container">
            <h2>Мои сохраненные игры</h2>
            <ul>
                {puzzles.map(puzzle => (
                    <li key={puzzle.id}>
                        <strong>{puzzle.name}</strong> ({puzzle.game_type})
                        - Создана: {new Date(puzzle.created_at).toLocaleDateString()}
                        <button onClick={() => handleLoadPuzzle(puzzle.id)}>Загрузить</button>
                        {/* <button onClick={() => handleDeletePuzzle(puzzle.id, puzzle.name)}>Удалить</button> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyPuzzlesList;