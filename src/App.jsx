import React, { useState, useEffect } from 'react';
import './App.css';
import moviesData from './data/movies.json';
import toyStoryData from './data/toy-story.json';
import zootopiaData from './data/zootopia.json';

const App = () => {
  const [selectedMovieId, setSelectedMovieId] = useState('zootopia');
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [activeTab, setActiveTab] = useState('study');

  // Settings state
  const [fontSize, setFontSize] = useState(1.4);
  const [speechRate, setSpeechRate] = useState(0.95);

  // User's study records (finished sentences)
  const [finishedItems, setFinishedItems] = useState(() => {
    const saved = localStorage.getItem('finishedItems');
    return saved ? JSON.parse(saved) : {};
  });

  const movieContent = {
    'toy-story': toyStoryData,
    'zootopia': zootopiaData
  };

  const currentMovieData = movieContent[selectedMovieId];
  const currentLesson = currentMovieData.find(l => l.id === currentLessonId) || currentMovieData[0];

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('finishedItems', JSON.stringify(finishedItems));
  }, [finishedItems]);

  const toggleFinished = (lessonId, dialogueIdx) => {
    const key = `${selectedMovieId}-${lessonId}-${dialogueIdx}`;
    setFinishedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get cumulative vocabulary based on finished sentences
  const getVocabulary = () => {
    const words = [];
    const seenWords = new Set();

    Object.keys(finishedItems).forEach(key => {
      if (finishedItems[key]) {
        const [mId, lId, dIdx] = key.split('-');
        const movie = movieContent[mId];
        const lesson = movie?.find(l => l.id === parseInt(lId));
        const dialogue = lesson?.dialogues[parseInt(dIdx)];

        if (dialogue?.words) {
          dialogue.words.forEach(w => {
            const wordKey = `${w.word}-${w.mean}`;
            if (!seenWords.has(wordKey)) {
              words.push({ ...w, sentence: dialogue.english });
              seenWords.add(wordKey);
            }
          });
        }
      }
    });
    return words;
  };

  const playTTS = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const usVoices = voices.filter(v => v.lang.includes('en-US'));
    const preferredVoice =
      usVoices.find(v => v.name.includes('Natural')) ||
      usVoices.find(v => v.name.includes('Neural')) ||
      usVoices.find(v => v.name.includes('Google US English')) ||
      usVoices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const renderStudy = () => (
    <div className="content-area">
      <div className="lesson-selector">
        {currentMovieData.map((lesson) => (
          <div
            key={lesson.id}
            className={`lesson-chip ${currentLessonId === lesson.id ? 'active' : ''}`}
            onClick={() => { setCurrentLessonId(lesson.id); window.scrollTo(0, 0); }}
          >
            Day {lesson.id}
          </div>
        ))}
      </div>

      {currentLesson.dialogues.map((item, index) => {
        const isDone = finishedItems[`${selectedMovieId}-${currentLessonId}-${index}`];
        return (
          <div key={index} className={`dialogue-card ${isDone ? 'finished-card' : ''}`}>
            <span className="character-tag">{item.character}</span>
            <div className="english-text" style={{ fontSize: `${fontSize}rem` }}>{item.english}</div>
            <div className="korean-text" style={{ fontSize: `${fontSize * 0.8}rem` }}>{item.korean}</div>
            <div className="explanation-box">
              <span className="key-expression">💡 주요 표현</span>
              <p style={{ marginTop: '5px' }}>{item.explanation}</p>
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="action-btn" onClick={() => playTTS(item.english)}>
                🔊 원어민 속도
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: isDone ? 'var(--accent-color)' : 'var(--text-sub)', fontWeight: isDone ? 'bold' : 'normal', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!isDone}
                  onChange={() => toggleFinished(currentLessonId, index)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                {isDone ? '학습 완료' : '낭독 완료'}
              </label>
            </div>
          </div>
        );
      })}
      <div style={{ height: '120px' }}></div>
    </div>
  );

  const renderReview = () => {
    const vocab = getVocabulary();
    return (
      <div className="content-area">
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Noto Serif KR' }}>내 누적 단어장</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
          '낭독 완료'를 체크한 문장의 단어들이 자동으로 저장됩니다.
        </p>

        {vocab.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#ccc' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</p>
            <p>아직 저장된 단어가 없어요.<br />오늘의 공부에서 '낭독 완료'를 체크해 보세요!</p>
          </div>
        ) : (
          vocab.map((item, idx) => (
            <div key={idx} className="dialogue-card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--accent-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}>{item.word}</strong>
                <button className="action-btn" onClick={() => playTTS(item.word)} style={{ padding: '4px 12px' }}>🔊 듣기</button>
              </div>
              <div style={{ color: 'var(--accent-color)', margin: '0.5rem 0', fontWeight: 'bold' }}>{item.mean}</div>
              <div style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic', background: '#f9f9f9', padding: '8px', borderRadius: '8px' }}>
                "{item.sentence}"
              </div>
            </div>
          ))
        )}
        <div style={{ height: '120px' }}></div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="content-area">
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Noto Serif KR' }}>설정</h2>

      <div className="settings-item" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow)' }}>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📏</span> 글자 크기 조정
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.8rem' }}>작게</span>
          <input
            type="range" min="1" max="2.2" step="0.1"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            style={{ flexGrow: 1, accentColor: 'var(--accent-color)' }}
          />
          <span style={{ fontSize: '1.2rem' }}>크게</span>
        </div>
      </div>

      <div className="settings-item" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow)' }}>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> 말하기 속도
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.8rem' }}>천천히</span>
          <input
            type="range" min="0.5" max="1.5" step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            style={{ flexGrow: 1, accentColor: 'var(--accent-color)' }}
          />
          <span style={{ fontSize: '1.2rem' }}>빠르게</span>
        </div>
      </div>

      <button
        onClick={() => {
          if (window.confirm('모든 학습 기록과 단어장을 초기화할까요?')) {
            setFinishedItems({});
            localStorage.removeItem('finishedItems');
            alert('초기화되었습니다.');
          }
        }}
        style={{ width: '100%', padding: '1rem', borderRadius: '15px', background: '#fff', color: '#ff7675', border: '1px solid #ff7675', fontWeight: 'bold', fontSize: '1rem' }}
      >
        학습 기록 초기화하기
      </button>

      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
        Antigravity English v1.1.0
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <style>{`
        .finished-card { border: 2px solid var(--accent-color) !important; background: #fffaf5 !important; }
        .settings-item input[type=range] { height: 8px; border-radius: 5px; background: #eee; outline: none; }
      `}</style>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 onClick={() => setActiveTab('study')} style={{ cursor: 'pointer' }}>Movie English</h1>
          <select
            value={selectedMovieId}
            onChange={(e) => { setSelectedMovieId(e.target.value); setCurrentLessonId(1); setActiveTab('study'); }}
            style={{
              border: 'none',
              background: 'var(--accent-color)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(212, 163, 115, 0.3)'
            }}
          >
            {moviesData.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div className="subtitle">
          {activeTab === 'study' ? '중년 여성을 위한 매일 10분 영어' : activeTab === 'review' ? '내 누적 단어장' : '학습 환경 설정'}
        </div>
      </header>

      {activeTab === 'study' && renderStudy()}
      {activeTab === 'review' && renderReview()}
      {activeTab === 'settings' && renderSettings()}

      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'study' ? 'active' : ''}`} onClick={() => setActiveTab('study')}>
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>오늘의 공부</span>
        </div>
        <div className={`nav-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span style={{ position: 'relative' }}>
            단어장
            {getVocabulary().length > 0 && <span style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'var(--accent-color)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6rem' }}>{getVocabulary().length}</span>}
          </span>
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span>설정</span>
        </div>
      </nav>
    </div>
  );
};

export default App;
