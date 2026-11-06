import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function AdvisorDashboard() {
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchInternships(); }, []);

    const fetchInternships = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/internships', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setInternships(response.data.data);
        } catch (error) { 
            toast.error("Lỗi lấy dữ liệu hồ sơ!"); 
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Hàm MỚI: Xử lý Duyệt hoặc Từ chối hồ sơ
    const handleApprove = async (internshipId, action) => {
        // Nếu là từ chối, bật hộp thoại nhỏ yêu cầu nhập lý do
        let note = 'Giảng viên duyệt đơn';
        if (action === 'REJECT') {
            note = window.prompt("Vui lòng nhập lý do từ chối hồ sơ này:");
            if (note === null || note.trim() === "") {
                toast.warning("Bạn phải nhập lý do khi từ chối!");
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            // Gọi API duyệt đơn mà em đã code trong internshipController
            await axios.patch(`http://localhost:5000/api/internships/${internshipId}/status`, {
                action: action,
                note: note
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            toast.success(action === 'APPROVE' ? "Đã duyệt hồ sơ thành công!" : "Đã từ chối hồ sơ.");
            
            // Lấy lại danh sách mới để cập nhật giao diện
            fetchInternships();
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || 'Không thể xử lý yêu cầu'));
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f8faff] flex justify-center items-center font-bold text-[#1e48a3]">Đang tải danh sách...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] py-12 px-4 font-sans relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="text-center mb-6 z-10">
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Không gian Giảng Viên</h1>
                <p className="text-blue-200 mt-2">Quản lý và phê duyệt hồ sơ thực tập</p>
            </div>

            <div className="w-full max-w-6xl bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white mt-10 z-10">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                    <div className="bg-[#ff7b1c] p-3 rounded-2xl text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#1e48a3]">DANH SÁCH SINH VIÊN</h2>
                    <button onClick={handleLogout} className="bg-[#ff5a36] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#d64728] transition-colors shadow-md">Đăng xuất</button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {internships.length === 0 ? (
                        <div className="text-center py-12"><p className="text-gray-500 font-medium">Chưa có hồ sơ nào được phân công hoặc cần duyệt.</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead className="bg-[#eef2fa]">
                                    <tr>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Mã HS</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Mã Sinh viên</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Công ty thực tập</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Trạng thái</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3] text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {internships.map((hs) => (
                                        <tr key={hs.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="py-4 px-6 text-gray-600 font-semibold">#{hs.id}</td>
                                            <td className="py-4 px-6 text-gray-800 font-bold">SV_{hs.student_id}</td>
                                            <td className="py-4 px-6 text-gray-700">
                                                <div className="font-semibold">{hs.company_name || 'Chưa khai báo'}</div>
                                                <div className="text-xs text-gray-500">{hs.mentor_email || ''}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    hs.status === 'PENDING' ? 'bg-orange-50 border-orange-200 text-[#ff7b1c]' : 
                                                    hs.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-[#1e48a3]' :
                                                    hs.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-600' :
                                                    'bg-green-50 border-green-200 text-green-700'
                                                }`}>
                                                    {hs.status === 'PENDING' ? 'CHỜ DUYỆT' : 
                                                     hs.status === 'IN_PROGRESS' ? 'ĐANG THỰC TẬP' : hs.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {/* Xử lý Logic Hiển thị Nút bấm */}
                                                {hs.status === 'PENDING' ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(hs.id, 'APPROVE')} 
                                                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 shadow-sm text-sm"
                                                        >
                                                            ✓ Duyệt
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApprove(hs.id, 'REJECT')} 
                                                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 shadow-sm text-sm"
                                                        >
                                                            ✕ Từ chối
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => navigate(`/advisor/reports/${hs.id}`)} 
                                                        className="bg-[#2355b9] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#1a4090] shadow-sm text-sm"
                                                    >
                                                        Xem báo cáo
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdvisorDashboard;