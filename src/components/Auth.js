"use client"; // บ่งบอกว่าเป็น Client Component ใน Next.js

import { useState } from 'react'; // นำเข้า useState hook จาก React

// คอมโพเนนต์หลักสำหรับการยืนยันตัวตน รับ props: isOpen (สถานะการแสดงผล), onClose (ฟังก์ชันปิด), setAuth (ฟังก์ชันตั้งค่าข้อมูลผู้ใช้)
export default function Auth({ isOpen, onClose, setAuth }) {
  // กำหนด state ต่างๆ ที่ใช้ในคอมโพเนนต์
  const [isRegister, setIsRegister] = useState(false); // สถานะว่าเป็นหน้าลงทะเบียนหรือเข้าสู่ระบบ
  const [username, setUsername] = useState(''); // เก็บค่า username
  const [password, setPassword] = useState(''); // เก็บค่า password
  const [error, setError] = useState(''); // เก็บข้อความ error
  const [success, setSuccess] = useState(''); // เก็บข้อความแจ้งเตือนสำเร็จ

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    // กำหนด URL ตามสถานะว่าเป็นการลงทะเบียนหรือเข้าสู่ระบบ
    const url = isRegister ? "http://localhost:3001/register" : "http://localhost:3001/login";
    
    // ส่ง request ไปยัง server
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, pass: password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (isRegister) {
            // กรณีลงทะเบียนสำเร็จ
            setSuccess("Registration successful! You can now log in.");
            setError('');
            setIsRegister(false); // เปลี่ยนกลับไปหน้า login
          } else {
            // กรณีเข้าสู่ระบบสำเร็จ
            // สร้างข้อมูลผู้ใช้เพื่อเก็บใน state และ localStorage
            const userData = {
              username: username,
              type: data.type, // รับค่า type จาก server
            };

            setAuth(userData); // อัพเดท state ของผู้ใช้
            // เก็บข้อมูลลง localStorage เพื่อคงสถานะการเข้าสู่ระบบ
            localStorage.setItem("auth", JSON.stringify(userData));

            setError('');
            onClose(); // ปิดหน้าต่าง modal
          }
        } else {
          // กรณีเกิดข้อผิดพลาด
          setError(data.message || "An error occurred.");
          setSuccess('');
        }
      })
      .catch((err) => {
        // จัดการกรณีเกิดข้อผิดพลาดในการเชื่อมต่อ
        console.error(err);
        setError("Request failed! Please try again.");
        setSuccess('');
      });
  };

  // ถ้า modal ไม่ได้เปิดอยู่ ไม่ต้องแสดงผลอะไร
  if (!isOpen) return null;

  // ส่วนแสดงผล UI
  return (
    // overlay ทั้งหน้าจอ
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      {/* กล่อง modal */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* หัวข้อ */}
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
          {isRegister ? "Register" : "Login"}
        </h2>
        {/* แสดงข้อความ error และ success */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {/* ฟอร์มสำหรับกรอกข้อมูล */}
        <form onSubmit={handleSubmit}>
          {/* ส่วนกรอก username */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {/* ส่วนกรอก password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {/* ปุ่มดำเนินการ */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-500 hover:to-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isRegister ? "Register" : "Login"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
        {/* ปุ่มสลับระหว่างหน้า login และ register */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister); // สลับสถานะ
              setError(''); // ล้างข้อความ error
              setSuccess(''); // ล้างข้อความ success
            }}
            className="text-red-500 hover:text-teal-700"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}