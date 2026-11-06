const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Lưu vào thư mục uploads
    },
    filename: function (req, file, cb) {
        // Đổi tên file để không bị trùng (Thêm thời gian hiện tại vào trước tên gốc)
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });
module.exports = upload;