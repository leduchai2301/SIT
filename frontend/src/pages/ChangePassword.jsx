import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userName = localStorage.getItem('name') || 'Bạn';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!');
        if (newPassword !== confirmPassword) return toast.error('Mật khẩu nhập lại không khớp!');

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Gọi API đổi mật khẩu (Backend em sẽ cần viết hàm này sau)
            await axios.post('http://localhost:5000/api/auth/change-password', 
                { newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-[#ff7b1c]">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800">Cập nhật mật khẩu</h2>
                    <p className="text-sm text-gray-500 mt-2">Xin chào <strong>{userName}</strong>! Đây là lần đăng nhập đầu tiên, vui lòng đổi mật khẩu để bảo vệ tài khoản.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            required 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3]"
                            placeholder="Nhập mật khẩu mới"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3]"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#1e48a3] text-white font-bold py-3 rounded-xl hover:bg-[#123073] transition-colors">
                        {loading ? 'Đang cập nhật...' : 'Xác nhận & Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;