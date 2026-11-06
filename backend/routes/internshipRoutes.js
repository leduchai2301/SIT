const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');

// Cấu hình Multer để lưu file Excel tạm vào RAM (không sinh ra file rác trên ổ cứng)
const uploadExcel = multer({ storage: multer.memoryStorage() });

// Route Import Excel (Phải có file đính kèm, dành cho ADVISOR/ADMIN)
router.post('/import', verifyToken, checkRole(['ADVISOR', 'ADMIN']), uploadExcel.single('file'), internshipController.importExcel);

// Route duyệt đơn: Phải có Token và phải là ADVISOR hoặc ADMIN
router.patch('/:internshipId/status', verifyToken, checkRole(['ADVISOR', 'ADMIN']), internshipController.approveInternship);

// Route lấy danh sách: Controller sẽ tự lọc dữ liệu theo Role
router.get('/', verifyToken, internshipController.getInternships);

// Route doanh nghiệp chấm điểm (Đã sửa COMPANY thành MENTOR cho khớp DB)
router.put('/evaluate/:id', verifyToken, checkRole(['MENTOR']), internshipController.evaluateInternship);

// Route Khai báo hồ sơ từ Sinh viên 
router.post('/register', verifyToken, checkRole(['STUDENT']), internshipController.registerInternship);

// Route Giảng viên chốt điểm
router.put('/finalize/:id', verifyToken, checkRole(['ADVISOR', 'ADMIN']), internshipController.finalizeInternship);

// XUẤT ROUTER (Bắt buộc nằm cuối cùng)
module.exports = router;