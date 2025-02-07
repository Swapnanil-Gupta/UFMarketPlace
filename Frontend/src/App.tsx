import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './Authentication';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />
      </Routes>
    </Router>
  );
}

export default App;