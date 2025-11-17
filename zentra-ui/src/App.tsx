import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import HRDashboard from './hr/StaffingNeedApp';
import PublicationsPage from './pages/PublicationsPage';
import PublicationForm from './pages/PublicationForm';
import AttendancePage from './pages/AttendancePage';
import HRHome from './hr/pages/HRHome';
import EmployeesList from './hr/pages/EmployeesList';
import EmployeeCreate from './hr/pages/EmployeeCreate';
import EmployeeEdit from './hr/pages/EmployeeEdit';
import EmployeeProfile from './hr/pages/EmployeeProfile';
import EmployeeContracts from './hr/pages/EmployeeContracts';
import JobHistoryPage from './hr/pages/JobHistoryPage';
import DocumentsPage from './hr/pages/DocumentsPage';
import UploadDocumentPage from './hr/pages/UploadDocumentPage';
import StaffingNeedsList from './hr/pages/StaffingNeedsList';
import StaffingNeedCreate from './hr/pages/StaffingNeedCreate';
import PayrollPage from './hr/pages/PayrollPage';
import PayStubPage from './hr/pages/PayStubPage';
import BonusAdvancePage from './hr/pages/BonusAdvancePage';
import ContributionConfiguration from './pages/ContributionConfiguration';

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

          {/* Besoins: on affiche tableau de bord RH simple */}
          <Route path="besoins" element={<HRDashboard />} />

          {/* Présences */}
          <Route path="attendance" element={<AttendancePage />} />

          {/* RH */}
          <Route path="hr" element={<HRHome />} />
          <Route path="hr/employees" element={<EmployeesList />} />
          <Route path="hr/employees/new" element={<EmployeeCreate />} />
          <Route path="hr/employees/:id" element={<EmployeeProfile />} />
          <Route path="hr/employees/:id/edit" element={<EmployeeEdit />} />

          {/* Staffing Needs (Besoins en personnel) */}
          <Route path="hr/staffing-needs" element={<StaffingNeedsList />} />
          <Route path="hr/staffing-needs/new" element={<StaffingNeedCreate />} />

          {/* Autres pages HR */}
          <Route path="hr/contracts" element={<EmployeeContracts />} />
          <Route path="hr/job-history" element={<JobHistoryPage />} />
          <Route path="hr/documents" element={<DocumentsPage />} />
          <Route path="hr/upload-document" element={<UploadDocumentPage />} />

          {/* Gestion de Paie */}
          <Route path="hr/pay" element={<PayrollPage />} />
          <Route path="hr/pay/paystub" element={<PayStubPage />} />
          <Route path="hr/pay/bonus-advance" element={<BonusAdvancePage />} />
          <Route path="hr/contributions" element={<ContributionConfiguration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
