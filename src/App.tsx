import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode'
import StreamPixDonation from './pages/StreamPixDonation'
import StreamerDashboard from './pages/StreamerDashboard';
import StreamerQrPage from './pages/StreamerQrPage';
import NotFoundPage from './pages/Notfound/NotFoundPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/streamer/:streamerName" element={<StreamPixDonation />} />
        <Route path="/donation/:transactionId" element={<PaymentQrCode />} />
        <Route path="/streamer/dashboard" element={<StreamerDashboard />} />
        <Route path="/streamer/qrcode/:streamerName" element={<StreamerQrPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App
