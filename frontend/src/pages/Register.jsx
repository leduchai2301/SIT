import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'STUDENT' // Mặc định là Sinh viên
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // --- 1. RÀO CHẮN FRONTEND (Kiểm tra nghiêm ngặt trước khi gửi) ---
        
        // Kiểm tra Email phải đúng chuẩn quốc tế (có @, có dấu chấm, có đuôi .com/.vn...)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.warning("Vui lòng nhập đúng định dạng email (VD: anV@eaut.edu.vn)");
            return;
        }

        // Kiểm tra riêng email trường (Chỉ áp dụng nếu là Sinh viên/Giảng viên)
        if (formData.role !== 'MENTOR' && !formData.email.endsWith('@eaut.edu.vn')) {
            toast.warning("Sinh viên và Giảng viên bắt buộc phải dùng email đuôi @eaut.edu.vn");
            return;
        }

        // Ép mật khẩu phải từ 6 ký tự trở lên (bắt lỗi kể cả khi HTML5 lọt lưới)
        if (formData.password.length < 6) {
            toast.warning("Mật khẩu phải có ít nhất 6 ký tự để đảm bảo an toàn!");
            return;
        }

        // Ép tên không được chứa toàn số hoặc ký tự đặc biệt
        if (formData.full_name.trim().length < 2) {
            toast.warning("Vui lòng nhập đầy đủ Họ và Tên!");
            return;
        }

        // --- 2. GỬI LÊN BACKEND KHI ĐÃ SẠCH ---
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            toast.success(response.data.message);
            navigate('/login'); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi đăng ký tài khoản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] flex justify-center items-center p-4 relative overflow-hidden">
            {/* Họa tiết nền */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10 border-4 border-blue-50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1e48a3] mb-2">ĐĂNG KÝ SITS</h1>
                    <p className="text-gray-500 text-sm">Hệ thống quản lý thực tập EAUT</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên</label>
                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="VD: Nguyễn Văn A"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="VD: anV@eaut.edu.vn"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                        <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Bạn là ai?</label>
                        <select name="role" value={formData.role} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] outline-none font-medium text-gray-700 bg-white cursor-pointer">
                            <option value="STUDENT">🎓 Sinh viên EAUT</option>
                            <option value="ADVISOR">👨‍🏫 Giảng viên hướng dẫn</option>                    
                        </select>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-[#ff5a36] hover:bg-[#e04522] text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-md flex justify-center items-center">
                        {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
                    </button>
                </form>

                    <p className="text-center mt-6 text-sm text-gray-600 font-medium">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-[#1e48a3] hover:underline font-bold">Đăng nhập ngay</Link>
                    </p>
            </div>
        </div>
    );
}

export default Register;