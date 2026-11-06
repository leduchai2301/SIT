import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function CompanyDashboard() {
    const navigate = useNavigate();
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal Đánh giá
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [score, setScore] = useState('');
    const [evaluation, setEvaluation] = useState('');

    useEffect(() => { fetchInterns(); }, []);

    const fetchInterns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/internships', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setInterns(response.data.data || []);
        } catch (error) { 
            toast.error("Lỗi lấy danh sách thực tập sinh!"); 
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleOpenEvalModal = (intern) => {
        setSelectedIntern(intern);
        setScore(intern.company_score || '');
        setEvaluation(intern.company_evaluation || '');
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/internships/evaluate/${selectedIntern.id}`, {
                company_score: parseFloat(score),
                company_evaluation: evaluation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Đã gửi đánh giá thành công!");
            setSelectedIntern(null); // Đóng modal
            fetchInterns(); // Reload danh sách
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || 'Không thể gửi đánh giá'));
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f8faff] flex justify-center items-center font-bold text-[#1e48a3]">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] py-12 px-4 font-sans relative overflow-hidden flex flex-col items-center">
            {/* Họa tiết nền */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="text-center mb-6 z-10">
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Cổng Doanh Nghiệp & Mentor</h1>
                <p className="text-blue-200 mt-2">Quản lý và đánh giá năng lực thực tập sinh EAUT</p>
            </div>

            <div className="w-full max-w-6xl bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white mt-10 z-10">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                    <div className="bg-[#2355b9] p-3 rounded-2xl text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#1e48a3]">THỰC TẬP SINH ĐANG HƯỚNG DẪN</h2>
                    <button onClick={handleLogout} className="bg-[#ff5a36] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#d64728] transition-colors shadow-md">
                        Đăng xuất
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {interns.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl block mb-2">🏢</span>
                            <p className="text-gray-500 font-medium">Chưa có sinh viên nào đăng ký thực tập với email của bạn.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead className="bg-[#eef2fa]">
                                    <tr>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Mã HS</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Sinh viên</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Trạng thái</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3]">Điểm DN</th>
                                        <th className="py-4 px-6 font-bold text-[#1e48a3] text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {interns.map((hs) => (
                                        <tr key={hs.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="py-4 px-6 text-gray-600 font-semibold">#{hs.id}</td>
                                            <td className="py-4 px-6 text-gray-800 font-bold">Mã SV: {hs.student_id}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    hs.status === 'EVALUATING' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                    hs.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-[#1e48a3]' :
                                                    'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}>
                                                    {hs.status === 'EVALUATING' ? 'ĐÃ ĐÁNH GIÁ' : 
                                                     hs.status === 'IN_PROGRESS' ? 'ĐANG THỰC TẬP' : hs.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-[#ff7b1c]">
                                                {hs.company_score !== null ? `${hs.company_score} / 10` : '---'}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button 
                                                    onClick={() => handleOpenEvalModal(hs)}
                                                    className="bg-[#ff7b1c] text-white font-bold py-2 px-5 rounded-lg hover:bg-[#e06510] shadow-md transition-all text-sm"
                                                >
                                                    {hs.company_score !== null ? 'Sửa Đánh Giá' : '⭐ Đánh Giá'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL ĐÁNH GIÁ THỰC TẬP SINH */}
            {selectedIntern && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border-4 border-blue-50 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-[#1e48a3]">Đánh Giá Thực Tập Sinh (#{selectedIntern.id})</h3>
                            <button onClick={() => setSelectedIntern(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmitEvaluation} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Điểm đánh giá (Thang điểm 10):</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="10" 
                                    step="0.1" 
                                    required
                                    value={score} 
                                    onChange={(e) => setScore(e.target.value)}
                                    placeholder="VD: 8.5"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] outline-none font-bold text-lg text-[#ff7b1c]" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nhận xét chi tiết (Thái độ, Kỹ năng, Chuyên môn):</label>
                                <textarea 
                                    required 
                                    rows="4"
                                    value={evaluation} 
                                    onChange={(e) => setEvaluation(e.target.value)}
                                    placeholder="Sinh viên đi làm đúng giờ, chủ động học hỏi và hoàn thành tốt công việc..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1e48a3] outline-none text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedIntern(null)}
                                    className="w-1/2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-1/2 bg-[#1e48a3] text-white font-bold py-3 rounded-xl hover:bg-[#123073] shadow-md transition-colors"
                                >
                                    Lưu Đánh Giá
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyDashboard;