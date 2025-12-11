import { useEffect, useState } from 'react';
import '../css/saved-puzzles.css';
import { useNavigate } from 'react-router-dom'; 
import { 
    getUserPuzzlesFromSupabase, 
    updatePuzzleTags,
    deletePuzzleFromSupabase
} from '../services/puzzleService';
import { UIUtils } from '../js/UIUtils';
import Preloader from '../assets/svg/Preloader';

const gameType = {
    'crossword': 'Кроссворд',
    'wordsoup': 'Филворд'
};

const SavedPuzzles = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userTags, setTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [editingPuzzleIndex, setEditingPuzzleIndex] = useState(null);
    const [newTag, setNewTag] = useState('');
    const [puzzlesData, setPuzzlesData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPuzzles = async () => {
            try {
                setIsLoading(true);
                const userPuzzles = await getUserPuzzlesFromSupabase();
                // Нормализуем данные - гарантируем, что tags всегда массив
                const normalizedPuzzles = userPuzzles.map(puzzle => ({
                    ...puzzle,
                    tags: puzzle.tags || [] // Если tags null/undefined, используем пустой массив
                }));
                
                setPuzzlesData(normalizedPuzzles);
                getUniqueTags(normalizedPuzzles);
            } catch (err) {
                setIsLoading(false);
                console.error("Error fetching user puzzles:", err);
                UIUtils.showError(err.message || 'Не удалось загрузить список ваших игр.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPuzzles();
    }, []);

    const handleLoadPuzzle = (puzzleId) => {
        navigate(`/gamegenerator?load_puzzle_id=${puzzleId}`);
    };
    
    const getUniqueTags = (data) => {
        const allTags = data.flatMap(puzzle => puzzle.tags || []);
        const uniqueTags = [...new Set(allTags)].sort();
        setTags(uniqueTags);
    };

    const filteredTags = userTags.sort().filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPuzzles = selectedTags.length > 0
        ? puzzlesData.filter(puzzle => 
            selectedTags.every(selectedTag => 
                puzzle.tags.includes(selectedTag)
            )
          )
        : puzzlesData;

    const toggleTagSelection = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const removeTag = async (puzzleIndex, tagIndex) => {
        try {
            const puzzle = puzzlesData[puzzleIndex];
            const updatedTags = [...puzzle.tags];
            updatedTags.splice(tagIndex, 1);
            
            // Локальное обновление
            const updatedPuzzles = [...puzzlesData];
            updatedPuzzles[puzzleIndex].tags = updatedTags;
            setPuzzlesData(updatedPuzzles);
            getUniqueTags(updatedPuzzles);
            
            // Обновление в Supabase
            await updatePuzzleTags(puzzle.id, updatedTags);
            
        } catch (error) {
            console.error('Error removing tag:', error);
            UIUtils.showError('Не удалось удалить тег');
        }
    };

    const startAddingTag = (puzzleIndex) => {
        setEditingPuzzleIndex(puzzleIndex);
        setNewTag('');
    };

    const saveNewTag = async (puzzleIndex) => {
        const tag = newTag.trim();
        
        if (!tag || tag.length < 3 || tag.length > 15) {
            UIUtils.showError('Тег должен содержать от 3 до 15 символов');
            return;
        }
        
        if (puzzlesData[puzzleIndex].tags.includes(tag)) {
            UIUtils.showError('Этот тег уже добавлен');
            return;
        }
        
        try {
            const puzzle = puzzlesData[puzzleIndex];
            const updatedTags = [...puzzle.tags, newTag.trim()];
            
            // Локальное обновление
            const updatedPuzzles = [...puzzlesData];
            updatedPuzzles[puzzleIndex].tags = updatedTags;
            setPuzzlesData(updatedPuzzles);
            getUniqueTags(updatedPuzzles);

            // Сброс состояния
            setEditingPuzzleIndex(null);
            setNewTag('');

            // Обновление в Supabase
            await updatePuzzleTags(puzzle.id, updatedTags);
        } catch (error) {
            console.error('Error adding tag:', error);
            UIUtils.showError('Не удалось добавить тег');
        }
    };

    const handleKeyDown = (e, puzzleIndex) => {
        if (e.key === 'Enter') {
            saveNewTag(puzzleIndex);
        }
    };

    const deletePuzzle = async (puzzleId, e) => {
        e.stopPropagation();
        try {
            if (window.confirm('Вы уверены, что хотите удалить эту головоломку?')) {
                await deletePuzzleFromSupabase(puzzleId);

                setPuzzlesData(prev => prev.filter(puzzle => puzzle.id !== puzzleId));
                getUniqueTags(puzzlesData.filter(puzzle => puzzle.id !== puzzleId));
            }
        } catch (error) {
            console.error('Error deleting puzzle:', error);
            UIUtils.showError('Не удалось удалить головоломку');
        }
    };

    return (
        <section className='about-account-info user-saved-games-and-tags'>
            <div className='profile-title'>
                <h1>Сохраненные головоломки</h1>
                <div className='horizontal-line'></div>
            </div>
            <div className='saved-games-and-tags'>
                <section className='user-saved-games'>
                    {isLoading 
                    ? 
                        <Preloader/>
                    : 
                    <ul className='saved-games-list'>
                        {filteredPuzzles.map((puzzle, puzzleIndex) => (
                            <li key={puzzleIndex} className='saved-games-item'>
                                <span 
                                    className="puzzle-delete-button"
                                    onClick={(e) => deletePuzzle(puzzle.id, e)}
                                    title="Удалить головоломку"
                                >
                                    ×
                                </span>
                                <div className='saved-game-info' onClick={() => handleLoadPuzzle(puzzle.id)}>
                                    <div>
                                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 2a1 1 0 00-1 1v3a1 1 0 002 0 2 2 0 012-2h2v10.999A1 1 0 017 16h-.001A1 1 0 007 18h6a1 1 0 100-2 1 1 0 01-1-1V4h2a2 2 0 012 2 1 1 0 102 0V3a1 1 0 00-1-1H3z" fill="#5C5F62"/>
                                        </svg>
                                        <p>{puzzle.name}</p>
                                    </div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <g>
                                                <path fill='#ED7E98' class="st0" d="M432.531,229.906c-9.906,0-19.125,2.594-27.313,6.375v-51.656c0-42.938-34.922-77.875-77.859-77.875h-51.641
                                                    c3.781-8.156,6.375-17.375,6.375-27.281C282.094,35.656,246.438,0,202.625,0c-43.828,0-79.484,35.656-79.484,79.469
                                                    c0,9.906,2.594,19.125,6.359,27.281H77.875C34.938,106.75,0,141.688,0,184.625l0.047,23.828H0l0.078,33.781
                                                    c0,23.031,8.578,36.828,12.641,42.063c12.219,15.797,27.094,18.172,34.891,18.172c11.953,0,23.141-4.953,33.203-14.703l0.906-0.422
                                                    l1.516-2.141c1.391-1.359,6.328-5.484,14.016-5.5c16.344,0,29.656,13.297,29.656,29.672c0,16.344-13.313,29.656-29.672,29.656
                                                    c-7.672,0-12.609-4.125-14-5.5l-1.516-2.141l-0.906-0.422c-10.063-9.75-21.25-14.703-33.203-14.703
                                                    c-7.797,0.016-22.672,2.375-34.891,18.172c-4.063,5.25-12.641,19.031-12.641,42.063L0,410.281h0.047L0,434.063
                                                    C0,477.063,34.938,512,77.875,512h54.563v-0.063l3.047-0.016c23.016,0,36.828-8.563,42.063-12.641
                                                    c15.797-12.219,18.172-27.094,18.172-34.891c0-11.953-4.953-23.141-14.688-33.203l-0.438-0.906l-2.125-1.516
                                                    c-1.375-1.391-5.516-6.328-5.516-14.016c0-16.344,13.313-29.656,29.672-29.656c16.344,0,29.656,13.313,29.656,29.656
                                                    c0,7.688-4.141,12.625-5.5,14.016l-2.125,1.516l-0.438,0.906c-9.75,10.063-14.703,21.25-14.703,33.203
                                                    c0,7.797,2.359,22.672,18.172,34.891c5.25,4.078,19.031,12.641,42.063,12.641l17,0.047V512h40.609
                                                    c42.938,0,77.859-34.938,77.859-77.875v-51.641c8.188,3.766,17.406,6.375,27.313,6.375c43.813,0,79.469-35.656,79.469-79.484
                                                    C512,265.563,476.344,229.906,432.531,229.906z M432.531,356.375c-19.031,0-37.469-22.063-37.469-22.063
                                                    c-3.344-3.203-6.391-4.813-9.25-4.813c-2.844,0-5.469,1.609-7.938,4.813c0,0-5.125,5.891-5.125,19.313v80.5
                                                    c0,25.063-20.313,45.391-45.391,45.391h-23.813l-33.797-0.078c-15.438,0-22.188-5.875-22.188-5.875
                                                    c-3.703-2.859-5.563-5.875-5.563-9.172c0-3.266,1.859-6.797,5.563-10.594c0,0,17.219-13.891,17.219-39.047
                                                    c0-34.313-27.844-62.156-62.156-62.156c-34.344,0-62.156,27.844-62.156,62.156c0,25.156,17.219,39.047,17.219,39.047
                                                    c3.688,3.797,5.531,7.328,5.531,10.594c0,3.297-1.844,6.313-5.531,9.172c0,0-6.766,5.875-22.203,5.875l-33.797,0.078H77.875
                                                    c-25.063,0-45.375-20.328-45.375-45.391l0.094-48.203h-0.047l0.016-9.422c0-15.422,5.875-22.203,5.875-22.203
                                                    c2.859-3.703,5.875-5.531,9.156-5.531s6.813,1.828,10.609,5.531c0,0,13.891,17.234,39.047,17.234
                                                    c34.313-0.016,62.156-27.844,62.156-62.156c-0.016-34.344-27.844-62.156-62.156-62.156c-25.156,0-39.047,17.219-39.047,17.219
                                                    c-3.797,3.688-7.328,5.531-10.609,5.531s-6.297-1.828-9.156-5.531c0,0-5.875-6.781-5.875-22.203v-1.156h0.031L32.5,184.625
                                                    c0-25.063,20.313-45.375,45.375-45.375h80.5c13.422,0,19.313-5.125,19.313-5.125c6.422-4.938,6.422-10.531,0-17.188
                                                    c0,0-22.063-18.438-22.063-37.469c0-25.953,21.047-46.984,47-46.984c25.938,0,46.984,21.031,46.984,46.984
                                                    c0,19.031-22.047,37.469-22.047,37.469c-6.438,6.656-6.438,12.25,0,17.188c0,0,5.875,5.125,19.281,5.125h80.516
                                                    c25.078,0,45.391,20.313,45.391,45.375v80.516c0,13.422,5.125,19.297,5.125,19.297c2.469,3.219,5.094,4.813,7.938,4.813
                                                    c2.859,0,5.906-1.594,9.25-4.813c0,0,18.438-22.047,37.469-22.047c25.938,0,46.969,21.047,46.969,46.984
                                                    C479.5,335.344,458.469,356.375,432.531,356.375z"/>
                                            </g>
                                        </svg>
                                        <p>{gameType[puzzle.game_type]}</p>
                                    </div>
                                    <div>
                                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <rect fill="none" height="7" stroke="#ED7E98" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="7" x="14.5" y="2.5"/>
                                                <rect fill="none" height="7" stroke="#ED7E98" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="7" x="14.5" y="14.5"/>
                                                <rect fill="none" height="7" stroke="#ED7E98" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="7" x="2.5" y="2.5"/>
                                                <rect fill="none" height="7" stroke="#ED7E98" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="7" x="2.5" y="14.5"/>
                                            </g>
                                        </svg>
                                        <p>{puzzle.game_data.words.length} слов</p>
                                    </div>
                                </div>
                                <div className='horizontal-line'></div>
                                <ul className='saved-games-tags'>
                                    {puzzle.tags.map((tag, tagIndex) => (
                                        <li key={tagIndex} className='games-tag-item'>
                                            &#9733; {tag}
                                            <span 
                                                className="tag-remove" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeTag(puzzleIndex, tagIndex);
                                                }}
                                            >
                                                ×
                                            </span>
                                        </li>
                                    ))}
                                    {editingPuzzleIndex === puzzleIndex ? (
                                        <li className="tag-input-container">
                                            &#9733;
                                            <input
                                                minLength={3}
                                                maxLength={15}
                                                type="text"
                                                className="new-tag-input"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, puzzleIndex)}
                                                autoFocus
                                            />
                                            <button 
                                                className="tag-save-button"
                                                onClick={() => saveNewTag(puzzleIndex)}
                                            >
                                                ✓
                                            </button>
                                        </li>
                                    ) : (
                                        puzzle.tags.length < 3 &&
                                        <li className='add-new-tag-button' onClick={() => startAddingTag(puzzleIndex)}>
                                            +
                                        </li>
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>}
                </section>
                <section className='user-tags'>
                    <div className='user-tags-content'>
                        <h2>
                            Поиск по тегам 
                        </h2>
                        <input 
                            type='text'
                            minLength={2}
                            maxLength={10}
                            className='search-tags-input'
                            placeholder='Введите тег...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ul className='user-tags-list'>
                            {filteredTags.length > 0 
                            ?   filteredTags.map((tag, index) => (
                                    <li 
                                        key={index} 
                                        className={`user-tags-item ${
                                            selectedTags.includes(tag) ? 'selected' : ''
                                        }`}
                                        onClick={() => toggleTagSelection(tag)}
                                    >
                                        &#9733; {tag}
                                    </li>
                                ))
                            :   <li className='user-tags-item'>
                                    Тегов не найдено...
                                </li>}
                        </ul>
                    </div>
                </section>
            </div>
        </section>
    );
}

export default SavedPuzzles;