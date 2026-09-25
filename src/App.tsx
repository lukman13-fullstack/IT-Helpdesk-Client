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
import Users from "@/pages/Users";
import CreateUser from "@/pages/Users/pages/create";
import UpdateUser from "@/pages/Users/pages/update";
import DetailUser from "@/pages/Users/pages/detail";

import Roles from "@/pages/Roles";
import CreateRole from "@/pages/Roles/pages/create";
import UpdateRole from "@/pages/Roles/pages/update";
import DetailRole from "@/pages/Roles/pages/detail";

import Departments from "@/pages/Departments";
import CreateDepartment from "@/pages/Departments/pages/create";
import UpdateDepartment from "@/pages/Departments/pages/update";
import DetailDepartment from "@/pages/Departments/pages/detail";
import TicketCategories from "@/pages/TicketCategories";
import CreateTicketCategory from "@/pages/TicketCategories/create";
import UpdateTicketCategory from "@/pages/TicketCategories/update";
import Tickets from "@/pages/Tickets";
import TicketDetail from "@/pages/Tickets/detail";
import PortalHome from "@/pages/Portal/Home";
import PortalTickets from "@/pages/Portal/MyTickets";
import PortalCreateTicket from "@/pages/Portal/CreateTicket";
import PortalTicketDetail from "@/pages/Portal/TicketDetail";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";

import type { AuthUser } from "@/store/authUser/types";

import LoadingOverlay from "@/components/common/LoadingOverlay";

import RoleSelection from "@/pages/RoleSelection";

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

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.authUser.user);
  if (!user) return <Navigate to="/" replace />;
  
  const roleName = user.role?.name;
  if (roleName !== "Admin" && roleName !== "Super Admin") {
    return <Navigate to="/portal" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.authUser.user);
  
  if (user) {
    const roleName = user.role?.name;
    if (roleName === "Super Admin") {
      return <Navigate to="/role-selection" replace />;
    } else if (roleName === "Admin") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/portal" replace />;
    }
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
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

        {/* Landing Page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        {/* Super Admin Role Selection */}
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />

        {/* Admin Routes (CMS) */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/users/create" element={<AdminRoute><CreateUser /></AdminRoute>} />
        <Route path="/users/update/:id" element={<AdminRoute><UpdateUser /></AdminRoute>} />
        <Route path="/users/detail/:id" element={<AdminRoute><DetailUser /></AdminRoute>} />

        <Route path="/roles" element={<AdminRoute><Roles /></AdminRoute>} />
        <Route path="/roles/create" element={<AdminRoute><CreateRole /></AdminRoute>} />
        <Route path="/roles/update/:id" element={<AdminRoute><UpdateRole /></AdminRoute>} />
        <Route path="/roles/detail/:id" element={<AdminRoute><DetailRole /></AdminRoute>} />

        <Route path="/departments" element={<AdminRoute><Departments /></AdminRoute>} />
        <Route path="/departments/create" element={<AdminRoute><CreateDepartment /></AdminRoute>} />
        <Route path="/departments/update/:id" element={<AdminRoute><UpdateDepartment /></AdminRoute>} />
        <Route path="/departments/detail/:id" element={<AdminRoute><DetailDepartment /></AdminRoute>} />
        
        <Route path="/ticket-categories" element={<AdminRoute><TicketCategories /></AdminRoute>} />
        <Route path="/ticket-categories/create" element={<AdminRoute><CreateTicketCategory /></AdminRoute>} />
        <Route path="/ticket-categories/update/:id" element={<AdminRoute><UpdateTicketCategory /></AdminRoute>} />
        
        <Route path="/tickets" element={<AdminRoute><Tickets /></AdminRoute>} />
        <Route path="/tickets/detail/:id" element={<AdminRoute><TicketDetail /></AdminRoute>} />

        {/* User Portal Routes */}
        <Route path="/portal" element={<ProtectedRoute><PortalHome /></ProtectedRoute>} />
        <Route path="/portal/tickets" element={<ProtectedRoute><PortalTickets /></ProtectedRoute>} />
        <Route path="/portal/tickets/new" element={<ProtectedRoute><PortalCreateTicket /></ProtectedRoute>} />
        <Route path="/portal/tickets/:id" element={<ProtectedRoute><PortalTicketDetail /></ProtectedRoute>} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
