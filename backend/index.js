const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo kết nối DB ngay khi chạy server
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const internshipRoutes = require('./routes/internshipRoutes');
app.use('/api/internships', internshipRoutes);
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);

// API test sức khỏe hệ thống
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS currentTime');
        res.json({ 
            status: "OK", 
            message: "Hệ thống EAUT SITS hoạt động tốt!",
            dbTime: rows[0].currentTime 
        });
    } catch (error) {
        res.status(500).json({ status: "ERROR", message: "Lỗi Database" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 [Server] Đang chạy tại: http://localhost:${PORT}`);
});