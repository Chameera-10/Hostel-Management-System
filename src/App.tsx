import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import WardenDashboard from './pages/dashboards/WardenDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import { UserRole } from './types';

const AppRoutes: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (authContext?.loading) {
        return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
    }

    const { user } = authContext || {};

    return (
        <Routes>
            <Route path="/welcome" element={!user ? <WelcomePage /> : <Navigate to="/" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            <Route
                path="/"
                element={
                    user ? (
                        user.role === UserRole.Admin ? (
                            <Navigate to="/admin" />
                        ) : user.role === UserRole.Warden ? (
                            <Navigate to="/warden" />
                        ) : (
                            <Navigate to="/student" />
                        )
                    ) : (
                        <Navigate to="/welcome" />
                    )
                }
            />
            <Route path="/admin/*" element={
                <ProtectedRoute role={UserRole.Admin}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/warden/*" element={
                <ProtectedRoute role={UserRole.Warden}>
                    <WardenDashboard />
                </ProtectedRoute>
            } />
            <Route path="/student/*" element={
                <ProtectedRoute role={UserRole.Student}>
                    <StudentDashboard />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    role: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const authContext = useContext(AuthContext);
    if (!authContext?.user) {
        return <Navigate to="/login" />;
    }
    if (authContext.user.role !== role) {
        // Redirect to their own dashboard if they try to access another role's page
        switch (authContext.user.role) {
            case UserRole.Admin:
                return <Navigate to="/admin" />;
            case UserRole.Warden:
                return <Navigate to="/warden" />;
            case UserRole.Student:
                return <Navigate to="/student" />;
            default:
                return <Navigate to="/login" />;
        }
    }
    if (authContext.user.accountStatus !== 'approved') {
        // This case should be handled by the login page, but as a fallback:
         authContext.logout();
         return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="bg-[#e5f3e1] min-h-screen">
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </div>
        </AuthProvider>
    );
};

export default App;
