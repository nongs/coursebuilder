import React from 'react';
import Header from './components/layout/Header';
import WeekTabs from '@components/course/WeekTabs';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main className="app-root">
        <WeekTabs />
        <h1>Coursebuilder</h1>
        <p>코스빌더 초기 세팅이 완료되었습니다.</p>
      </main>
    </>
  );
};

export default App;

