import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import PublicEvents from "./pages/PublicEvents";
import NotFoundPage from "./pages/404";
import ForbiddenPage from "./pages/403";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicEvents />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["admin", "organizer"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
