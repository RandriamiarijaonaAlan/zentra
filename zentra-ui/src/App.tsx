import EmployeeStatisticsDashboard from './hr/features/employee/pages/EmployeeStatisticsDashboard.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './hr/features/auth/pages/UserLogin.tsx';
import QcmAttempt from './hr/features/qcm/pages/QcmAttempt.tsx';
import Success from './hr/features/auth/pages/Success.tsx';
import Home from './hr/features/hr-home/pages/Home.tsx';
import PublicationListUser from './hr/features/publications/pages/PublicationListUser.tsx';
import ApplicationFormUser from './hr/features/applications/pages/ApplicationFormUser.tsx';
import AdminLayout from './hr/features/shared/components/AdminLayout.tsx';
import Dashboard from './hr/features/hr-home/pages/Dashboard.tsx';
import QcmList from './hr/features/qcm/pages/QcmList.tsx';
import QcmDetails from './hr/features/qcm/pages/QcmDetails.tsx';
import QcmForm from './hr/features/qcm/pages/QcmForm.tsx';
import InterviewList from './hr/features/interview/pages/InterviewList.tsx';
import InterviewDetails from './hr/features/interview/pages/InterviewDetails.tsx';
import InterviewForm from './hr/features/interview/pages/InterviewForm.tsx';
import ApplicationList from './hr/features/applications/pages/ApplicationList.tsx';
import ApplicationDetails from './hr/features/applications/pages/ApplicationDetails.tsx';
import ApplicationForm from './hr/features/applications/pages/ApplicationForm.tsx';
import HRDashboard from './hr/StaffingNeedApp';
import PublicationsPage from './hr/features/publications/pages/PublicationsPage.tsx';
import PublicationForm from './hr/features/publications/pages/PublicationForm.tsx';
import { LeaveTypeList } from './hr/features/leave/pages/LeaveTypeList.tsx';
import { LeaveTypeForm } from './hr/features/leave/pages/LeaveTypeForm.tsx';
import { LeaveRequestList } from './hr/features/leave/pages/LeaveRequestList.tsx';
import LeaveRequestForm from './hr/features/leave/pages/LeaveRequestForm.tsx';
import LeaveCalendar from './hr/features/leave/pages/LeaveCalendar.tsx';
import LeaveDashboard from './hr/features/leave/pages/LeaveDashboard.tsx';
import LeaveApproval from './hr/features/leave/pages/LeaveApproval.tsx';
import LeaveNotifications from './hr/features/leave/pages/LeaveNotifications.tsx';
import AttendancePage from './hr/features/attendance/pages/AttendancePage.tsx';
import HRHome from './hr/features/hr-home/pages/HRHome.tsx';
import EmployeesList from './hr/features/employee/pages/EmployeesList.tsx';
import EmployeeCreate from './hr/features/employee/pages/EmployeeCreate.tsx';
import EmployeeEdit from './hr/features/employee/pages/EmployeeEdit.tsx';
import EmployeeProfile from './hr/features/employee/pages/EmployeeProfile.tsx';
import EmployeeContracts from './hr/features/employee/pages/EmployeeContracts.tsx';
import JobHistoryPage from './hr/pages/JobHistoryPage';
import DocumentsPage from './hr/features/documents/pages/DocumentsPage.tsx';
import UploadDocumentPage from './hr/features/documents/pages/UploadDocumentPage.tsx';
import StaffingNeedsList from './hr/features/staffing/pages/StaffingNeedsList.tsx';
import StaffingNeedCreate from './hr/features/staffing/pages/StaffingNeedCreate.tsx';
import PayrollPage from './hr/features/payroll/pages/PayrollPage.tsx';
import PayStubPage from './hr/features/payroll/pages/PayStubPage.tsx';
import BonusAdvancePage from './hr/features/bonus/pages/BonusAdvancePage.tsx';
import ContributionConfiguration from './hr/pages/ContributionConfiguration.tsx';
import SkillList from './hr/features/skill/pages/SkillList.tsx';
import EmployeeSkillMatrix from './hr/features/skill/pages/EmployeeSkillMatrix.tsx';
import TrainingList from './hr/features/training/pages/TrainingList.tsx';
import TrainingSuggestions from './hr/features/training/pages/TrainingSuggestions.tsx';
import AssignEmployeeSkill from './hr/features/skill/pages/AssignEmployeeSkill.tsx';
import EmployeeSkills from './hr/features/skill/pages/EmployeeSkills.tsx';

// Add missing imports for CRUD pages
import SkillForm from './hr/features/skill/pages/SkillForm.tsx';
import SkillDetails from './hr/features/skill/pages/SkillDetails.tsx';
import TrainingDetails from './hr/features/training/pages/TrainingDetails.tsx';
import TrainingForm from './hr/features/training/pages/TrainingForm.tsx';
import StaffingNeedApp from "./hr/StaffingNeedApp";

// Employee Self-Service imports
import EmployeeDashboard from './hr/features/employee/pages/EmployeeDashboard.tsx';
import EmployeeLeaveRequests from './hr/features/employee/pages/EmployeeLeaveRequests.tsx';
import EmployeePayslips from './hr/features/employee/pages/EmployeePayslips.tsx';

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
                    <Route path="statistics" element={<EmployeeStatisticsDashboard />} />
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

                    {/* Training Management */}
                    <Route path="trainings" element={<TrainingList />} />
                    <Route path="trainings/new" element={<TrainingForm />} />
                    <Route path="trainings/:id" element={<TrainingDetails />} />
                    <Route path="trainings/:id/edit" element={<TrainingForm />} />
                    <Route path="trainings/suggestions" element={<TrainingSuggestions />} />
                    <Route path="leaves/requests/pending" element={<LeaveRequestList showEmployeeColumn={true} />} />
                    <Route path="leaves/requests/:requestId/approve" element={<LeaveApproval />} />
                    <Route path="leaves/calendar" element={<LeaveCalendar />} />
                    <Route path="leaves/notifications" element={<LeaveNotifications />} />

                    {/* Skill Management */}
                    <Route path="skills" element={<SkillList />} />
                    <Route path="skills/new" element={<SkillForm />} />
                    <Route path="skills/:id" element={<SkillDetails />} />
                    <Route path="skills/:id/edit" element={<SkillForm />} />
                    <Route path="skills/matrix" element={<EmployeeSkillMatrix />} />
                    <Route path="employee-skills/assign" element={<AssignEmployeeSkill />} />
                    <Route path="employee-skills" element={<EmployeeSkills />} />
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

                {/* Employee Self-Service Routes (Espace Employé) */}
                <Route path="/employee" element={<EmployeeDashboard />} />
                <Route path="/employee/:employeeId/leave-requests" element={<EmployeeLeaveRequests />} />
                <Route path="/employee/:employeeId/payslips" element={<EmployeePayslips />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;