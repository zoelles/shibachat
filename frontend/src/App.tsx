import { Navigate, Route, Routes } from "react-router";

import CallPage from './pages/CallPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';

import { Toaster } from "react-hot-toast";
import { axiosInstance } from "./lib/axios.ts";
import { useQuery } from "@tanstack/react-query";

const App = () => {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["authUser"], 

    queryFn: async() => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },

    retry: false
  });

  const authUser = authData?.user;

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/call" element={authUser ? <CallPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={authUser ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/onboarding" element={authUser ? <OnboardingPage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
};

export default App