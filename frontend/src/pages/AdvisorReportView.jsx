import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function AdvisorReportView() {
    const { id } = useParams(); // Lấy ID của hồ sơ thực tập từ URL
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
            setReports(response.data.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveComment = async (reportId, commentValue) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/reports/grade/${reportId}`, {
                advisor_comment: commentValue
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã lưu nhận xét thành công!");
            fetchReports(); // Tải lại để cập nhật giao diện
        } catch (error) {
            toast.error("Lỗi khi lưu nhận xét.");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f8faff] flex justify-center items-center font-bold text-[#1e48a3]">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] py-10 px-4 font-sans flex flex-col items-center">
            <div className="w-full max-w-5xl bg-[#f8faff] rounded-3xl p-8 shadow-2xl relative border-4 border-white mt-5">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <div>
                        <button onClick={() => navigate('/advisor')} className="text-gray-500 hover:text-[#1e48a3] flex items-center gap-1 font-bold text-sm mb-2 transition-colors">
                            ← Quay lại danh sách
                        </button>
                        <h2 className="text-2xl font-bold text-[#1e48a3] uppercase">Chi tiết Báo cáo Sinh viên</h2>
                    </div>
                </div>

                {/* Danh sách Báo cáo */}
                <div className="space-y-6">
                    {reports.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-4xl block mb-2">📭</span>
                            <p className="text-gray-500 font-medium">Sinh viên này chưa nộp báo cáo nào.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                {/* Cột nội dung sinh viên nộp */}
                                <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100 bg-[#fbfdff]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-[#1e48a3]">Báo cáo Tuần {report.week_number}</h3>
                                        <span className="text-xs text-gray-400 font-medium">{new Date(report.submitted_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm font-bold text-gray-600 mb-1">Nội dung công việc:</p>
                                        <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm whitespace-pre-line">
                                            {report.content}
                                        </div>
                                    </div>
                                    {report.file_path && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-600 mb-1">File đính kèm:</p>
                                            <a href={`http://localhost:5000${report.file_path}`} target="_blank" rel="noreferrer" 
                                               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors">
                                                📄 Tải file báo cáo xuống
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Cột Nhận xét của Giảng viên */}
                                <div className="p-6 w-full md:w-1/3 bg-white flex flex-col">
                                    <p className="text-sm font-bold text-[#ff7b1c] mb-2">Nhận xét của bạn:</p>
                                    <textarea 
                                        id={`comment-${report.id}`}
                                        defaultValue={report.advisor_comment || ''}
                                        placeholder="Nhập đánh giá của giảng viên cho tuần này..."
                                        className="w-full flex-1 min-h-[100px] p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7b1c] focus:ring-1 focus:ring-[#ff7b1c] text-sm resize-none mb-3"
                                    ></textarea>
                                    <button 
                                        onClick={() => handleSaveComment(report.id, document.getElementById(`comment-${report.id}`).value)}
                                        className="w-full bg-[#1e48a3] hover:bg-[#123073] text-white font-bold py-2 rounded-xl transition-colors shadow-sm text-sm"
                                    >
                                        💾 Lưu nhận xét
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

export default AdvisorReportView;