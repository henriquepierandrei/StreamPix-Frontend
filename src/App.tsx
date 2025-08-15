import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode'
import StreamPixDonation from './pages/StreamPixDonation'
import StreamerDashboard from './pages/StreamerDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StreamPixDonation />} />
        <Route path="/streampix/donation/:transactionId" element={<PaymentQrCode />} />
        <Route path="/streampix/streamer" element={<StreamerDashboard />} />\

      </Routes>
    </Router>
  );
}

export default App
