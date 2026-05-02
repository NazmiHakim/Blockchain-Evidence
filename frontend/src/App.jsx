import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import Pages
import LandingPage from './pages/LandingPage';
import Lapor from './pages/Lapor';
import StatusLaporan from './pages/StatusLaporan';
import DashboardSatgas from './pages/DashboardSatgas';
import DetailLaporan from './pages/DetailLaporan';
import SuccessReport from './pages/SuccessReport';
import AccessDenied from './pages/AccessDenied';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Alur Pelapor */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/lapor" element={<Lapor />} />
          <Route path="/success" element={<SuccessReport />} />
          <Route path="/status" element={<StatusLaporan />} />
          
          {/* Alur Satgas */}
          <Route path="/satgas" element={<DashboardSatgas />} />
          <Route path="/satgas/detail/:id" element={<DetailLaporan />} />
          
          {/* Error Pages */}
          <Route path="/403" element={<AccessDenied />} />
          <Route path="*" element={<AccessDenied />} /> {/* Fallback 404 ke Access Denied */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;