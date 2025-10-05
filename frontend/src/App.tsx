import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Call from "./pages/Call";
import ChatLog from "./pages/ChatLog";
import MainStack from "./pages/MainStack";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="">
        <Routes>
          <Route
            path="/*"
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
