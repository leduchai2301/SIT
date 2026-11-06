const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');

// 1. API Đăng nhập (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash).catch(() => false);
        const isOldPassword = password === user.password_hash; 

        if (!isMatch && !isOldPassword) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({ 
            message: "Đăng nhập thành công!", 
            token: token, 
            user: { 
                id: user.id, 
                full_name: user.full_name, 
                role: user.role,
                is_first_login: user.is_first_login // Trả về để Frontend biết đường bắt đổi mật khẩu
            },
            role: user.role,
            name: user.full_name
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 2. API Đăng ký tài khoản mới (Register)
exports.register = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        if (!full_name || !email || !password) return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Định dạng email không hợp lệ!" });

        if (password.length < 6) return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
        
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) return res.status(400).json({ message: "Email này đã được sử dụng!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const validRoles = ['STUDENT', 'ADVISOR', 'MENTOR'];
        const userRole = validRoles.includes(role) ? role : 'STUDENT';

        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash, role, is_first_login) VALUES (?, ?, ?, ?, 0)',
            [full_name, email, hashedPassword, userRole]
        );

        res.status(201).json({ message: "Đăng ký thành công!", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 3. API Import Sinh Viên
exports.importStudentsAccount = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); 

        let createdAccounts = [];
        let failedAccounts = []; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const row of data) {
            const FullName = row.FullName || row.__EMPTY;
            const StudentCode = row.StudentCode || row.__EMPTY_1;
            const Class = row.Class || row.__EMPTY_2;
            const Email = row.Email || row.__EMPTY_3;

            if (FullName === 'FullName') continue;

            if (!FullName || !StudentCode || !Email) {
                failedAccounts.push({ name: FullName || 'N/A', email: Email || 'N/A', reason: 'Thiếu thông tin (Cột rỗng)' });
                continue; 
            }

            if (!emailRegex.test(Email)) {
                failedAccounts.push({ name: FullName, email: Email, reason: 'Sai định dạng Email' });
                continue;
            }

            const [existing] = await db.query('SELECT email, student_code FROM users WHERE email = ? OR student_code = ?', [Email, StudentCode]);

            if (existing.length === 0) {
                const rawPassword = StudentCode.toString(); 
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(rawPassword, salt);

                await db.query(
                    'INSERT INTO users (email, password_hash, full_name, role, student_code, class_name, is_first_login) VALUES (?, ?, ?, "STUDENT", ?, ?, 1)',
                    [Email, hashedPassword, FullName, StudentCode, Class || null]
                );

                createdAccounts.push({ name: FullName, email: Email, password: rawPassword });
            } else {
                const reason = existing[0].email === Email ? 'Email đã tồn tại' : 'Mã SV đã tồn tại';
                failedAccounts.push({ name: FullName, email: Email, reason: reason });
            }
        }

        res.status(200).json({
            message: "Xử lý file Excel hoàn tất!",
            createdCount: createdAccounts.length,
            errorCount: failedAccounts.length,
            accounts: createdAccounts,
            failedAccounts: failedAccounts
        });
    } catch (error) {
        console.error("Lỗi Import:", error);
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// 4. API Import Doanh Nghiệp
exports.importCompaniesAccount = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); 

        let createdAccounts = [];
        let failedAccounts = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const row of data) {
            const CompanyName = row.CompanyName || row.__EMPTY;
            const TaxCode = row.TaxCode || row.__EMPTY_1;
            const Email = row.Email || row.__EMPTY_2;

            if (CompanyName === 'CompanyName') continue;

            if (!CompanyName || !TaxCode || !Email) {
                failedAccounts.push({ name: CompanyName || 'N/A', email: Email || 'N/A', reason: 'Thiếu thông tin (Cột rỗng)' });
                continue; 
            }

            if (!emailRegex.test(Email)) {
                failedAccounts.push({ name: CompanyName, email: Email, reason: 'Sai định dạng Email' });
                continue;
            }

            const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [Email]);

            if (existing.length === 0) {
                const rawPassword = TaxCode.toString(); 
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(rawPassword, salt);

                await db.query(
                    'INSERT INTO users (email, password_hash, full_name, role, is_first_login) VALUES (?, ?, ?, "COMPANY", 1)',
                    [Email, hashedPassword, CompanyName]
                );

                createdAccounts.push({ name: CompanyName, email: Email, password: rawPassword });
            } else {
                failedAccounts.push({ name: CompanyName, email: Email, reason: 'Email công ty đã tồn tại' });
            }
        }

        res.status(200).json({
            message: "Xử lý file Excel hoàn tất!",
            createdCount: createdAccounts.length,
            errorCount: failedAccounts.length,
            accounts: createdAccounts,
            failedAccounts: failedAccounts
        });
    } catch (error) {
        console.error("Lỗi Import DN:", error);
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// 5. API Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Không tìm thấy token xác thực!" });
        }
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const userId = decoded.id;

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, is_first_login = 0 WHERE id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!" });
        }
        res.status(500).json({ message: "Lỗi hệ thống khi đổi mật khẩu." });
    }
};

// 6. API LẤY DANH SÁCH DOANH NGHIỆP (MỚI ĐƯỢC THÊM)
exports.getCompaniesList = async (req, res) => {
    try {
        const [companies] = await db.query('SELECT id, full_name, email FROM users WHERE role = "COMPANY"');
        res.status(200).json(companies);
    } catch (error) {
        console.error("Lỗi lấy danh sách công ty:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};