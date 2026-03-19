import React from 'react';
import Header from './components/layout/Header';
import WeekTabs from '@components/course/WeekTabs';
import CourseWorkspace from '@components/course/CourseWorkspace';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main className="app-root">
        <WeekTabs />
        <CourseWorkspace />
      </main>
    </>
  );
};

export default App;

