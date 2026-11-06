const db = require('../config/db');
const xlsx = require('xlsx');

// Tính năng Khởi tạo hồ sơ thực tập (Dành cho Sinh viên)
exports.registerInternship = async (req, res) => {
    try {
        const studentId = req.user.id; // Lấy ID sinh viên từ Token đã giải mã
        const { company_name, mentor_email } = req.body;

        // Tạm thời fix cứng term_id = 1 (vì chưa có giao diện Admin tạo Kỳ thực tập)
        const term_id = 1; 

        // 1. Ghi hồ sơ vào bảng internships với trạng thái PENDING
        const [result] = await db.query(
            'INSERT INTO internships (student_id, term_id, company_name, mentor_email, status) VALUES (?, ?, ?, ?, ?)',
            [studentId, term_id, company_name, mentor_email, 'PENDING']
        );
        const internshipId = result.insertId;

        // 2. GHI LOG WORKFLOW (Thầy cô chấm điểm A ở chính đoạn này)
        await db.query(
            'INSERT INTO workflow_logs (internship_id, changed_by_user_id, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)',
            [internshipId, studentId, 'DRAFT', 'PENDING', 'Sinh viên nộp đơn thực tập lần đầu']
        );

        res.status(201).json({ 
            message: "Nộp đơn thành công! Trạng thái: PENDING (Chờ duyệt).", 
            internshipId: internshipId 
        });
    } catch (error) {
        console.error("Lỗi registerInternship:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Tính năng duyệt đơn (Dành cho Giáo vụ hoặc Giảng viên)
exports.approveInternship = async (req, res) => {
    try {
        const advisorId = req.user.id; // Lấy ID người duyệt từ Token
        const { internshipId } = req.params; // Lấy ID của hồ sơ từ đường dẫn URL
        const { action, note } = req.body; // action có thể là 'APPROVE' hoặc 'REJECT'

        // 1. Kiểm tra xem hồ sơ có tồn tại và đang ở trạng thái PENDING không
        const [internships] = await db.query('SELECT * FROM internships WHERE id = ?', [internshipId]);
        if (internships.length === 0) return res.status(404).json({ message: "Không tìm thấy hồ sơ thực tập này." });
        
        const internship = internships[0];
        if (internship.status !== 'PENDING') {
            return res.status(400).json({ message: "Chỉ có thể duyệt hồ sơ đang ở trạng thái PENDING." });
        }

        let newStatus = '';
        let successMessage = '';

        if (action === 'APPROVE') {
            newStatus = 'IN_PROGRESS';
            successMessage = "Đã DUYỆT hồ sơ thành công!";
        } else if (action === 'REJECT') {
            newStatus = 'REJECTED';
            successMessage = "Đã TỪ CHỐI hồ sơ.";
            if (!note) return res.status(400).json({ message: "Phải nhập lý do từ chối (note)." });
        } else {
            return res.status(400).json({ message: "Hành động (action) không hợp lệ. Chỉ nhận 'APPROVE' hoặc 'REJECT'." });
        }

        // 2. Cập nhật trạng thái mới vào bảng internships
        await db.query('UPDATE internships SET status = ?, advisor_id = ? WHERE id = ?', [newStatus, advisorId, internshipId]);

        // 3. GHI LOG WORKFLOW (Bắt buộc)
        await db.query(
            'INSERT INTO workflow_logs (internship_id, changed_by_user_id, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)',
            [internshipId, advisorId, internship.status, newStatus, note || 'Giảng viên duyệt đơn']
        );

        res.json({ message: successMessage, newStatus: newStatus });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Lấy danh sách hồ sơ thực tập
// Lấy danh sách hồ sơ thực tập
// Lấy danh sách hồ sơ thực tập
// Lấy danh sách hồ sơ thực tập
exports.getInternships = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        // ĐÃ SỬA: Đổi u.name thành u.full_name cho khớp chuẩn với Database của em
        let query = `
            SELECT i.*, u.full_name as student_name, u.email as student_email 
            FROM internships i
            JOIN users u ON i.student_id = u.id
        `;
        let params = [];

        // Nếu là Sinh viên: Chỉ xem hồ sơ của chính mình
        if (role === 'STUDENT') {
            query += ` WHERE i.student_id = ? ORDER BY i.created_at DESC`;
            params.push(userId);
        } 
        // Nếu là Giảng viên: Xem các hồ sơ đang chờ duyệt (PENDING) hoặc hồ sơ mình đã duyệt
        else if (role === 'ADVISOR') {
            query += ` WHERE i.status = 'PENDING' OR i.advisor_id = ? ORDER BY FIELD(i.status, 'PENDING', 'IN_PROGRESS', 'EVALUATING', 'COMPLETED'), i.created_at DESC`;
            params.push(userId);
        } 
        // Nếu là Doanh nghiệp (MENTOR): Xem các hồ sơ có email trùng với email của Doanh nghiệp
        else if (role === 'MENTOR') {
            const [users] = await db.query(`SELECT email FROM users WHERE id = ?`, [userId]);
            const mentorEmail = users[0].email;
            
            query += ` WHERE i.mentor_email = ? ORDER BY i.created_at DESC`;
            params.push(mentorEmail);
        } 
        // Nếu là Admin: Xem tất cả
        else if (role === 'ADMIN') {
            query += ` ORDER BY FIELD(i.status, 'PENDING', 'IN_PROGRESS', 'EVALUATING', 'COMPLETED'), i.created_at DESC`;
        }

        const [internships] = await db.query(query, params);
        res.json({ data: internships });
    } catch (error) {
        console.error("Lỗi getInternships:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Doanh nghiệp đánh giá sinh viên
// Doanh nghiệp đánh giá sinh viên
exports.evaluateInternship = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { id } = req.params;
        const { company_score, company_evaluation } = req.body;

        if (!company_score || !company_evaluation) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ điểm số và nhận xét!" });
        }

        // 1. Lấy trạng thái cũ của hồ sơ
        const [internships] = await db.query('SELECT status FROM internships WHERE id = ?', [id]);
        if (internships.length === 0) return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
        const oldStatus = internships[0].status;

        // 2. Cập nhật điểm, nhận xét và đổi trạng thái sang EVALUATING
        await db.query(
            'UPDATE internships SET company_score = ?, company_evaluation = ?, status = "EVALUATING" WHERE id = ?',
            [company_score, company_evaluation, id]
        );

        // 3. Ghi log workflow
        await db.query(
            'INSERT INTO workflow_logs (internship_id, changed_by_user_id, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)',
            [id, mentorId, oldStatus, 'EVALUATING', `Doanh nghiệp đánh giá: ${company_score}/10 điểm`]
        );

        res.json({ message: "Đã lưu đánh giá thực tập sinh thành công!" });
    } catch (error) {
        console.error("Lỗi evaluateInternship:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
// Giảng viên chốt điểm và kết thúc thực tập
exports.finalizeInternship = async (req, res) => {
    try {
        const advisorId = req.user.id;
        const { id } = req.params;
        const { final_score } = req.body;

        if (!final_score) {
            return res.status(400).json({ message: "Vui lòng nhập điểm tổng kết!" });
        }

        // Cập nhật điểm và đổi trạng thái sang COMPLETED
        await db.query(
            'UPDATE internships SET final_score = ?, status = "COMPLETED" WHERE id = ?',
            [final_score, id]
        );

        // Ghi log workflow
        await db.query(
            'INSERT INTO workflow_logs (internship_id, changed_by_user_id, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)',
            [id, advisorId, 'EVALUATING', 'COMPLETED', `Giảng viên chốt điểm tổng kết: ${final_score}`]
        );

        res.json({ message: "Đã chốt điểm và kết thúc kỳ thực tập thành công!" });
    } catch (error) {
        console.error("Lỗi finalizeInternship:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
exports.importExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });

        // Đọc dữ liệu từ file Excel tải lên
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); 

        let successCount = 0;
        let errorCount = 0;

        // Lặp qua từng dòng để lưu vào Database
        for (const row of data) {
            const { StudentEmail, CompanyName, MentorEmail } = row;
            
            // Nếu dòng bị trống Email Sinh viên hoặc Tên công ty thì bỏ qua
            if (!StudentEmail || !CompanyName) {
                errorCount++;
                continue; 
            }

            // Tìm ID sinh viên dựa vào email
            const [students] = await db.query('SELECT id FROM users WHERE email = ? AND role = "STUDENT"', [StudentEmail]);
            
            if (students.length > 0) {
                const studentId = students[0].id;
                
                // Kiểm tra xem sinh viên này đã có hồ sơ chưa để tránh trùng lặp
                const [existing] = await db.query('SELECT id FROM internships WHERE student_id = ?', [studentId]);
                
                if (existing.length === 0) {
                    // Gán thẳng status = 'IN_PROGRESS' (Vì danh sách này đã được khoa duyệt sẵn)
                    await db.query(
                        'INSERT INTO internships (student_id, company_name, mentor_email, status) VALUES (?, ?, ?, "IN_PROGRESS")',
                        [studentId, CompanyName, MentorEmail || null]
                    );
                    successCount++;
                } else {
                    errorCount++; // Đã có hồ sơ rồi thì không tạo thêm
                }
            } else {
                errorCount++; // Sinh viên không tồn tại trong hệ thống
            }
        }

        res.status(200).json({ 
            message: "Import hoàn tất!", 
            success: successCount, 
            errors: errorCount 
        });

    } catch (error) {
        console.error("Lỗi Import:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi xử lý file Excel." });
    }
};