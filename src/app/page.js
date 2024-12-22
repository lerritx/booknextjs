"use client";

import { useState, useEffect } from 'react';
import Body from "@/components/Body";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Patients from "@/components/Patients";
import Rights from "@/components/Rights";

export default function Home() {
  const [currentView, setCurrentView] = useState('home');
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Set the initial auth state from localStorage
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(storedAuth);
    }
  }, []);

  const handleSetAuth = (username) => {
    setAuth(username);
    localStorage.setItem("auth", username);
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  const handleNavClick = (view) => {
    console.log(view);
    setCurrentView(view);
  };

  return (
    <div className="flex min-h-screen font-sans">
      <Header 
        onNavClick={handleNavClick} 
        auth={auth} 
        setAuth={handleSetAuth} 
        onLogout={handleLogout} 
      />
      <main className="flex-grow pt-16">
        {auth ? (
          currentView === 'home' ? (
            <Body />
          ) : currentView === 'patients' ? (
            <Patients />
          ) : (
            <Rights />
          )
        ) : (
          <Body />
        )}
      </main>
      <Footer />
    </div>
  );
}
