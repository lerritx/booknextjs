// File: server.js - ไฟล์หลักสำหรับการทำงานของ backend server

const mysql = require('mysql2/promise'); // ใช้สำหรับเชื่อมต่อและจัดการฐานข้อมูล MySQL แบบ async/await
const config = require('./config'); // นำเข้าไฟล์ config ที่เก็บค่าการตั้งค่าต่างๆ ของระบบ
const express = require('express'); // นำเข้า framework Express.js สำหรับสร้าง web server
const cors = require('cors'); // middleware สำหรับจัดการการเข้าถึง API จากต่างโดเมน
const jwt = require('jsonwebtoken'); // ใช้สำหรับสร้างและตรวจสอบ token ในการยืนยันตัวตน

const app = express(); // สร้าง instance ของ Express application
const port = config.express.port; // กำหนดพอร์ตสำหรับรัน server จากไฟล์ config

const bcrypt = require('bcrypt'); // ใช้สำหรับเข้ารหัสและตรวจสอบรหัสผ่าน

// สร้าง Connection Pool
const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  database: config.mysql.database,
  user: config.mysql.user,
  password: config.mysql.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successfully!');
    connection.release(); // คืน connection กลับสู่ pool
  } catch (err) {
    console.error('Database connection error!', err);
    process.exit(1); // หยุด server หาก connect ไม่ได้
  }
};
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// // GET /patients - ดึงข้อมูลผู้ป่วยทั้งหมด
// app.get("/patients", async (req, res) => {
//   try {
//     const [results] = await pool.query("SELECT * FROM patients");
//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching patients", details: err.message });
//   }
// });

// // Patients Create API
// app.post('/patients/create/', async (req, res) => {
// 	const params = req.body;
  
// 	console.log("create:", params);
  
// 	const insertSQL = `
// 	  INSERT INTO patients (HN, Name, Patient_Rights_1, Patient_Rights_2, Patient_Rights_3, Chronic_Disease, Address, Phone) 
// 	  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
// 	`;
// 	const readSQL = "SELECT * FROM patients";
  
// 	try {
// 	  // Insert patient data
// 	  await pool.query(insertSQL, [
// 		params.HN,
// 		params.Name,
// 		params.Patient_Rights_1,
// 		params.Patient_Rights_2,
// 		params.Patient_Rights_3,
// 		params.Chronic_Disease,
// 		params.Address,
// 		params.Phone,
// 	  ]);
  
// 	  // Retrieve all patients
// 	  const [results] = await pool.query(readSQL);
// 	  res.status(200).send(results);
// 	} catch (err) {
// 	  console.error('Database connection error:', err);
// 	  res.status(500).send("Backend error!");
// 	}
//   });
  
// // Patients Update API
// app.put('/patients/update/', async (req, res) => {
// 	const params = req.body;
  
// 	console.log("update:", params);
  
// 	const updateSQL = `
// 	  UPDATE patients 
// 	  SET Name = ?, 
// 		  Patient_Rights_1 = ?, 
// 		  Patient_Rights_2 = ?, 
// 		  Patient_Rights_3 = ?, 
// 		  Chronic_Disease = ?, 
// 		  Address = ?, 
// 		  Phone = ? 
// 	  WHERE HN = ?
// 	`;
// 	const readSQL = "SELECT * FROM patients";
  
// 	try {
// 	  // Update patient data
// 	  await pool.query(updateSQL, [
// 		params.Name,
// 		params.Patient_Rights_1,
// 		params.Patient_Rights_2,
// 		params.Patient_Rights_3,
// 		params.Chronic_Disease,
// 		params.Address,
// 		params.Phone,
// 		params.HN,
// 	  ]);
  
// 	  // Retrieve all patients
// 	  const [results] = await pool.query(readSQL);
// 	  res.status(200).send(results);
// 	} catch (err) {
// 	  console.error('Database connection error:', err);
// 	  res.status(500).send("Backend error!");
// 	}
//   });
  
// // Patients Delete API
// app.delete('/patients/delete/', async (req, res) => {
// 	const { HN } = req.body; // รับค่า HN ที่ต้องการลบจาก body
  
// 	console.log("delete:", HN);
  
// 	const deleteSQL = "DELETE FROM patients WHERE HN = ?";
// 	const readSQL = "SELECT * FROM patients";
  
// 	try {
// 	  // ลบข้อมูลผู้ป่วยที่ระบุ
// 	  const [result] = await pool.query(deleteSQL, [HN]);
  
// 	  if (result.affectedRows === 0) {
// 		return res.status(404).json({ error: "Patient not found" }); // กรณีไม่มีข้อมูลผู้ป่วยที่ลบ
// 	  }
  
// 	  // ดึงข้อมูลผู้ป่วยที่เหลือทั้งหมด
// 	  const [remainingPatients] = await pool.query(readSQL);
// 	  res.status(200).send(remainingPatients);
// 	} catch (err) {
// 	  console.error('Database connection error:', err);
// 	  res.status(500).send("Backend error!");
// 	}
//   });
  
// app.post('/patients/search/:searchText', async (req, res) => {
// 	const { searchText } = req.params;
  
// 	// ตรวจสอบตัวอักษรพิเศษ
// 	const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~^\s]/;
// 	const test = format.test(searchText);
  
// 	if (test) {
// 	  return res.status(400).json({ error: "Invalid search text" }); // หากเจออักขระพิเศษ ให้แจ้งเตือน
// 	}
  
// 	const searchSQL = "SELECT * FROM patients WHERE Name LIKE ?";
  
// 	try {
// 	  const [results] = await pool.query(searchSQL, [`%${searchText}%`]);
// 	  res.status(200).json(results);
// 	} catch (err) {
// 	  console.error('Database error:', err);
// 	  res.status(500).json({ error: "Backend error", details: err.message });
// 	}
// });
  
// API สำหรับ People ใน server.js

// GET /people - ดึงข้อมูลทั้งหมด
app.get("/people", async (req, res) => {
	try {
	  const [results] = await pool.query("SELECT * FROM itd_data_exam");
	  res.json(results);
	} catch (err) {
	  res.status(500).json({ error: "Error fetching people", details: err.message });
	}
  });
  
  // POST /people/create - เพิ่มข้อมูล
  app.post("/people/create", async (req, res) => {
	const { Age, Gender, Occupation, Monthly_Income, Educational_Qualifications, Feedback } = req.body;
	const insertSQL = `
	  INSERT INTO itd_data_exam (Age, Gender, Occupation, Monthly_Income, Educational_Qualifications, Feedback) 
	  VALUES (?, ?, ?, ?, ?, ?)
	`;
	const readSQL = "SELECT * FROM itd_data_exam";
  
	try {
	  await pool.query(insertSQL, [Age, Gender, Occupation, Monthly_Income, Educational_Qualifications, Feedback]);
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  res.status(500).send("Backend error!");
	}
  });
  
  // PUT /people/update - แก้ไขข้อมูล
  app.put("/people/update", async (req, res) => {
	const { id, Age, Gender, Occupation, Monthly_Income, Educational_Qualifications, Feedback } = req.body;
	const updateSQL = `
	  UPDATE itd_data_exam 
	  SET Age = ?, Gender = ?, Occupation = ?, Monthly_Income = ?, Educational_Qualifications = ?, Feedback = ?
	  WHERE id = ?
	`;
	const readSQL = "SELECT * FROM itd_data_exam";
  
	try {
	  await pool.query(updateSQL, [Age, Gender, Occupation, Monthly_Income, Educational_Qualifications, Feedback, id]);
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  res.status(500).send("Backend error!");
	}
  });
  
  // DELETE /people/delete - ลบข้อมูล
  app.delete("/people/delete", async (req, res) => {
	const { id } = req.body;
	const deleteSQL = "DELETE FROM itd_data_exam WHERE id = ?";
	const readSQL = "SELECT * FROM itd_data_exam";
  
	try {
	  const [result] = await pool.query(deleteSQL, [id]);
	  if (result.affectedRows === 0) {
		return res.status(404).json({ error: "Person not found" });
	  }
	  const [remainingPeople] = await pool.query(readSQL);
	  res.status(200).send(remainingPeople);
	} catch (err) {
	  res.status(500).send("Backend error!");
	}
  });
  
  // POST /people/search/:searchText - ค้นหาข้อมูล
  app.post("/people/search/:searchText", async (req, res) => {
	const { searchText } = req.params;
  
	if (/[^a-zA-Z0-9ก-๙\s]/.test(searchText)) {
	  return res.status(400).json({ error: "Invalid search text" });
	}
  
	const searchSQL = `
	  SELECT * FROM itd_data_exam 
	  WHERE Age LIKE ? OR Gender LIKE ? OR Occupation LIKE ? 
		OR Monthly_Income LIKE ? OR Educational_Qualifications LIKE ? OR Feedback LIKE ?
	`;
	try {
	  const [results] = await pool.query(searchSQL, Array(6).fill(`%${searchText}%`));
	  res.status(200).json(results);
	} catch (err) {
	  res.status(500).json({ error: "Backend error", details: err.message });
	}
  });
// Login API
app.post('/login', async (req, res) => {
    const { user, pass } = req.body;

    try {
        const [results] = await pool.query("SELECT * FROM users WHERE username = ?", [user]);
        if (results.length > 0) {
            const userRecord = results[0];
            // Compare hashed password
            const isMatch = await bcrypt.compare(pass, userRecord.password);
            if (isMatch) {
                res.json({ success: true, message: "Login successful" });
            } else {
                res.status(401).json({ success: false, message: "Invalid username or password" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Login failed", details: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { user, pass } = req.body;
    console.log("Username:", user);  
    console.log("Password:", pass);
  
    if (!user || !pass) {
      return res.status(400).json({ success: false, message: "Fill Username and Password" });
    }
  
    const registerSQL = "INSERT INTO users (username, password) VALUES (?, ?)";
  
    try {

      const [results] = await pool.query(registerSQL, [user, pass]);

      res.status(201).json({ success: true});
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error occurred." });
    }
  });


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
