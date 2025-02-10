// File: server.js - ไฟล์หลักสำหรับการทำงานของ backend server

// นำเข้าโมดูลที่จำเป็นสำหรับการทำงาน
const mysql = require('mysql2/promise'); // ใช้สำหรับเชื่อมต่อและจัดการฐานข้อมูล MySQL แบบ async/await
const config = require('./config'); // นำเข้าไฟล์ config ที่เก็บค่าการตั้งค่าต่างๆ ของระบบ
const express = require('express'); // นำเข้า framework Express.js สำหรับสร้าง web server
const cors = require('cors'); // middleware สำหรับจัดการการเข้าถึง API จากต่างโดเมน
const jwt = require('jsonwebtoken'); // ใช้สำหรับสร้างและตรวจสอบ token ในการยืนยันตัวตน

// สร้าง instance ของ Express application และกำหนดพอร์ต
const app = express(); // สร้าง instance ของ Express application
const port = config.express.port; // กำหนดพอร์ตสำหรับรัน server จากไฟล์ config

// นำเข้าโมดูลสำหรับการเข้ารหัสรหัสผ่าน
const bcrypt = require('bcrypt'); // ใช้สำหรับเข้ารหัสและตรวจสอบรหัสผ่าน

// กำหนดการตั้งค่าสำหรับการเชื่อมต่อฐานข้อมูล MySQL
const pool = mysql.createPool({
  host: config.mysql.host, // ที่อยู่ของ host
  port: config.mysql.port, // พอร์ตของ MySQL server
  database: config.mysql.database, // ชื่อฐานข้อมูล
  user: config.mysql.user, // ชื่อผู้ใช้
  password: config.mysql.password, // รหัสผ่าน
  waitForConnections: true, // รอการเชื่อมต่อหากไม่มี connection ว่าง
  connectionLimit: 10, // จำกัดจำนวนการเชื่อมต่อสูงสุด
  queueLimit: 0, // ไม่จำกัดจำนวนคิวที่รอ
});

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อฐานข้อมูล
const connectDB = async () => {
  try {
    const connection = await pool.getConnection(); // ขอ connection จาก pool
    console.log('Database connection successfully!'); // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
    connection.release(); // คืน connection กลับสู่ pool
  } catch (err) {
    console.error('Database connection error!', err); // แสดงข้อความเมื่อเชื่อมต่อไม่สำเร็จ
    process.exit(1); // หยุด server หาก connect ไม่ได้
  }
};
connectDB(); // เรียกใช้ฟังก์ชันทดสอบการเชื่อมต่อ

// กำหนด middleware ที่จำเป็น
app.use(cors()); // เปิดใช้งาน CORS
app.use(express.json()); // แปลง request body เป็น JSON

// กำหนดจำนวนรอบในการสร้าง salt สำหรับการเข้ารหัส
const saltRounds = 10;

// API endpoints สำหรับจัดการข้อมูล GPUs

// ดึงข้อมูล GPU ทั้งหมด
app.get('/gpus', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT id, manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, bus, memType, gpuChip FROM gpudata;");
        res.json(results); // ส่งผลลัพธ์กลับไปยัง client
    } catch (err) {
        res.status(500).json({ error: "Error fetching GPU data", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// สร้างข้อมูล GPU ใหม่
app.post('/gpus/create', async (req, res) => {
    const gpu = req.body; // รับข้อมูล GPU จาก request body
    const insertSQL = `
        INSERT INTO gpudata (manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, unifiedShader, tmu, rop, pixelShader, vertexShader, igp, bus, memType, gpuChip) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `; // คำสั่ง SQL สำหรับแทรกข้อมูล

    try {
        // ทำการแทรกข้อมูลใหม่
        await pool.query(insertSQL, [
            gpu.manufacturer, gpu.productName, gpu.releaseYear, gpu.memSize, gpu.memBusWidth,
            gpu.gpuClock, gpu.memClock, gpu.unifiedShader, gpu.tmu, gpu.rop,
            gpu.pixelShader, gpu.vertexShader, gpu.igp, gpu.bus, gpu.memType, gpu.gpuChip
        ]);
        // ดึงข้อมูลทั้งหมดหลังจากเพิ่มข้อมูลใหม่
        const [results] = await pool.query("SELECT id, manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, bus, memType, gpuChip FROM gpudata;");
        res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// อัพเดทข้อมูล GPU
app.put('/gpus/update', async (req, res) => {
    const gpu = req.body; // รับข้อมูล GPU ที่ต้องการอัพเดทจาก request body
    const updateSQL = `
        UPDATE gpudata SET manufacturer = ?, productName = ?, releaseYear = ?, memSize = ?, memBusWidth = ?, gpuClock = ?, memClock = ?, /* unifiedShader = ?, tmu = ?, rop = ?, pixelShader = ?, vertexShader = ?, igp = ?, */ bus = ?, memType = ?, gpuChip = ?
        WHERE id = ?
    `; // คำสั่ง SQL สำหรับอัพเดทข้อมูล

    try {
        // ทำการอัพเดทข้อมูล
        await pool.query(updateSQL, [
            gpu.manufacturer, gpu.productName, gpu.releaseYear, gpu.memSize, gpu.memBusWidth,
            gpu.gpuClock, gpu.memClock, gpu.unifiedShader, gpu.tmu, gpu.rop,
            gpu.pixelShader, gpu.vertexShader, gpu.igp, gpu.bus, gpu.memType, gpu.gpuChip, gpu.id
        ]);
        // ดึงข้อมูลทั้งหมดหลังจากอัพเดท
        const [results] = await pool.query("SELECT id, manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, bus, memType, gpuChip FROM gpudata;");
        res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// ลบข้อมูล GPU
app.delete('/gpus/delete', async (req, res) => {
    const { id } = req.body; // รับ ID ของ GPU ที่ต้องการลบ
    try {
        // ทำการลบข้อมูล
        const [result] = await pool.query("DELETE FROM gpudata WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "GPU data not found" }); // ส่งข้อความแจ้งเตือนหากไม่พบข้อมูล
        }
        // ดึงข้อมูลที่เหลือทั้งหมด
        const [remainingGPUs] = await pool.query("SELECT id, manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, bus, memType, gpuChip FROM gpudata;");
        res.status(200).send(remainingGPUs); // ส่งข้อมูลที่เหลือกลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// ค้นหาข้อมูล GPU
app.post('/gpus/search/:search', async (req, res) => {
    const { search } = req.params; // รับคำค้นหาจาก URL parameter
    try {
        // ค้นหาข้อมูลโดยใช้ชื่อผลิตภัณฑ์
        const [results] = await pool.query(
            "SELECT id, manufacturer, productName, releaseYear, memSize, memBusWidth, gpuClock, memClock, bus, memType, gpuChip FROM gpudata WHERE productName LIKE ?",
            [`%${search}%`]
        );
        res.status(200).json(results); // ส่งผลการค้นหากลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// API endpoints สำหรับจัดการข้อมูล Brands

// ดึงข้อมูลแบรนด์ทั้งหมด
app.get('/brands', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT id, brandname, ceo, copname FROM brands;");
        res.json(results); // ส่งข้อมูลทั้งหมดกลับไป
    } catch (err) {
        res.status(500).json({ error: "Error fetching brand data", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// สร้างแบรนด์ใหม่
app.post('/brands/create', async (req, res) => {
    const brand = req.body; // รับข้อมูลแบรนด์จาก request body
    const insertSQL = `
        INSERT INTO brands (brandname, ceo, copname) 
        VALUES (?, ?, ?)
    `; // คำสั่ง SQL สำหรับแทรกข้อมูล
    try {
        // ทำการแทรกข้อมูลใหม่
        await pool.query(insertSQL, [brand.brandname, brand.ceo, brand.copname]);
        // ดึงข้อมูลทั้งหมดหลังจากเพิ่มข้อมูลใหม่
        const [results] = await pool.query("SELECT id, brandname, ceo, copname FROM brands;");
        res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// แก้ไขข้อมูลแบรนด์
app.put('/brands/update', async (req, res) => {
    const brand = req.body; // รับข้อมูลแบรนด์ที่ต้องการแก้ไขจาก request body
    const updateSQL = `
        UPDATE brands 
        SET brandname = ?, ceo = ?, copname = ?
        WHERE id = ?
    `; // คำสั่ง SQL สำหรับอัพเดทข้อมูล
    try {
        // ทำการอัพเดทข้อมูล
        await pool.query(updateSQL, [brand.brandname, brand.ceo, brand.copname, brand.id]);
        // ดึงข้อมูลทั้งหมดหลังจากอัพเดท
        const [results] = await pool.query("SELECT id, brandname, ceo, copname FROM brands;");
        res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
    } catch (err) {
        res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
    }
});

// ลบแบรนด์
app.delete('/brands/delete', async (req, res) => {
    const { id } = req.body; // รับ ID ของแบรนด์ที่ต้องการลบ
    try {
        // ทำการลบข้อมูล
        const [result] = await pool.query("DELETE FROM brands WHERE id = ?", [id]);
        if (result.affectedRows === 0) {return res.status(404).json({ error: "Brand not found" }); // ส่งข้อความแจ้งเตือนหากไม่พบข้อมูล
    }
    // ดึงข้อมูลที่เหลือทั้งหมด
    const [remainingBrands] = await pool.query("SELECT id, brandname, ceo, copname FROM brands;");
    res.status(200).send(remainingBrands); // ส่งข้อมูลที่เหลือกลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// ค้นหาแบรนด์ โดยค้นหาจาก brandname, ceo หรือ copname
app.post('/brands/search/:searchText', async (req, res) => {
const { searchText } = req.params; // รับคำค้นหาจาก URL parameter
try {
    // กำหนดคำสั่ง SQL สำหรับค้นหา
    const searchSQL = `
        SELECT id, brandname, ceo, copname 
        FROM brands 
        WHERE brandname LIKE ? OR ceo LIKE ? OR copname LIKE ?
    `;
    const queryText = `%${searchText}%`; // เพิ่ม wildcard character สำหรับการค้นหาแบบ partial match
    // ทำการค้นหาข้อมูล
    const [results] = await pool.query(searchSQL, [queryText, queryText, queryText]);
    res.status(200).json(results); // ส่งผลการค้นหากลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// API endpoints สำหรับจัดการข้อมูลผู้ใช้

// ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
try {
    const [results] = await pool.query("SELECT id, username, password, permiss, type FROM users;");
    res.json(results); // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
} catch (err) {
    res.status(500).json({ error: "Error fetching user data", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// สร้างผู้ใช้ใหม่
app.post('/users/create', async (req, res) => {
const user = req.body; // รับข้อมูลผู้ใช้จาก request body
const insertSQL = `
    INSERT INTO users (username, password, permiss, type) 
    VALUES (?, ?, ?, ?)
`; // คำสั่ง SQL สำหรับแทรกข้อมูล
try {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds); // เข้ารหัสรหัสผ่าน
    // แปลงค่าจาก string เป็น int สำหรับ permiss และ type
    const permiss = parseInt(user.permiss, 10);
    const type = parseInt(user.type, 10);
    // ทำการแทรกข้อมูลใหม่
    await pool.query(insertSQL, [user.username, hashedPassword, permiss, type]);
    // ดึงข้อมูลทั้งหมดหลังจากเพิ่มข้อมูลใหม่
    const [results] = await pool.query("SELECT id, username, password, permiss, type FROM users;");
    res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// อัพเดทข้อมูลผู้ใช้
app.put('/users/update', async (req, res) => {
const user = req.body; // รับข้อมูลผู้ใช้ที่ต้องการอัพเดทจาก request body
const updateSQL = `
    UPDATE users 
    SET username = ?, permiss = ?, type = ?
    WHERE id = ?
`; // คำสั่ง SQL สำหรับอัพเดทข้อมูล
try {
    // แปลงค่า permiss และ type ให้เป็น integer
    const permiss = parseInt(user.permiss, 10);
    const type = parseInt(user.type, 10);
    // ทำการอัพเดทข้อมูล
    await pool.query(updateSQL, [user.username, permiss, type, user.id]);
    // ดึงข้อมูลทั้งหมดหลังจากอัพเดท
    const [results] = await pool.query("SELECT id, username, password, permiss, type FROM users;");
    res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// อัพเดทรหัสผ่านผู้ใช้
app.put('/users/updatePassword', async (req, res) => {
const { id, password } = req.body; // รับ ID และรหัสผ่านใหม่จาก request body
const updatePasswordSQL = `
    UPDATE users 
    SET password = ?
    WHERE id = ?
`; // คำสั่ง SQL สำหรับอัพเดทรหัสผ่าน
try {
    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // ทำการอัพเดทรหัสผ่าน
    await pool.query(updatePasswordSQL, [hashedPassword, id]);
    // ดึงข้อมูลทั้งหมดหลังจากอัพเดท
    const [results] = await pool.query("SELECT id, username, password, permiss, type FROM users;");
    res.status(200).send(results); // ส่งข้อมูลทั้งหมดกลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// ลบผู้ใช้
app.delete('/users/delete', async (req, res) => {
const { id } = req.body; // รับ ID ของผู้ใช้ที่ต้องการลบ
try {
    // ทำการลบข้อมูล
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" }); // ส่งข้อความแจ้งเตือนหากไม่พบข้อมูล
    }
    // ดึงข้อมูลที่เหลือทั้งหมด
    const [remainingUsers] = await pool.query("SELECT id, username, password, permiss, type FROM users;");
    res.status(200).send(remainingUsers); // ส่งข้อมูลที่เหลือกลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// ค้นหาผู้ใช้
app.post('/users/search/:searchText', async (req, res) => {
const { searchText } = req.params; // รับคำค้นหาจาก URL parameter
try {
    // กำหนดคำสั่ง SQL สำหรับค้นหา
    const searchSQL = `
        SELECT id, username, password, permiss, type 
        FROM users 
        WHERE username LIKE ? OR permiss LIKE ?
    `;
    const queryText = `%${searchText}%`; // เพิ่ม wildcard character สำหรับการค้นหาแบบ partial match
    // ทำการค้นหาข้อมูล
    const [results] = await pool.query(searchSQL, [queryText, queryText]);
    res.status(200).json(results); // ส่งผลการค้นหากลับไป
} catch (err) {
    res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// API สำหรับการเข้าสู่ระบบ
app.post('/login', async (req, res) => {
const { user, pass } = req.body; // รับ username และ password จาก request body

try {
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [results] = await pool.query("SELECT * FROM users WHERE username = ?", [user]);
    if (results.length > 0) {
        const userRecord = results[0];

        // ตรวจสอบ permission (permiss)
        if (userRecord.permiss !== 1) {
            return res.status(403).json({ success: false, message: "User does not have permission to login" }); // ส่งข้อความแจ้งเตือนหากไม่มีสิทธิ์เข้าใช้งาน
        }

        // เปรียบเทียบรหัสผ่าน
        const isMatch = await bcrypt.compare(pass, userRecord.password);
        if (isMatch) {
            // ส่งข้อมูลกลับเมื่อเข้าสู่ระบบสำเร็จ
            res.json({ 
                success: true, 
                message: "Login successful", 
                type: userRecord.type
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password" }); // ส่งข้อความแจ้งเตือนเมื่อรหัสผ่านไม่ถูกต้อง
        }
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" }); // ส่งข้อความแจ้งเตือนเมื่อไม่พบผู้ใช้
    }
} catch (err) {
    res.status(500).json({ success: false, message: "Login failed", details: err.message }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// API สำหรับการลงทะเบียน
app.post('/register', async (req, res) => {
const { user, pass } = req.body; // รับ username และ password จาก request body
console.log("Username:", user);  // แสดง log username
console.log("Password:", pass);  // แสดง log password

// ตรวจสอบว่ามีการกรอกข้อมูลครบหรือไม่
if (!user || !pass) {
    return res.status(400).json({ success: false, message: "Fill Username and Password" });
}

// กำหนดคำสั่ง SQL สำหรับตรวจสอบและเพิ่มข้อมูล
const checkUserSQL = "SELECT * FROM users WHERE username = ?";
const registerSQL = "INSERT INTO users (username, password, permiss, type) VALUES (?, ?, ?, ?)";

try {
    // ตรวจสอบว่า username มีอยู่ในระบบแล้วหรือไม่
    const [rows] = await pool.query(checkUserSQL, [user]);
    if (rows.length > 0) {
        return res.status(409).json({ success: false, message: "Username already exists" }); // ส่งข้อความแจ้งเตือนหาก username ซ้ำ
    }

    // เข้ารหัสรหัสผ่านและบันทึกข้อมูลผู้ใช้ใหม่
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    await pool.query(registerSQL, [user, hashedPassword, 1, 0]);
    res.status(201).json({ success: true }); // ส่งข้อความแจ้งเตือนเมื่อลงทะเบียนสำเร็จ
} catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, message: "Unexpected error occurred." }); // ส่งข้อความ error กลับไปหากมีข้อผิดพลาด
}
});

// เริ่มการทำงานของ server
app.listen(port, () => {
console.log(`Server is running on port ${port}`); // แสดงข้อความเมื่อ server เริ่มทำงาน
});