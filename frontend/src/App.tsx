import { Navigate, Route, Routes } from "react-router";

import CallPage from './pages/CallPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.tsx";
import useAuthUser from "./hooks/useAuthUser.ts";
import type { JSX } from "react/jsx-runtime";

const App = () => {
  const {isLoading, authUser} = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  var isOnboarded = authUser?.isOnboarded;

  if(isLoading) {
    return <PageLoader />
  }

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        { /* Pre-Auth Pages */ }
        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />

        { /* Onboarding Page */ }
        <Route path="/onboarding" element={(isAuthenticated && !isOnboarded) ? <OnboardingPage /> : (
          isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" /> ) } />

        { /* Authorized Pages */ }
        <Route path="/" element={ getNavPage(<HomePage />, isAuthenticated, isOnboarded) } />
        <Route path="/call" element={ getNavPage(<CallPage />, isAuthenticated, isOnboarded) } />
        <Route path="/chat" element={ getNavPage(<ChatPage />, isAuthenticated, isOnboarded)} />
        <Route path="/notifications" element={ getNavPage(<NotificationsPage />, isAuthenticated, isOnboarded)} />
      </Routes>

      <Toaster />
    </div>
  )
};

const getNavPage = (intendedPage: JSX.Element, isAuthenticated : Boolean, isOnboarded : Boolean) => {
  if(isAuthenticated && isOnboarded) {
    return intendedPage;
  } else if(isAuthenticated) {
    return <Navigate to="/onboarding" />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App