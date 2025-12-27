import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ARPage from './pages/ARPage';
import TestPage1 from './pages/TestPage1';
import TestPage2 from './pages/TestPage2';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ar" element={<ARPage />} />
          <Route path="/test1" element={<TestPage1 />} />
          <Route path="/test2" element={<TestPage2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

