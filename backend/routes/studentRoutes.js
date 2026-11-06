const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middlewares/authMiddleware'); // Cần có middleware để check Token

// Tất cả API của sinh viên đều phải check Token và check Role = STUDENT
router.get('/profile', verifyToken, isStudent, studentController.getStudentProfile);
router.post('/internship', verifyToken, isStudent, studentController.updateInternshipProfile);
router.get('/options', verifyToken, isStudent, studentController.getOptionsForStudent);

module.exports = router;