import React, { useEffect } from 'react';
import Header from '@components/layout/Header';
import Week from '@components/week/Week';
import Course from '@components/course/Course';
import GlobalLoader from '@components/common/GlobalLoader';
import { fetchCourseTree } from '@api/courseApi';
import { useCourseStore } from '@store/courseStore';
import { usePersistMetaStore } from '@store/persistMetaStore';
import { useApiUiStore } from '@store/apiUiStore';

const App: React.FC = () => {
  const hydrate = useCourseStore((s) => s.hydrate);
  const syncBaselineFromStore = usePersistMetaStore((s) => s.syncBaselineFromStore);
  const beginRequest = useApiUiStore((s) => s.beginRequest);
  const endRequest = useApiUiStore((s) => s.endRequest);
  const setInitialCourseFetchDone = useApiUiStore((s) => s.setInitialCourseFetchDone);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      beginRequest();
      try {
        const data = await fetchCourseTree();
        if (!cancelled) {
          hydrate(data);
          syncBaselineFromStore();
          setInitialCourseFetchDone(true);
        }
      } finally {
        endRequest();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate, syncBaselineFromStore, beginRequest, endRequest, setInitialCourseFetchDone]);

  return (
    <>
      <GlobalLoader />
      <Header />
      <main className="app-root">
        <Week />
        <Course />
      </main>
    </>
  );
};

export default App;

