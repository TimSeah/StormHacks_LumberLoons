import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Call from "./pages/Call";
import ChatLog from "./pages/ChatLog";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MainStack from "./pages/MainStack";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MainStack />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <MainStack />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <MainStack />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrie"
            element={
              <ProtectedRoute>
                <Call />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <ChatLog />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
