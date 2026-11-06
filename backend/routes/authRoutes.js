const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../config/db'); 
const jwt = require('jsonwebtoken');

// --- CÁC THƯ VIỆN THÊM VÀO ĐỂ XỬ LÝ FILE EXCEL VÀ BẢO MẬT ---
const multer = require('multer');
const uploadExcel = multer({ storage: multer.memoryStorage() });
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// --- CÁC ROUTE CƠ BẢN ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- ROUTE MỚI: TẠO TÀI KHOẢN SINH VIÊN BẰNG EXCEL (CHỈ ADMIN) ---
router.post('/import-students', verifyToken, checkRole(['ADMIN']), uploadExcel.single('file'), authController.importStudentsAccount);
// Route import Doanh nghiệp
router.post('/import-companies', uploadExcel.single('file'), authController.importCompaniesAccount);
// Route Đổi mật khẩu
router.post('/change-password', authController.changePassword);

// --- ROUTE GIẢ LẬP ĐĂNG NHẬP GOOGLE (Đã fix lỗi dư chữ S) ---
router.post('/google-mock', async (req, res) => {
  const { email } = req.body;
  try {
    // Tự động nhận diện kiểu kết nối MySQL (Promise hay Callback)
    const queryDb = db.promise ? db.promise() : db;

    // 1. Tìm user theo email
    const [users] = await queryDb.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (!users || users.length === 0) {
      // Xác định Role và Tên theo chuẩn Database của em
      let role = 'STUDENT';
      let fullName = 'Sinh viên Test';

      if (email.includes('giangvien')) { 
        role = 'ADVISOR'; 
        fullName = 'Giảng viên Test'; 
      }
      if (email.includes('congty')) { 
        role = 'COMPANY'; // <-- Đã đổi thành COMPANY cho khớp với DB
        fullName = 'Doanh nghiệp Test'; 
      }

      // Đã sửa lại tên cột thành password_hash và full_name
      const [result] = await queryDb.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [email, 'GOOGLE_AUTH_NOPASSWORD', fullName, role]
      );

      user = { id: result.insertId, email, role, full_name: fullName };
    } else {
      user = users[0];
    }

    // 3. Tạo JWT Token
    const secretKey = process.env.JWT_SECRET || 'secret_key';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Đăng nhập Google thành công!',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("❌ Lỗi Google Mock Server Error:", error);
    return res.status(500).json({ 
      message: 'Lỗi máy chủ: ' + error.message 
    });
  }
});

module.exports = router;