import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CommunityPage from "./components/pages/CommunityPage";
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import MoviesPage from "./components/pages/MoviesPage"; 
import ShowtimePage from "./components/pages/ShowtimePage";
import MovieDetail from './components/pages/MovieDetail'; 
import BookingPage from './components/pages/BookingPage';
import ScrollToTop from './components/pages/ScrollToTop';
import RegisterPage from './components/pages/RegisterPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import AdminRoute from './components/pages/AdminRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import ManageUsers from './components/pages/ManageUsers';
import UserProfile from './components/pages/UserProfileMain';
import PaymentReturn from './components/pages/PaymentReturn';
import PaymentPage from './components/pages/PaymentPage';
import SnackPage from './components/pages/booking/SnackPage';
import ManageTrailer from './components/pages/admin/ManageTrailer';


import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

const AppContent = () => {
  const location = useLocation(); 
  
  const isAdminRoute = location.pathname.startsWith('/admin'); 

  return (
    <div className="App min-h-screen flex flex-col font-body">
      <Header />
      
      <main className="grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/movie/:id" element={<MovieDetail />} /> 
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/schedule" element={<ShowtimePage />} />

          <Route path="/booking/:showtimeId" element={<BookingPage />} />
          <Route path="/booking/snacks/:bookingId" element={<SnackPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/payment-return" element={<PaymentReturn />} />
          <Route path="/community" element={<CommunityPage />} />

          <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
      />
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;