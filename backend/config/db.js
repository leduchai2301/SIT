const mysql = require('mysql2');
require('dotenv').config();

// Tạo kết nối pool (giúp tối ưu hóa nhiều kết nối cùng lúc)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển pool sang dạng dùng Promises để code gọn và hiện đại hơn (async/await)
const promisePool = pool.promise();

// Test thử kết nối
promisePool.query('SELECT 1')
    .then(() => {
        console.log('✅ [Database] Đã kết nối thành công tới MySQL (eaut_sits_db)!');
    })
    .catch((err) => {
        console.error('❌ [Database] Lỗi kết nối:', err.message);
    });

module.exports = promisePool;