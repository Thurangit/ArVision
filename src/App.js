import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Pages principales avec MindAR
import MainPage from './pages/MainPage';
import MindARImagePage from './pages/MindARImagePage';
import MindARFacePage from './pages/MindARFacePage';
// Pages secondaires (ancien système AR.js)
import HomePage from './pages/HomePage';
import ARPage from './pages/ARPage';
import TestPage1 from './pages/TestPage1';
import TestPage2 from './pages/TestPage2';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes principales - MindAR */}
          <Route path="/" element={<MainPage />} />
          <Route path="/mindar-image" element={<MindARImagePage />} />
          <Route path="/mindar-face" element={<MindARFacePage />} />
          
          {/* Routes secondaires - AR.js (ancien système) */}
          <Route path="/legacy/home" element={<HomePage />} />
          <Route path="/legacy/ar" element={<ARPage />} />
          <Route path="/legacy/test1" element={<TestPage1 />} />
          <Route path="/legacy/test2" element={<TestPage2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

