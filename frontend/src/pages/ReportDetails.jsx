import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function ReportDetails() {
    const { id } = useParams(); // Lấy ID của hồ sơ từ URL
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [id]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.data || []);
        } catch (error) {
            toast.error("Lỗi tải danh sách báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvaluation = async (reportId) => {
        const comment = document.getElementById(`comment-${reportId}`).value;
        try {
            const token = localStorage.getItem('token');
            // Gửi yêu cầu cập nhật Nhận xét lên Backend
            await axios.put(`http://localhost:5000/api/reports/grade/${reportId}`, {
                advisor_comment: comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã lưu nhận xét thành công!");
            fetchReports(); // Tải lại dữ liệu mới
        } catch (error) {
            toast.error("Lỗi khi lưu đánh giá.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] flex justify-center items-center text-white font-bold">
            Đang tải dữ liệu...
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] py-12 px-4 font-sans relative overflow-hidden flex flex-col items-center">
            {/* Họa tiết nền */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="w-full max-w-4xl bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white mt-5 z-10">
                
                {/* Back button */}
                <button 
                    onClick={() => navigate('/advisor-dashboard')} 
                    className="text-gray-500 hover:text-[#1e48a3] flex items-center gap-2 font-bold text-sm mb-6 transition-all"
                >
                    ← Quay lại Dashboard
                </button>

                <h2 className="text-2xl font-bold text-[#1e48a3] uppercase border-b border-gray-200 pb-4 mb-6">
                    📋 Chi tiết báo cáo (Hồ sơ #{id})
                </h2>

                <div className="space-y-6">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <span className="text-4xl block mb-2">📭</span>
                            <p className="text-gray-500 font-medium">Sinh viên chưa nộp báo cáo nào cho đợt này.</p>
                        </div>
                    ) : (
                        reports.map((report, idx) => (
                            <div key={report.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <h3 className="font-bold text-lg text-[#1e48a3]">Tuần {report.week_number}</h3>
                                    <span className="text-xs text-gray-400 font-semibold">
                                        🕒 {new Date(report.submitted_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">Nội dung SV viết:</p>
                                    <div className="p-3 bg-[#f8faff] border border-gray-100 rounded-xl text-gray-700 text-sm whitespace-pre-line font-medium">
                                        {report.content}
                                    </div>
                                </div>

                                {/* PHẦN HIỂN THỊ FILE ĐÃ ĐƯỢC THÊM VÀO */}
                                {report.file_path ? (
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📄</span>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400">FILE BÁO CÁO ĐÍNH KÈM</p>
                                                <p className="text-sm font-bold text-[#1e48a3] break-all">
                                                    {report.file_path.split('/').pop()}
                                                </p>
                                            </div>
                                        </div>
                                        <a 
                                            href={`http://localhost:5000${report.file_path}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="bg-[#1e48a3] hover:bg-[#123073] text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors text-center inline-block"
                                        >
                                            📥 Tải File Xuống
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 font-semibold">⚠️ Tuần này sinh viên không đính kèm file.</p>
                                )}

                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-bold text-[#ff7b1c] mb-1">
                                            Nhận xét của giảng viên:
                                        </label>
                                        <textarea 
                                            id={`comment-${report.id}`}
                                            defaultValue={report.advisor_comment || ''}
                                            placeholder="Nhập nhận xét, đánh giá của bạn..."
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7b1c] focus:ring-1 focus:ring-[#ff7b1c] text-sm resize-none h-20"
                                        ></textarea>
                                    </div>

                                    <button 
                                        onClick={() => handleSaveEvaluation(report.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md transform active:scale-95 text-sm"
                                    >
                                        Lưu đánh giá
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportDetails;