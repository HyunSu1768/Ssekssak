import React, { useState, useEffect, useCallback } from 'react';
import './SeparationGame.css';

interface TrashItem {
  id: number;
  emoji: string;
  category: string;
  name: string;
  tip: string;
}

interface GameState {
  score: number;
  timeLeft: number;
  currentTrash: TrashItem | null;
  gameStatus: 'waiting' | 'playing' | 'ended';
  highScore: number;
  showTip: boolean;
  tipMessage: string;
  trashQueue: TrashItem[];
  currentIndex: number;
}

const trashItems: TrashItem[] = [
  { id: 1, emoji: '🥤', category: 'plastic', name: '음료수 컵', tip: '플라스틱 컵은 깨끗이 씻어서 플라스틱 통에!' },
  { id: 2, emoji: '🍌', category: 'food', name: '바나나', tip: '과일과 채소는 음식물 쓰레기로!' },
  { id: 3, emoji: '📦', category: 'paper', name: '종이박스', tip: '종이 박스는 종이 쓰레기로!' },
  { id: 4, emoji: '🍺', category: 'general', name: '맥주병', tip: '유리병은 일반 쓰레기로 분리!' },
  { id: 5, emoji: '🧴', category: 'plastic', name: '플라스틱 병', tip: '플라스틱 병은 라벨을 제거하고 플라스틱 통에!' },
  { id: 6, emoji: '🍎', category: 'food', name: '사과', tip: '과일류는 음식물 쓰레기로!' },
  { id: 7, emoji: '📄', category: 'paper', name: '종이', tip: '깨끗한 종이는 종이 쓰레기통에!' },
  { id: 8, emoji: '🥫', category: 'general', name: '캔', tip: '깡통은 일반 쓰레기로!' },
  { id: 9, emoji: '🍕', category: 'food', name: '피자', tip: '음식물은 음식물 쓰레기통에!' },
  { id: 10, emoji: '🛍️', category: 'plastic', name: '비닐봉지', tip: '비닐봉지는 플라스틱 쓰레기로!' },
  { id: 11, emoji: '📰', category: 'paper', name: '신문', tip: '신문은 종이 쓰레기통에!' },
  { id: 12, emoji: '🥕', category: 'food', name: '당근', tip: '채소류는 음식물 쓰레기로!' },
  { id: 13, emoji: '🥛', category: 'plastic', name: '우유팩', tip: '우유팩은 씻어서 플라스틱 통에!' },
  { id: 14, emoji: '🍒', category: 'food', name: '체리', tip: '과일류는 음식물 쓰레기로!' },
  { id: 15, emoji: '📋', category: 'paper', name: '클립보드', tip: '종이 제품은 종이 쓰레기통에!' },
];

const SeparationGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 30,
    currentTrash: null,
    gameStatus: 'waiting',
    highScore: parseInt(localStorage.getItem('highScore') || '0'),
    showTip: false,
    tipMessage: '',
    trashQueue: [],
    currentIndex: 0,
  });

  const categories = [
    { id: 'paper', name: '종이', emoji: '📦', color: '#4CAF50' },
    { id: 'food', name: '음식물', emoji: '🍌', color: '#FF9800' },
    { id: 'plastic', name: '플라스틱', emoji: '🧴', color: '#2196F3' },
    { id: 'general', name: '일반 쓰레기', emoji: '🗑️', color: '#757575' },
  ];

  const shuffleArray = (array: TrashItem[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const shuffledTrash = shuffleArray(trashItems);
    setGameState({
      score: 0,
      timeLeft: 30,
      currentTrash: shuffledTrash[0],
      gameStatus: 'playing',
      highScore: gameState.highScore,
      showTip: false,
      tipMessage: '',
      trashQueue: shuffledTrash,
      currentIndex: 0,
    });
  };

  const nextTrash = useCallback(() => {
    setGameState(prev => {
      if (prev.currentIndex < prev.trashQueue.length - 1) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          currentTrash: prev.trashQueue[prev.currentIndex + 1],
          showTip: false,
        };
      } else {
        // 게임 종료
        return {
          ...prev,
          gameStatus: 'ended',
          currentTrash: null,
          showTip: false,
        };
      }
    });
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    if (gameState.gameStatus !== 'playing' || !gameState.currentTrash) return;

    const isCorrect = gameState.currentTrash.category === categoryId;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score - 1;

    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: newScore,
        showTip: false,
      }));
      setTimeout(nextTrash, 300);
    } else {
      setGameState(prev => ({
        ...prev,
        score: newScore,
        showTip: true,
        tipMessage: prev.currentTrash?.tip || '',
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showTip: false }));
        setTimeout(nextTrash, 300);
      }, 2000);
    }
  };

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.gameStatus === 'playing' && gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, gameStatus: 'ended' }));
    }
  }, [gameState.timeLeft, gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'ended') {
      if (gameState.score > gameState.highScore) {
        const newHighScore = gameState.score;
        localStorage.setItem('highScore', newHighScore.toString());
        setGameState(prev => ({ ...prev, highScore: newHighScore }));
      }
    }
  }, [gameState.gameStatus, gameState.score, gameState.highScore]);

  return (
    <div className="separation-game">
      <div className="game-header">
        <h1 className="game-title">🎮 슥삭! 분리수거</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">점수</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">시간</span>
            <span className="stat-value">{gameState.timeLeft}초</span>
          </div>
          <div className="stat">
            <span className="stat-label">최고 점수</span>
            <span className="stat-value">{gameState.highScore}</span>
          </div>
        </div>
      </div>

      <div className="game-content">
        {gameState.gameStatus === 'waiting' && (
          <div className="game-start">
            <div className="start-content">
              <h2>🎯 게임 방법</h2>
              <p>제한 시간 안에 쓰레기를 올바른 통에 넣어주세요!</p>
              <ul className="game-rules">
                <li>⏱️ 시간: 30초</li>
                <li>✅ 맞으면 +1점</li>
                <li>❌ 틀리면 -1점</li>
                <li>🏆 최고 점수를 갱신해보세요!</li>
              </ul>
              <button className="start-button" onClick={startGame}>
                게임 시작!
              </button>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'playing' && gameState.currentTrash && (
          <div className="game-play">
            <div className="trash-display">
              <div className="trash-item">
                <span className="trash-emoji">{gameState.currentTrash.emoji}</span>
                <span className="trash-name">{gameState.currentTrash.name}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((gameState.currentIndex + 1) / gameState.trashQueue.length) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {gameState.currentIndex + 1} / {gameState.trashQueue.length}
              </span>
            </div>

            {gameState.showTip && (
              <div className="tip-display">
                <div className="tip-content">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">{gameState.tipMessage}</span>
                </div>
              </div>
            )}

            <div className="categories">
              {categories.map(category => (
                <button
                  key={category.id}
                  className="category-button"
                  style={{ backgroundColor: category.color }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="category-emoji">{category.emoji}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState.gameStatus === 'ended' && (
          <div className="game-end">
            <div className="end-content">
              <h2>🎉 게임 종료!</h2>
              <div className="final-score">
                <span className="score-label">최종 점수</span>
                <span className="score-value">{gameState.score}</span>
              </div>
              {gameState.score === gameState.highScore && gameState.score > 0 && (
                <div className="new-record">
                  🏆 새로운 최고 점수!
                </div>
              )}
              <div className="end-stats">
                <p>정답률: {Math.round((Math.max(0, gameState.score) / gameState.trashQueue.length) * 100)}%</p>
                <p>환경을 위한 작은 실천, 함께 해요! 🌱</p>
              </div>
              <button className="restart-button" onClick={startGame}>
                다시 도전하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeparationGame; 