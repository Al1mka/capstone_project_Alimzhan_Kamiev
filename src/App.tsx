import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Portfolio from './pages/Portfolio';
import CoinDetails from './pages/CoinDetails';
import AddCoin from './pages/AddCoin';
import Dashboard from './pages/Dashboard';
import Coins from './pages/Coins';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/add-coin" element={<AddCoin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
