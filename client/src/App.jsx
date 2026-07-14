import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Your Pages
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Login from "./pages/Login"; // Assuming this is your Clerk SignIn page
import AIAssistantPage from "./pages/AIAssistantPage";
import PredictionsPage from "./pages/PredictionsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Sidebar from "./components/Sidebar";

// 🛡️ Custom Admin Wrapper: Kicks non-admins back to the dashboard
const AdminRoute = ({ children }) => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const devRole = localStorage.getItem("devRole") || "volunteer";

  // Enforce admin permission strictly for ninaadkumbhar@gmail.com and any ninaad email
  const isAdmin = (userEmail.includes("ninaad") || userEmail === "ninaadkumbhar@gmail.com") && devRole === "admin";

  if (!isAdmin) {
    return <Navigate to="/" />; // Redirects regular volunteers away
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC ROUTE: Only visible if you are logged out */}
        <Route path="/login" element={
          <SignedOut>
            <Login />
          </SignedOut>
        } />

        {/* 2. PROTECTED ROUTES: The Highway */}
        <Route path="/*" element={
          <>
            <SignedIn>
              {/* This layout keeps your Sidebar visible on every page! */}
              <div className="flex bg-slate-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <Routes>
                    {/* General Routes (Everyone logged in can see these) */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/ai-assistant" element={<AIAssistantPage />} />
                    <Route path="/predictions" element={<PredictionsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    
                    {/* Admin-Only Routes (Protected by our custom wrapper) */}
                    <Route path="/create-event" element={
                      <AdminRoute>
                        <CreateEvent />
                      </AdminRoute>
                    } />
                    <Route path="/edit-event/:id" element={
                      <AdminRoute>
                        <EditEvent />
                      </AdminRoute>
                    } />
                  </Routes>
                </div>
              </div>
            </SignedIn>

            {/* If a guest tries to load any URL without logging in, redirect them */}
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;