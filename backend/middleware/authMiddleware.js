const jwt = require('jsonwebtoken');

// 1. Kiểm tra xem user có cầm Token không?
exports.verifyToken = (req, res, next) => {
    // Lấy token từ header
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Từ chối truy cập! Không có thẻ Token." });

    try {
        // Cắt bỏ chữ "Bearer " ở đầu token nếu có
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }
        
        // Giải mã Token bằng chữ ký bí mật
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Nhét thông tin user vào request để các hàm sau dùng
        next(); // Cho phép đi tiếp
    } catch (error) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

// 2. Phân quyền: Kiểm tra Role (Ví dụ: Chỉ cho STUDENT vào)
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Lỗi phân quyền! Bạn không được phép làm việc này." });
        }
        next();
    }
};