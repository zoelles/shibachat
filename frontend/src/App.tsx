import { Route, Routes } from "react-router";

import CallPage from './pages/CallPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="h-screen" data-theme="night">
      <button onClick={() => toast.success("Hello World!")}>Create a Toast</button>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>

      <Toaster />
    </div>
  )
};

export default App