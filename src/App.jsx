/**
 * App: Router and routes.
 * URL-based context (driven by Wimaan main platform redirects):
 * - /job_role/:jobId              → Case 2: JD only (jobId = companyname_jobrole)
 * - /job_role/:jobId/:categorySlug → Case 3: JD + category+module
 * - /:categorySlug                 → Case 1: Category + module only
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import InterviewFlow from './components/InterviewFlow';
import PageNotFound from './components/PageNotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/call-center" replace />} />
      <Route path="/job_role/:jobId/:categorySlug" element={<InterviewFlow />} />
      <Route path="/job_role/:jobId" element={<InterviewFlow />} />
      <Route path="/:categorySlug" element={<InterviewFlow />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
