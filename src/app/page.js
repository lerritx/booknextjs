"use client";
import { useState, useEffect } from 'react';

import Body from "@/components/Body";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Gpu from "@/components/Gpu";
import Brand from "@/components/Brand";
import Users from "@/components/Users";

export default function Home() {
  const [currentView, setCurrentView] = useState('home');
  // ปรับเป็น object เช่น { username: "...", type: 0 หรือ 1 }
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // อ่านจาก localStorage แล้ว parse กลับมาเป็น object
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth)); 
    }
  }, []);

  const handleSetAuth = (userData) => {
    // userData คือ { username, type }
    setAuth(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
    // ถ้าไม่ได้เป็นแอดมิน ให้เปลี่ยน default view เป็น 'gpu'
    if (userData.type !== 1) {
      setCurrentView('gpu');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  const handleNavClick = (view) => {
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
          // ถ้า login แล้ว ให้เปลี่ยนหน้าได้ตามเมนู
          currentView === 'home' ? <Body /> :
          currentView === 'gpu' ? <Gpu /> :
          currentView === 'users' ? <Users /> :
          currentView === 'brand' ? <Brand /> :
          <Body />
        ) : (
          // ถ้ายังไม่ได้ login ให้แสดง Body() ไปก่อน
          <Body />
        )}
      </main>
      <Footer />
    </div>
  );
}
