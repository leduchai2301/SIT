const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Route nộp báo cáo: Dùng upload.single('file') để bắt file đính kèm
router.post('/submit', verifyToken, checkRole(['STUDENT']), upload.single('file'), reportController.submitReport);
// Route xem báo cáo: Bất kỳ ai có liên quan đến hồ sơ đều xem được
router.get('/:internshipId', verifyToken, reportController.getReportsByInternship);
// Route chấm điểm báo cáo (Dùng PUT vì đây là hành động Cập nhật dữ liệu)
router.put('/grade/:reportId', verifyToken, checkRole(['ADVISOR', 'ADMIN']), reportController.gradeReport);
module.exports = router;
