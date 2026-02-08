/**
 * App: Router and routes.
 * URL-based context (driven by Wimaan main platform redirects):
 * - /jd/:jdId              → Case 2: JD only
 * - /jd/:jdId/:categorySlug → Case 3: JD + category+module
 * - /:categorySlug         → Case 1: Category + module only
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import InterviewFlow from './components/InterviewFlow';
import PageNotFound from './components/PageNotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/call-center" replace />} />
      <Route path="/jd/:jdId/:categorySlug" element={<InterviewFlow />} />
      <Route path="/jd/:jdId" element={<InterviewFlow />} />
      <Route path="/:categorySlug" element={<InterviewFlow />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
