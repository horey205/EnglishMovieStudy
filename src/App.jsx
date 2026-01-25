import React, { useState, useEffect } from 'react';
import './App.css';
import moviesData from './data/movies.json';
import toyStoryData from './data/toy-story.json';
import zootopiaData from './data/zootopia.json';

const App = () => {
  const [selectedMovieId, setSelectedMovieId] = useState('toy-story');
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [activeTab, setActiveTab] = useState('study');

  // Settings state
  const [fontSize, setFontSize] = useState(1.4);
  const [speechRate, setSpeechRate] = useState(0.95);

  // Vocabulary state
  const [vocabulary, setVocabulary] = useState([
    { word: 'Accomplished', mean: '완수한, 성취한', sentence: 'Mission accomplished.' },
    { word: 'Deputy', mean: '대리인, 부관', sentence: 'You are my favorite deputy.' }
  ]);

  const movieContent = {
    'toy-story': toyStoryData,
    'zootopia': zootopiaData
  };

  const currentMovieData = movieContent[selectedMovieId];
  const currentLesson = currentMovieData.find(l => l.id === currentLessonId) || currentMovieData[0];

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

      {currentLesson.dialogues.map((item, index) => (
        <div key={index} className="dialogue-card">
          <span className="character-tag">{item.character}</span>
          <div className="english-text" style={{ fontSize: `${fontSize}rem` }}>{item.english}</div>
          <div className="korean-text" style={{ fontSize: `${fontSize * 0.8}rem` }}>{item.korean}</div>
          <div className="explanation-box">
            <span className="key-expression">💡 주요 표현</span>
            <p style={{ marginTop: '5px' }}>{item.explanation}</p>
          </div>
          <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="action-btn" onClick={() => playTTS(item.english)}>
              🔊 생동감 있는 발음
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px' }} /> 낭독 완료
            </label>
          </div>
        </div>
      ))}
      <div style={{ height: '120px' }}></div>
    </div>
  );

  const renderReview = () => (
    <div className="content-area">
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Noto Serif KR' }}>내 단어장</h2>
      {vocabulary.map((item, idx) => (
        <div key={idx} className="dialogue-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}>{item.word}</strong>
            <button className="action-btn" onClick={() => playTTS(item.word)} style={{ padding: '4px 8px' }}>🔊</button>
          </div>
          <div style={{ color: 'var(--accent-color)', margin: '0.5rem 0' }}>{item.mean}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>"{item.sentence}"</div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-sub)' }}>
        학습 중 체크한 단어가 여기에 저장됩니다.
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="content-area">
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Noto Serif KR' }}>설정</h2>

      <div className="settings-item" style={{ marginBottom: '2rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>글자 크기 조정</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>작게</span>
          <input
            type="range" min="1" max="2" step="0.1"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            style={{ flexGrow: 1 }}
          />
          <span>크게</span>
        </div>
      </div>

      <div className="settings-item" style={{ marginBottom: '2rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>말하기 속도</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>느리게</span>
          <input
            type="range" min="0.5" max="1.5" step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            style={{ flexGrow: 1 }}
          />
          <span>빠르게</span>
        </div>
      </div>

      <div className="settings-item">
        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>학습 기록 초기화</p>
        <button
          onClick={() => alert('학습 데이터가 초기화되었습니다.')}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#ff7675', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          초기화하기
        </button>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
        Antigravity English v1.0.0
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Movie English</h1>
          <select
            value={selectedMovieId}
            onChange={(e) => { setSelectedMovieId(e.target.value); setCurrentLessonId(1); }}
            style={{
              border: 'none',
              background: 'var(--accent-color)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          >
            {moviesData.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div className="subtitle">
          {activeTab === 'study' ? '중년 여성을 위한 매일 10분 영어' : activeTab === 'review' ? '내 손안의 영단어' : '학습 환경 설정'}
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
          <span>단어장</span>
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
