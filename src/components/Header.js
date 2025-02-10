"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faUser, faRightFromBracket, faFile, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import Auth from "@/components/Auth";

export default function Header({ onNavClick, auth, setAuth, onLogout }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ถ้า auth มีค่า จะเป็น Object { username, type }
  // เช่น { username: "john", type: 1 }
  // ถ้าไม่ login, auth = null
  const storedAuth = auth || null;

  useEffect(() => {
    console.log("Auth state changed:", auth);
  }, [auth]);

  const handleLoginClick = () => {
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  const handleLogoutClick = () => {
    // เคลียร์ state และ localStorage จากภายนอก (onLogout)
    setAuth(null);
    onLogout();
  };

  return (
    <header className="bg-gradient-to-r from-blue-300 to-blue-700 text-white py-1 px-2 w-full shadow-md fixed top-0 z-50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          {/* Logo / ชื่อระบบ */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-12 h-12 md:w-24 md:h-24 flex items-center justify-center">
              {/* ปุ่มไปหน้า home */}
              <button onClick={() => onNavClick('home')}>
                <FontAwesomeIcon icon={faMicrochip} className="text-2xl md:text-4xl" />
              </button>
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-lg md:text-2xl font-bold">GPU Collection Data</h1>
              <p className="text-sm md:text-lg">ระบบจัดการฐานข้อมูลของกราฟิกการ์ด</p>
            </div>
          </div>

          {/* Navigation เมนู */}
          <nav className="flex flex-row gap-1 md:gap-4">
            {storedAuth ? (
              <>
                {/* ทุก type (0,1) เห็น GPU และ Brand */}
                <button 
                  onClick={() => onNavClick('gpu')} 
                  className="text-white hover:scale-105 transform transition-transform px-2 md:px-5 py-1 md:py-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faFile} className="mr-1 md:mr-2" />
                  <span className="hidden md:inline">GPU</span>
                </button>
                
                <button 
                  onClick={() => onNavClick('brand')} 
                  className="text-white hover:scale-105 transform transition-transform px-2 md:px-5 py-1 md:py-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faWindowRestore} className="mr-1 md:mr-2" />
                  <span className="hidden md:inline">Brand</span>
                </button>

                {/* เฉพาะ type=1 (Admin) เท่านั้น ที่เห็นเมนู Users */}
                {storedAuth.type === 1 && (
                  <button 
                    onClick={() => onNavClick('users')} 
                    className="text-white hover:scale-105 transform transition-transform px-2 md:px-5 py-1 md:py-2 text-sm md:text-base"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-1 md:mr-2" />
                    <span className="hidden md:inline">Users</span>
                  </button>
                )}

                {/* ปุ่ม Logout (แสดงชื่อ user ด้วย) */}
                <button 
                  onClick={handleLogoutClick} 
                  className="text-white hover:scale-105 transform transition-transform px-2 md:px-5 py-1 md:py-2 text-sm md:text-base"
                >
                  {/* ใช้ storedAuth?.username เพื่อกัน error กรณี auth = null */}
                  Welcome {storedAuth?.username}
                  <FontAwesomeIcon icon={faRightFromBracket} className="ps-2 ml-1 md:ml-2" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleLoginClick} 
                className="text-white hover:scale-105 transform transition-transform px-2 md:px-5 py-1 md:py-2 text-sm md:text-base"
              >
                <FontAwesomeIcon icon={faUser} className="mr-1 md:mr-2" />
                <span className="hidden md:inline">Login</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <Auth isOpen={isAuthOpen} onClose={handleCloseAuth} setAuth={setAuth} />
    </header>
  );
}
