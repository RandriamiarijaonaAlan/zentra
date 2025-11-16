import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import QcmAttempt from './pages/QcmAttempt';
import Success from './pages/Success';
import Home from './pages/Home';
import PublicationListUser from './pages/PublicationListUser';
import ApplicationFormUser from './pages/ApplicationFormUser';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import QcmList from './pages/QcmList';
import QcmDetails from './pages/QcmDetails';
import QcmForm from './pages/QcmForm';
import InterviewList from './pages/InterviewList';
import InterviewDetails from './pages/InterviewDetails';
import InterviewForm from './pages/InterviewForm';
import ApplicationList from './pages/ApplicationList';
import ApplicationDetails from './pages/ApplicationDetails';
import ApplicationForm from './pages/ApplicationForm';
import { StaffingNeedApp } from './hr/StaffingNeedApp';
import PublicationsPage from './pages/PublicationsPage';
import PublicationForm from './pages/PublicationForm';
import AttendancePage from './pages/AttendancePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes utilisateurs */}
        <Route path="/" element={<Home />} />
        <Route path="/publications" element={<PublicationListUser />} />
        <Route path="/apply/:publicationId" element={<ApplicationFormUser />} />
        <Route path="/application-success" element={<Success />} />

        {/* Routes candidats */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/qcm-attempt" element={<QcmAttempt />} />
        <Route path="/success" element={<Success />} />

        {/* Redirections conviviales vers les routes admin existantes */}
        <Route path="/publications" element={<Navigate to="/admin/publications" replace />} />
        <Route path="/publications/new" element={<Navigate to="/admin/publications/new" replace />} />

        {/* Routes admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="qcms" element={<QcmList />} />
          <Route path="qcms/:id" element={<QcmDetails />} />
          <Route path="qcms/:id/edit" element={<QcmForm />} />

          {/* Publications */}
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="publications/new" element={<PublicationForm />} />

          {/* Applications (Candidatures) */}
          <Route path="applications" element={<ApplicationList />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
          <Route path="applications/:id/edit" element={<ApplicationForm />} />

          {/* Interviews */}
          <Route path="interviews" element={<InterviewList />} />
          <Route path="interviews/:id" element={<InterviewDetails />} />
          <Route path="interviews/:id/edit" element={<InterviewForm />} />

          {/* Besoins */}
          <Route path="besoins" element={<StaffingNeedApp />} />
          {/* Présences */}
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
