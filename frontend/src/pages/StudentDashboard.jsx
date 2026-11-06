import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function StudentDashboard() {
    const navigate = useNavigate();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // THÊM STATE ĐỂ CHỨA DANH SÁCH CÔNG TY TỪ DATABASE
    const [companiesList, setCompaniesList] = useState([]);
    
    // State cho Form Khai báo hồ sơ
    const [companySelect, setCompanySelect] = useState(''); 
    const [companyName, setCompanyName] = useState('');     
    const [mentorEmail, setMentorEmail] = useState('');

    // State cho Form Báo cáo tuần
    const [weekNumber, setWeekNumber] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchInternshipData();
    }, []);

    const fetchInternshipData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // GỌI 2 API CÙNG LÚC: Lấy hồ sơ & Lấy danh sách công ty
            const [internRes, compRes] = await Promise.all([
                axios.get('http://localhost:5000/api/internships', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/auth/companies') // API mới thêm
            ]);

            if (internRes.data.data && internRes.data.data.length > 0) {
                setInternship(internRes.data.data[0]);
            } else {
                setInternship(null); 
            }
            
            setCompaniesList(compRes.data); // Lưu danh sách công ty vào state

        } catch (error) {
            toast.error("Lỗi lấy dữ liệu hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Xử lý Gửi khai báo thực tập
    const handleRegisterInternship = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/internships/register', {
                company_name: companyName,
                mentor_email: companySelect === 'KHAC' ? '' : mentorEmail 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success("Đã gửi hồ sơ! Vui lòng chờ Giảng viên duyệt.");
            fetchInternshipData(); 
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || 'Không thể tạo hồ sơ'));
        }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('internship_id', internship.id);
        formData.append('week_number', weekNumber);
        formData.append('content', content);
        formData.append('file', file); 

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/reports/submit', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(`Đã nộp báo cáo tuần ${weekNumber} thành công!`);
            setWeekNumber(''); setContent(''); setFile(null);
            document.getElementById('file-upload').value = "";
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data?.message || 'Không thể nộp báo cáo'));
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f8faff] flex justify-center items-center font-bold text-[#1e48a3]">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] py-12 px-4 font-sans relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="text-center mb-6 z-10">
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Không gian Sinh Viên</h1>
                <p className="text-blue-200 mt-2">Nộp báo cáo và theo dõi tiến độ thực tập</p>
            </div>

            <div className="w-full max-w-4xl bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white mt-10 z-10">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                    <div className="bg-[#1e48a3] p-3 rounded-2xl text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#1e48a3]">HỒ SƠ THỰC TẬP</h2>
                    <button onClick={handleLogout} className="bg-[#ff5a36] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#d64728] transition-colors shadow-md">Đăng xuất</button>
                </div>

                {/* SCENARIO 1: CHƯA CÓ HỒ SƠ */}
                {!internship && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-8 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📝</span>
                            <h3 className="text-lg font-bold text-gray-800">Khai báo nơi thực tập</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Vui lòng chọn Tập đoàn/Công ty nơi bạn sẽ thực tập. Nếu tự liên hệ, hãy chọn "Khác" và điền tên.</p>
                        
                        <form onSubmit={handleRegisterInternship} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-sm">Nơi thực tập (Danh sách Đối tác EAUT):</label>
                                <select 
                                    value={companySelect} 
                                    onChange={(e) => {
                                        setCompanySelect(e.target.value);
                                        if(e.target.value !== 'KHAC') {
                                            setCompanyName(e.target.value);
                                        } else {
                                            setCompanyName(''); 
                                            setMentorEmail(''); 
                                        }
                                    }} 
                                    required 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3] bg-white cursor-pointer"
                                >
                                    <option value="" disabled>-- Chọn Tập đoàn / Doanh nghiệp --</option>
                                    
                                    {/* ĐỔ DỮ LIỆU TỪ DATABASE VÀO ĐÂY */}
                                    {companiesList.map((company) => (
                                        <option key={company.id} value={company.full_name}>
                                            {company.full_name}
                                        </option>
                                    ))}
                                    
                                    <option value="KHAC">🏢 Khác (Sinh viên tự liên hệ ngoài...)</option>
                                </select>
                            </div>

                            {companySelect === 'KHAC' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Tên doanh nghiệp bạn tự liên hệ:</label>
                                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="VD: Công ty TNHH Giải pháp Phần mềm ABC"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]" />
                                    <p className="text-xs text-orange-600 mt-2 font-medium italic">
                                        * Lưu ý: Doanh nghiệp ngoài sẽ không tham gia vào hệ thống. Bạn sẽ nộp toàn bộ báo cáo trực tiếp cho Giảng viên xem xét và chấm điểm.
                                    </p>
                                </div>
                            )}

                            {companySelect !== '' && companySelect !== 'KHAC' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-gray-700 font-bold mb-2 text-sm">Email người hướng dẫn (Mentor) tại Doanh nghiệp:</label>
                                    <input type="email" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} required placeholder="VD: mentor@viettel.com.vn"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]" />
                                    <p className="text-xs text-[#1e48a3] mt-2 italic">Email này phải khớp với tài khoản hệ thống đã được Admin cấp cho Doanh nghiệp.</p>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-[#1e48a3] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#123073] transition-colors shadow-md mt-2">
                                Nộp hồ sơ chờ duyệt
                            </button>
                        </form>
                    </div>
                )}

                {/* SCENARIO 2, 3 & 4: ĐÃ CÓ HỒ SƠ */}
                {internship && (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">📌 Trạng thái hiện tại</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-800 font-bold">🏢 Công ty: <span className="text-[#1e48a3]">{internship.company_name}</span></p>
                                    {internship.mentor_email && (
                                        <p className="text-sm text-gray-800 font-bold">✉️ Mentor: <span className="text-gray-600">{internship.mentor_email}</span></p>
                                    )}
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold border text-center ${
                                    internship.status === 'PENDING' ? 'bg-orange-50 border-orange-200 text-[#ff7b1c]' : 
                                    internship.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-[#1e48a3]' : 
                                    internship.status === 'EVALUATING' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                    'bg-green-50 border-green-200 text-green-700'
                                }`}>
                                    {internship.status === 'PENDING' ? '⏳ ĐANG CHỜ GV DUYỆT' : 
                                     internship.status === 'IN_PROGRESS' ? '🟢 ĐANG THỰC TẬP' : 
                                     internship.status === 'EVALUATING' ? '📝 ĐANG CHỜ CHỐT ĐIỂM' :
                                     '✅ ĐÃ KẾT THÚC'}
                                </span>
                            </div>
                        </div>

                        {internship.status === 'PENDING' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
                                <span className="text-4xl mb-3 block">⏳</span>
                                <h3 className="text-orange-800 font-bold text-lg mb-1">Hồ sơ đang chờ phê duyệt</h3>
                                <p className="text-orange-600 text-sm">Bạn sẽ có thể nộp báo cáo tuần sau khi Giảng viên hướng dẫn xác nhận thông tin thực tập của bạn.</p>
                            </div>
                        )}

                        {internship.status === 'IN_PROGRESS' && (
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
                                <h3 className="text-xl font-bold text-[#1e48a3] mb-6 flex items-center gap-2">📝 Nộp báo cáo tuần</h3>
                                <form onSubmit={handleSubmitReport} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-bold mb-2 text-sm">Tuần số:</label>
                                            <input type="number" min="1" max="20" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} required 
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-bold mb-2 text-sm">File đính kèm (PDF/Word):</label>
                                            <input id="file-upload" type="file" onChange={(e) => setFile(e.target.files[0])} required 
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#eef2fa] file:text-[#1e48a3] hover:file:bg-[#dce6f9]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2 text-sm">Nội dung báo cáo:</label>
                                        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows="4" placeholder="Mô tả công việc..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]"></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-[#1e48a3] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#123073] transition-colors shadow-lg flex items-center justify-center gap-2">
                                        📤 Gửi Báo Cáo
                                    </button>
                                </form>
                            </div>
                        )}

                        {(internship.status === 'EVALUATING' || internship.status === 'COMPLETED') && (
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
                                <h3 className="text-xl font-bold text-[#1e48a3] mb-6 border-b border-gray-100 pb-4">📊 KẾT QUẢ THỰC TẬP</h3>
                                
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-[#1e48a3]">Điểm từ Doanh nghiệp:</h4>
                                            <span className="text-xl font-black text-[#ff7b1c]">{internship.company_score ? `${internship.company_score} / 10` : 'Đang cập nhật'}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic">"{internship.company_evaluation || 'Chưa có nhận xét'}"</p>
                                    </div>

                                    {internship.status === 'COMPLETED' ? (
                                        <div className="bg-green-50 p-5 rounded-xl border border-green-200 text-center mt-4">
                                            <h4 className="font-bold text-green-800 mb-1">ĐIỂM TỔNG KẾT MÔN HỌC</h4>
                                            <span className="text-4xl font-black text-green-600">{internship.final_score}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-sm font-medium text-gray-500">Giảng viên đang tổng hợp điểm để chốt kết quả cuối cùng. Vui lòng quay lại sau.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;