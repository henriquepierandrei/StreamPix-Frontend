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
import { GoalComponentToShow } from './components/goal/GoalComponentToShow'
import HomePage from './pages/home/HomePage';
import { MessageComponentToShow } from "./components/message/MessageComponentToShow";





function App() {
  return (
    <Router>
      <Routes>
        {/* ROTAS ESPECÍFICAS - DEVEM VIR PRIMEIRO */}
        
        {/* Página raiz */}
        <Route path="/" element={<HomePage />} />

        {/* Rotas de pagamento e transações */}
        <Route path="/donation/:transactionId" element={<PaymentQrCode />} />
        
        {/* Rotas do streamer - QR Code */}
        <Route path="/streamer/qrcode/:streamerName" element={<StreamerQrPage />} />
        
        {/* Rota de login do dashboard */}
        <Route path="/streamer/dashboard/login" element={<DashboardLogin />} />
        
        {/* Rota do componente de meta para exibição */}
        <Route path="/streamer/dashboard/goal/to-show/:streamerName" element={<GoalComponentToShow />} />
        
        {/* Rota do componente de mensagens para exibição */}
        <Route path="/streamer/dashboard/messages/to-show" element={<MessageComponentToShow />} />

        {/* ROTAS PRIVADAS DO DASHBOARD */}
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

        {/* ROTA GENÉRICA - DEVE VIR APÓS AS ESPECÍFICAS */}
        <Route path="/:streamerName" element={<StreamPixDonation />} />

        {/* ROTA 404 - SEMPRE POR ÚLTIMO */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;