import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode'
import StreamPixDonation from './pages/StreamPixDonation'
import StreamerQrPage from './pages/StreamerQrPage';
import NotFoundPage from './pages/Notfound/NotFoundPage';
import DonationsPage from './pages/dashboard/DonationsPage';
import GoalComponent from './components/goal/GoalComponent';
import StreamerSettings from './pages/dashboard/StreamerSettings';
import QrCodeSettings from './pages/dashboard/QrCodeSettings';
import MessagesPage from './pages/dashboard/MessagesPage';
import DashboardLogin from './pages/dashboard/DashboardLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:streamerName" element={<StreamPixDonation />} />
        <Route path="/donation/:transactionId" element={<PaymentQrCode />} />
        <Route path="/streamer/qrcode/:streamerName" element={<StreamerQrPage />} />
        <Route path="/streamer/dashboard/login" element={<DashboardLogin />} />

        <Route path="/streamer/dashboard/messages" element={<MessagesPage />} />
        <Route
          path="/streamer/dashboard/goals"
          element={<GoalComponent apiKeyTwo={localStorage.getItem("streamer_api_key") || ""} />}
        />
        <Route path="/streamer/dashboard/donations" element={<DonationsPage />} />
        <Route path="/streamer/dashboard/profile" element={<StreamerSettings />} />
        <Route path="/streamer/dashboard/qrcode/settings" element={<QrCodeSettings />} />
        <Route path="/streamer/dashboard/messages" element={<MessagesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App
