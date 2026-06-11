import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { HomePage } from "@/pages/HomePage";
import { WinnersPage } from "@/pages/WinnersPage";

// Admin code stays out of the participant bundle.
const ProtectedRoute = lazy(() =>
  import("@/components/auth/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute }))
);
const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage }))
);
const AdminMatchesPage = lazy(() =>
  import("@/pages/admin/AdminMatchesPage").then((m) => ({ default: m.AdminMatchesPage }))
);
const AdminMatchDetailPage = lazy(() =>
  import("@/pages/admin/AdminMatchDetailPage").then((m) => ({ default: m.AdminMatchDetailPage }))
);
const WheelPage = lazy(() =>
  import("@/pages/admin/WheelPage").then((m) => ({ default: m.WheelPage }))
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-center" />
        <Suspense fallback={<FullScreenSpinner />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/winners" element={<WinnersPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminMatchesPage />} />
                <Route path="/admin/matches/:matchId" element={<AdminMatchDetailPage />} />
              </Route>
              {/* Projector view — intentionally chrome-free */}
              <Route path="/admin/wheel/:matchId" element={<WheelPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
