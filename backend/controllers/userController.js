const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Đảm bảo đường dẫn file db chuẩn

exports.importStudentsAccount = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        let createdAccounts = [];
        let errorCount = 0;

        for (const row of data) {
            // Cột Excel yêu cầu: FullName, StudentCode, Class, Email
            const { FullName, StudentCode, Class, Email } = row;
            if (!FullName || !StudentCode || !Email) {
                errorCount++; continue;
            }

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [Email]);

            if (existing.length === 0) {
                // Đặt mật khẩu mặc định là Mã Sinh Viên (Hoặc em có thể dùng Math.random() nếu thích pass ngẫu nhiên)
                const rawPassword = StudentCode.toString(); 
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(rawPassword, salt);

                await db.query(
                    'INSERT INTO users (email, password_hash, full_name, role, student_code, class_name) VALUES (?, ?, ?, "STUDENT", ?, ?)',
                    [Email, hashedPassword, FullName, StudentCode, Class || null]
                );

                // Đẩy vào mảng để trả về cho Admin hiển thị
                createdAccounts.push({
                    name: FullName,
                    email: Email,
                    password: rawPassword
                });
            } else {
                errorCount++; // Bỏ qua nếu email đã tồn tại
            }
        }

        res.status(200).json({
            message: "Tạo tài khoản thành công!",
            createdCount: createdAccounts.length,
            errors: errorCount,
            accounts: createdAccounts // Trả danh sách mật khẩu về Frontend
        });
    } catch (error) {
        console.error("Lỗi Import SV:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tạo tài khoản." });
    }
};