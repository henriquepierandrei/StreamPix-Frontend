import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode';
import StreamPixDonation from './pages/StreamPixDonation';
import StreamerQrPage from './pages/StreamerQrPage';
import NotFoundPage from './pages/Notfound/NotFoundPage';
import DonationsPage from './pages/dashboard/DonationsPage';
import GoalComponent from './pages/dashboard/GoalComponent';
import StreamerSettings from './pages/dashboard/StreamerSettings';
import QrCodeSettings from './pages/dashboard/QrCodeSettings';
import MessagesPage from './pages/dashboard/MessagesPage';
import DashboardLogin from './pages/dashboard/DashboardLogin';
import PrivateRoute from './api/PrivateRoute';
import { GoalComponentToShow } from '././components/GoalComponentToShow'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/:streamerName" element={<StreamPixDonation />} />
        <Route path="/donation/:transactionId" element={<PaymentQrCode />} />
        <Route path="/streamer/qrcode/:streamerName" element={<StreamerQrPage />} />
        <Route path="/streamer/dashboard/login" element={<DashboardLogin />} />
        <Route path="/streamer/dashboard/goal/to-show/:streamerName" element={<GoalComponentToShow />} />
        {/* Rotas privadas */}
        <Route
          path="/streamer/dashboard/messages"
          element={
            <PrivateRoute>
              <MessagesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/streamer/dashboard/goals"
          element={
            <PrivateRoute>
              <GoalComponent />
            </PrivateRoute>
          }
        />
        <Route
          path="/streamer/dashboard/donations"
          element={
            <PrivateRoute>
              <DonationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/streamer/dashboard/profile"
          element={
            <PrivateRoute>
              <StreamerSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/streamer/dashboard/qrcode/settings"
          element={
            <PrivateRoute>
              <QrCodeSettings />
            </PrivateRoute>
          }
        />

        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
