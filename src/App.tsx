import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { ReactNode } from "react";

import Login from "@/pages/Login/Login";
import MagicLink from "@/pages/Auth/MagicLink";
import Dashboard from "@/pages/Dashboard/DashboardLayout";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";

import Departments from "@/pages/Departments";
import DepartmentDetail from "@/pages/Departments/pages/detail";
import CreateDepartment from "@/pages/Departments/pages/create";
import UpdateDepartment from "@/pages/Departments/pages/update";

import Users from "@/pages/Users";
import CreateUser from "@/pages/Users/pages/create";
import UserDetail from "@/pages/Users/pages/detail";
import UpdateUser from "@/pages/Users/pages/update";

import Documents from "@/pages/Documents";
import CreateDocument from "@/pages/Documents/pages/Create";
import MigrationDocuments from "@/pages/Documents/pages/MigrationDocuments";
import DocumentDetail from "@/pages/Documents/pages/Detail";
import UpdateDocument from "@/pages/Documents/pages/Update";
import ReviseDocument from "@/pages/Documents/pages/Revise";
import UnifiedApprovals from "@/pages/Approvals"; // New unified approval page
import DocumentApprovalDetail from "@/pages/Approvals/DocumentApprovalDetail";
import PrintApprovalDetail from "@/pages/Approvals/PrintApprovalDetail";
import DeletionApprovalDetail from "@/pages/Approvals/DeletionApprovalDetail";
import RevisionApprovalDetail from "@/pages/Approvals/RevisionApprovalDetail";
import ReferenceApprovalDetail from "@/pages/Approvals/ReferenceApprovalDetail";
import MasterIndex from "@/pages/Shared/pages/MasterIndex";
import FormMasterIndex from "@/pages/Shared/pages/FormMasterIndex";
import ExternalMasterIndex from "@/pages/Shared/pages/ExternalMasterIndex";
import Shared from "@/pages/Shared";
import DocumentShared from "@/pages/Shared/pages/DocumentsShared";

import Roles from "@/pages/Roles";
import CreateRole from "@/pages/Roles/pages/create";
import RoleDetail from "@/pages/Roles/pages/detail";
import UpdateRole from "@/pages/Roles/pages/update";

import References from "@/pages/References";
import CreateReference from "@/pages/References/pages/Create";
import UpdateReference from "@/pages/References/pages/Update";
import ReferenceApproval from "@/pages/Documents/pages/ReferenceApproval";
import DocumentVerification from "@/pages/Verify";

import type { AuthUser } from "@/store/authUser/types";

import LoadingOverlay from "@/components/common/LoadingOverlay";

// Redux state type
interface RootState {
  authUser: {
    user: AuthUser | null;
    error: string | null;
  };
}

// Route wrappers
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.authUser.user);
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.authUser.user);
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

import ThemeHandler from "@/components/common/ThemeHandler";
import Obsolete from "./pages/Obsolete";
import ObsoleteDocumentDetail from "./pages/Obsolete/pages/Detail";
import DocumentSharedDetail from "./pages/Shared/pages/Detail";
import PrintHistory from "./pages/PrintHistory";
import PrintHistoryDetail from "./pages/PrintHistory/pages/Detail";

function App() {
  return (
    <Router>
      <ThemeHandler />
      <LoadingOverlay />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Magic Link Auto-Login - Public */}
        <Route path="/auth/magic/:token" element={<MagicLink />} />

        {/* Document Verification Page - Public (for QR code scanning) */}
        <Route path="/verify/:id" element={<DocumentVerification />} />

        {/* Protected Routes */}
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Departments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department-detail/:id"
          element={
            <ProtectedRoute>
              <DepartmentDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/create"
          element={
            <ProtectedRoute>
              <CreateDepartment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/update/:id"
          element={
            <ProtectedRoute>
              <UpdateDepartment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/create"
          element={
            <ProtectedRoute>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/detail/:id"
          element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/update/:id"
          element={
            <ProtectedRoute>
              <UpdateUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/create"
          element={
            <ProtectedRoute>
              <CreateDocument />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/migrate"
          element={
            <ProtectedRoute>
              <MigrationDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/detail/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/update/:id"
          element={
            <ProtectedRoute>
              <UpdateDocument />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/revise/:id"
          element={
            <ProtectedRoute>
              <ReviseDocument />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <UnifiedApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/document/:id"
          element={
            <ProtectedRoute>
              <DocumentApprovalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/print/:id"
          element={
            <ProtectedRoute>
              <PrintApprovalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/deletion/:id"
          element={
            <ProtectedRoute>
              <DeletionApprovalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/revision/:id"
          element={
            <ProtectedRoute>
              <RevisionApprovalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/reference/:id"
          element={
            <ProtectedRoute>
              <ReferenceApprovalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/reference-approve"
          element={
            <ProtectedRoute>
              <ReferenceApproval />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/documents/master-index"
          element={
            <ProtectedRoute>
              <MasterIndex />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/shared-documents"
          element={
            <ProtectedRoute>
              <Shared />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-documents/departments/:id"
          element={
            <ProtectedRoute>
              <DocumentShared />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-documents/detail/:id"
          element={
            <ProtectedRoute>
              <DocumentSharedDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared-documents/master-index"
          element={
            <ProtectedRoute>
              <MasterIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-documents/form-master-index"
          element={
            <ProtectedRoute>
              <FormMasterIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-documents/external-master-index"
          element={
            <ProtectedRoute>
              <ExternalMasterIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obsolete-documents"
          element={
            <ProtectedRoute>
              <Obsolete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obsolete-documents/:id"
          element={
            <ProtectedRoute>
              <ObsoleteDocumentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-history"
          element={
            <ProtectedRoute>
              <PrintHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-history/:id"
          element={
            <ProtectedRoute>
              <PrintHistoryDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Roles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles/create"
          element={
            <ProtectedRoute>
              <CreateRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles/detail/:id"
          element={
            <ProtectedRoute>
              <RoleDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles/update/:id"
          element={
            <ProtectedRoute>
              <UpdateRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/references"
          element={
            <ProtectedRoute>
              <References />
            </ProtectedRoute>
          }
        />

        <Route
          path="/references/create"
          element={
            <ProtectedRoute>
              <CreateReference />
            </ProtectedRoute>
          }
        />

        <Route
          path="/references/update/:id"
          element={
            <ProtectedRoute>
              <UpdateReference />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
