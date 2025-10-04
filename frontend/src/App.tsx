import { Route, Routes } from "react-router";
import BottomNavigation from "./components/BottomNavigation";
import Account from "./pages/Account";
import History from "./pages/History";
import Home from "./pages/Home";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main content area with bottom padding to account for fixed navigation */}
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default App;
