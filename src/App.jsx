/**
 * App: Router and routes. Root redirects to /call-center.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import InterviewFlow from './components/InterviewFlow';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/call-center" replace />} />
      <Route path="/:categorySlug" element={<InterviewFlow />} />
    </Routes>
  );
}

export default App;
