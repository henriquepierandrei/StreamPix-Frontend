import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/client/PaymentQrCodePage.tsx';
import StreamPixDonation from './pages/client/StreamPixDonationPage.tsx';
import StreamerQrPage from './pages/client/StreamerQrPage.tsx';
import NotFoundPage from './pages/Notfound/NotFoundPage';
import DonationsPage from './pages/dashboard/DonationsDashboardPage.tsx';
import GoalComponent from './pages/dashboard/GoalDashboardPage.tsx';
import StreamerSettings from './pages/dashboard/StreamerSettingsDashboardPage.tsx';
import QrCodeSettings from './pages/dashboard/QrSettingsDashboardPage.tsx';
import MessagesPage from './pages/dashboard/MessagesDashboardPage.tsx';
import DashboardLogin from './pages/dashboard/auth/DashboardLogin';
import PrivateRoute from './routes/PrivateRoute.tsx';
import { GoalComponentToShow } from './components/goal/GoalComponentToShow'
import HomePage from './pages/home/HomePage';
import { MessageComponentToShow } from "./components/message/MessageComponentToShow";
import DashboardRegister from './pages/dashboard/auth/DashboardRegister';
import EmailVerification from './pages/dashboard/auth/DashboardVerifyEmail.tsx';
import AccountPage from './pages/dashboard/AccountDashboardPage.tsx';

import { AuthProvider } from './routes/AuthContext.tsx';
import { ThemeProvider } from './hooks/ThemeContextType.tsx';




function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ROTAS ESPECÍFICAS - DEVEM VIR PRIMEIRO */}

            {/* Página raiz */}
            <Route path="/" element={<HomePage />} />

            {/* Rotas de pagamento e transações */}
            <Route path="/donation/:transactionId" element={<PaymentQrCode />} />

            {/* Rotas do streamer - QR Code */}
            <Route path="/streamer/qrcode/:nickname" element={<StreamerQrPage />} />



            {/* Rota de login do dashboard */}
            <Route path="/streamer/dashboard/login" element={<DashboardLogin />} />

            {/* Rota de Registro do dashboard */}
            <Route path="/streamer/dashboard/register" element={<DashboardRegister />} />

            {/* Rota de Validação do código do dashboard */}
            <Route path="/email-auth/validate-email" element={<EmailVerification />} />

            {/* Rota do componente de meta para exibição */}
            <Route path="/streamer/dashboard/goal/to-show" element={<GoalComponentToShow />} />

            {/* Rota do componente de mensagens para exibição */}
            <Route path="/streamer/dashboard/messages/to-show/:id" element={<MessageComponentToShow />} />

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

            <Route
              path="/streamer/dashboard/account"
              element={
                <PrivateRoute>
                  <AccountPage />
                </PrivateRoute>
              }
            />

            {/* ROTA GENÉRICA - DEVE VIR APÓS AS ESPECÍFICAS */}
            <Route path="/:streamerName" element={<StreamPixDonation />} />

            {/* ROTA 404 - SEMPRE POR ÚLTIMO */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;