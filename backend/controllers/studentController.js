const db = require('../config/db');

// 1. API Lấy thông tin chi tiết của Sinh viên đang đăng nhập
exports.getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id; // Lấy ID từ token đã giải mã
        
        const [rows] = await db.query(
            `SELECT u.full_name, u.email, u.student_code, u.class_name, 
                    i.company_id, i.advisor_id, i.status 
             FROM users u 
             LEFT JOIN internships i ON u.id = i.student_id 
             WHERE u.id = ?`, 
            [studentId]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy Profile:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 2. API Cập nhật/Tạo mới Hồ sơ thực tập
exports.updateInternshipProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { companyId, advisorId } = req.body;

        if (!companyId || !advisorId) {
            return res.status(400).json({ message: "Vui lòng chọn Doanh nghiệp và Giảng viên!" });
        }

        // Kiểm tra xem sinh viên đã có bản ghi internship chưa
        const [existing] = await db.query('SELECT id FROM internships WHERE student_id = ?', [studentId]);

        if (existing.length > 0) {
            // Đã có -> Cập nhật
            await db.query(
                'UPDATE internships SET company_id = ?, advisor_id = ?, status = "PENDING" WHERE student_id = ?',
                [companyId, advisorId, studentId]
            );
        } else {
            // Chưa có -> Tạo mới
            await db.query(
                'INSERT INTO internships (student_id, company_id, advisor_id, status) VALUES (?, ?, ?, "PENDING")',
                [studentId, companyId, advisorId]
            );
        }

        res.status(200).json({ message: "Cập nhật hồ sơ thực tập thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật Internship:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. API Lấy danh sách Doanh nghiệp và Giảng viên (để đổ vào Dropdown chọn)
exports.getOptionsForStudent = async (req, res) => {
    try {
        const [companies] = await db.query('SELECT id, full_name as name FROM users WHERE role = "COMPANY"');
        const [advisors] = await db.query('SELECT id, full_name as name FROM users WHERE role = "ADVISOR"');
        
        res.status(200).json({ companies, advisors });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách Options" });
    }
};