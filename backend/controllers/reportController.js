const db = require('../config/db');

// Sinh viên nộp báo cáo tuần
exports.submitReport = async (req, res) => {
    try {
        const { internship_id, week_number, content } = req.body;
        
        // Nếu có file đính kèm thì lấy đường dẫn, không thì để null
        // Sửa lại cho khớp với Frontend (đang gọi là req.file)
        const file_path = req.file ? '/uploads/' + req.file.filename : null;

        // 1. Kiểm tra xem hồ sơ có đang ở trạng thái IN_PROGRESS không
        const [internships] = await db.query('SELECT status FROM internships WHERE id = ?', [internship_id]);
        if (internships.length === 0) return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
        
        if (internships[0].status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: "Hồ sơ chưa được duyệt hoặc đã kết thúc, không thể nộp báo cáo!" });
        }

        // 2. Ghi báo cáo vào Database
        // CHÚ Ý: Đổi 'weekly_reports' thành 'reports', 'attachment_url' thành 'file_path'
        const [result] = await db.query(
            'INSERT INTO reports (internship_id, week_number, content, file_path) VALUES (?, ?, ?, ?)',
            [internship_id, week_number, content, file_path]
        );

        res.status(201).json({ 
            message: `Đã nộp báo cáo tuần ${week_number} thành công!`, 
            reportId: result.insertId,
            file: file_path 
        });
    } catch (error) {
        console.error("Lỗi submitReport:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Lấy danh sách báo cáo theo ID hồ sơ
exports.getReportsByInternship = async (req, res) => {
    try {
        const { internshipId } = req.params;

        // CHÚ Ý: Đổi 'weekly_reports' thành 'reports'
        const [reports] = await db.query(
            'SELECT * FROM reports WHERE internship_id = ? ORDER BY week_number ASC',
            [internshipId]
        );

        res.json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Giảng viên chấm điểm báo cáo
exports.gradeReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { advisor_comment } = req.body; 

        // CHÚ Ý: Bảng reports hiện tại CHƯA có cột 'advisor_score'
        // Nên tạm thời chú chỉ cập nhật cột 'advisor_comment' thôi nhé!
        await db.query(
            'UPDATE reports SET advisor_comment = ? WHERE id = ?',
            [advisor_comment, reportId]
        );

        res.json({ message: "Đã lưu nhận xét thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};