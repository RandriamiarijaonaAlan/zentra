import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import QcmAttempt from './pages/QcmAttempt';
import Success from './pages/Success';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import QcmList from './pages/QcmList';
import QcmDetails from './pages/QcmDetails';
import QcmForm from './pages/QcmForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes candidats */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/qcm-attempt" element={<QcmAttempt />} />
        <Route path="/success" element={<Success />} />

        {/* Routes admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="qcms" element={<QcmList />} />
          <Route path="qcms/:id" element={<QcmDetails />} />
          <Route path="qcms/:id/edit" element={<QcmForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
