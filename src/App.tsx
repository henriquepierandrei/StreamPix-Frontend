import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentQrCode from './pages/PaymentQrCode'
import StreamPixDonation from './pages/StreamPixDonation'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StreamPixDonation />} />
        <Route path="/streampix/donation/:transactionId" element={<PaymentQrCode />} />
      </Routes>
    </Router>
  );
}

export default App
