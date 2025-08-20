import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode'
import StreamPixDonation from './pages/StreamPixDonation'
import StreamerDashboard from './pages/StreamerDashboard';
import DonationToast from './components/DonationToast';
import StreamerNotFound from './components/StreamerNotFound';
import StreamerQrPage from './components/StreamerQrPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/streamer/:streamerName" element={<StreamPixDonation />} />
        <Route path="/donation/:transactionId" element={<PaymentQrCode />} />
        <Route path="/streamer" element={<StreamerDashboard />} />
        <Route path="/streamer/qrcode/:streamerName" element={<StreamerQrPage />} />
        
        {/* Rota de teste para o DonationToast */}

        <Route path="/teste" element={<DonationToast
          name="Meno de Guarulhos"
          amount={0.05}
          message="TomaTomaToma aquele café! aquele caféaToma aquele café! aquele caféaToma aquele café! aquele caféaToma aquele café! aquele caféaToma aquele café! aquele caféaToma aquele café! aquele caféaToma aquele café! aquele caféa aquele café! aquele café!"
          playSoundUrl="/sounds/donate.mp3"
          onClose={() => console.log("toast fechado")}
        />} />

      </Routes>

    </Router>
  );
}

export default App
