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
import { LeaveTypeList } from './pages/LeaveTypeList';
import { LeaveTypeForm } from './pages/LeaveTypeForm';
import { LeaveRequestList } from './pages/LeaveRequestList';
import LeaveRequestForm from './pages/LeaveRequestForm';
import LeaveCalendar from './pages/LeaveCalendar';
import LeaveDashboard from './pages/LeaveDashboard';
import LeaveApproval from './pages/LeaveApproval';
import LeaveNotifications from './pages/LeaveNotifications';

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

          {/* Leave Management */}
          <Route path="leaves/dashboard" element={<LeaveDashboard />} />
          <Route path="leaves/types" element={<LeaveTypeList />} />
          <Route path="leaves/types/new" element={<LeaveTypeForm />} />
          <Route path="leaves/types/:id/edit" element={<LeaveTypeForm />} />
          <Route path="leaves/requests" element={<LeaveRequestList showEmployeeColumn={true} />} />
          <Route path="leaves/requests/new" element={<LeaveRequestForm />} />
          <Route path="leaves/requests/:id" element={<LeaveRequestForm />} />
          <Route path="leaves/requests/:id/edit" element={<LeaveRequestForm />} />
          <Route path="leaves/requests/pending" element={<LeaveRequestList showEmployeeColumn={true} />} />
          <Route path="leaves/requests/:requestId/approve" element={<LeaveApproval />} />
          <Route path="leaves/calendar" element={<LeaveCalendar />} />
          <Route path="leaves/notifications" element={<LeaveNotifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
