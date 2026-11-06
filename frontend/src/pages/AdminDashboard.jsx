import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function AdminDashboard() {
    const navigate = useNavigate();

    // ================= STATE =================
    // 1. Phân công Thực tập
    const [internFile, setInternFile] = useState(null);
    const [isImportingIntern, setIsImportingIntern] = useState(false);
    const [internResult, setInternResult] = useState(null);

    // 2. Cấp tài khoản Sinh viên
    const [accountFile, setAccountFile] = useState(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [generatedAccounts, setGeneratedAccounts] = useState([]);
    const [failedAccounts, setFailedAccounts] = useState([]); 
    const [showStudentPass, setShowStudentPass] = useState(false); 

    // 3. Cấp tài khoản Doanh nghiệp
    const [companyFile, setCompanyFile] = useState(null);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [generatedCompanies, setGeneratedCompanies] = useState([]);
    const [failedCompanies, setFailedCompanies] = useState([]);
    const [showCompanyPass, setShowCompanyPass] = useState(false);

    // ================= XỬ LÝ ĐĂNG XUẤT =================
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // ================= HÀM 1: IMPORT THỰC TẬP =================
    const handleInternFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setInternFile(file);
        } else {
            toast.error("Chỉ hỗ trợ file Excel (.xlsx, .xls)!");
            e.target.value = null;
        }
    };

    const handleImportInterns = async () => {
        if (!internFile) return toast.warning("Vui lòng chọn file Excel!");
        
        setIsImportingIntern(true);
        const formData = new FormData();
        formData.append('file', internFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/internships/import', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            toast.success("Import danh sách thực tập thành công!");
            setInternResult({
                success: response.data.success,
                errors: response.data.errors
            });
            setInternFile(null);
            document.getElementById('intern-upload').value = ""; 
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi import file");
        } finally {
            setIsImportingIntern(false);
        }
    };

    // ================= HÀM 2: IMPORT TÀI KHOẢN SINH VIÊN =================
    const handleAccountFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setAccountFile(file);
        } else {
            toast.error("Chỉ hỗ trợ file Excel (.xlsx, .xls)!");
            e.target.value = null;
        }
    };

    const handleImportAccounts = async () => {
        if (!accountFile) return toast.warning("Vui lòng chọn file tạo tài khoản!");
        
        setIsCreatingAccount(true);
        const formData = new FormData();
        formData.append('file', accountFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/auth/import-students', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            toast.success(`Xử lý xong! Thành công: ${response.data.createdCount}, Lỗi: ${response.data.errorCount}`);
            setGeneratedAccounts(response.data.accounts); 
            setFailedAccounts(response.data.failedAccounts || []);
            setAccountFile(null);
            document.getElementById('account-upload').value = ""; 
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản");
        } finally {
            setIsCreatingAccount(false);
        }
    };

    // ================= HÀM 3: IMPORT TÀI KHOẢN DOANH NGHIỆP =================
    const handleCompanyFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setCompanyFile(file);
        } else {
            toast.error("Chỉ hỗ trợ file Excel (.xlsx, .xls)!");
            e.target.value = null;
        }
    };

    const handleImportCompanies = async () => {
        if (!companyFile) return toast.warning("Vui lòng chọn file Excel Doanh nghiệp!");
        
        setIsCreatingCompany(true);
        const formData = new FormData();
        formData.append('file', companyFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/auth/import-companies', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            toast.success(`Xử lý xong! Thành công: ${response.data.createdCount}, Lỗi: ${response.data.errorCount}`);
            setGeneratedCompanies(response.data.accounts); 
            setFailedCompanies(response.data.failedAccounts || []);
            setCompanyFile(null);
            document.getElementById('company-upload').value = ""; 
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản DN");
        } finally {
            setIsCreatingCompany(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1e48a3]">CỔNG QUẢN TRỊ ADMIN</h1>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition">Đăng xuất</button>
                </div>

                {/* KHU VỰC 1: IMPORT PHÂN CÔNG THỰC TẬP */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-[#1e48a3] flex items-center gap-2">
                            <span>📊</span> Nhập danh sách phân công thực tập (Excel)
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">Hệ thống tự động tạo hồ sơ thực tập và chuyển trạng thái "Đang thực tập".</p>
                    </div>

                    <div className="bg-blue-50 border-dashed border-2 border-blue-300 rounded-xl p-8 text-center relative hover:bg-blue-100 transition">
                        <input type="file" id="intern-upload" accept=".xlsx, .xls" onChange={handleInternFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <div className="pointer-events-none">
                            <svg className="mx-auto h-10 w-10 text-[#1e48a3] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            <p className="text-[#1e48a3] font-bold text-lg mb-1">{internFile ? internFile.name : "Kéo thả hoặc click để chọn file Excel"}</p>
                            <p className="text-sm text-gray-500">Chỉ hỗ trợ .xlsx, .xls (Cột yêu cầu: StudentEmail, CompanyName, MentorEmail)</p>
                        </div>
                    </div>

                    <button onClick={handleImportInterns} disabled={isImportingIntern || !internFile} className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-colors ${internFile ? 'bg-[#1e48a3] hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {isImportingIntern ? 'Đang xử lý...' : 'Bắt đầu Import'}
                    </button>

                    {internResult && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-bold text-green-800 mb-2">Kết quả xử lý:</h4>
                            <p className="text-green-700">✅ Tạo thành công: <strong>{internResult.success}</strong> hồ sơ.</p>
                            <p className="text-yellow-600">⚠️ Bỏ qua (Lỗi / Đã tồn tại): <strong>{internResult.errors}</strong> hồ sơ.</p>
                        </div>
                    )}
                </div>

                {/* KHU VỰC 2: CẤP TÀI KHOẢN SINH VIÊN */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-[#ff7b1c] flex items-center gap-2">
                            <span>🧑‍🎓</span> Cấp tài khoản Sinh viên hàng loạt (Theo lớp)
                        </h2>
                    </div>

                    <div className="bg-orange-50 border-dashed border-2 border-orange-300 rounded-xl p-8 text-center relative hover:bg-orange-100 transition">
                        <input type="file" id="account-upload" accept=".xlsx, .xls" onChange={handleAccountFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <div className="pointer-events-none">
                            <svg className="mx-auto h-10 w-10 text-[#ff7b1c] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            <p className="text-[#ff7b1c] font-bold">{accountFile ? accountFile.name : "Kéo thả danh sách lớp (.xlsx) vào đây"}</p>
                        </div>
                    </div>

                    <button onClick={handleImportAccounts} disabled={isCreatingAccount || !accountFile} className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-colors ${accountFile ? 'bg-[#ff7b1c] hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {isCreatingAccount ? 'Đang xử lý...' : 'Bắt đầu Cấp tài khoản'}
                    </button>

                    {/* HIỂN THỊ DANH SÁCH THÀNH CÔNG */}
                    {generatedAccounts.length > 0 && (
                        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-green-800 text-lg">✅ TẠO THÀNH CÔNG {generatedAccounts.length} SINH VIÊN</h4>
                                <button onClick={() => setShowStudentPass(!showStudentPass)} className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                                    {showStudentPass ? '👁️ Ẩn mật khẩu' : '👁️ Hiện mật khẩu'}
                                </button>
                            </div>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-[#1e48a3] text-white">
                                        <tr><th className="py-3 px-4">STT</th><th className="py-3 px-4">Họ và tên</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Mật khẩu</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {generatedAccounts.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 text-center">{idx + 1}</td>
                                                <td className="py-3 px-4 font-medium">{acc.name}</td>
                                                <td className="py-3 px-4 text-blue-600">{acc.email}</td>
                                                <td className="py-3 px-4 font-mono text-red-600 font-bold">{showStudentPass ? acc.password : '******'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* HIỂN THỊ DANH SÁCH BỊ LỖI (NẾU CÓ) */}
                    {failedAccounts.length > 0 && (
                        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
                            <h4 className="font-bold text-red-800 mb-4 text-lg">❌ BỎ QUA {failedAccounts.length} TÀI KHOẢN (BỊ LỖI)</h4>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-red-100">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-red-100 text-red-800">
                                        <tr><th className="py-3 px-4">Họ và tên</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Nguyên nhân lỗi</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {failedAccounts.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-red-50">
                                                <td className="py-3 px-4 font-medium">{acc.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{acc.email}</td>
                                                <td className="py-3 px-4 text-red-600 font-semibold">{acc.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* KHU VỰC 3: CẤP TÀI KHOẢN DOANH NGHIỆP */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                            <span>🏢</span> Cấp tài khoản Đối tác Doanh nghiệp
                        </h2>
                    </div>

                    <div className="bg-purple-50 border-dashed border-2 border-purple-300 rounded-xl p-8 text-center relative hover:bg-purple-100 transition">
                        <input type="file" id="company-upload" accept=".xlsx, .xls" onChange={handleCompanyFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <div className="pointer-events-none">
                            <svg className="mx-auto h-10 w-10 text-purple-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            <p className="text-purple-600 font-bold">{companyFile ? companyFile.name : "Kéo thả danh sách Doanh nghiệp (.xlsx)"}</p>
                        </div>
                    </div>

                    <button onClick={handleImportCompanies} disabled={isCreatingCompany || !companyFile} className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-colors ${companyFile ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {isCreatingCompany ? 'Đang xử lý...' : 'Bắt đầu Cấp tài khoản'}
                    </button>

                    {/* HIỂN THỊ DANH SÁCH THÀNH CÔNG DOANH NGHIỆP */}
                    {generatedCompanies.length > 0 && (
                        <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-purple-800 text-lg">✅ TẠO THÀNH CÔNG {generatedCompanies.length} DOANH NGHIỆP</h4>
                                <button onClick={() => setShowCompanyPass(!showCompanyPass)} className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
                                    {showCompanyPass ? '👁️ Ẩn mật khẩu' : '👁️ Hiện mật khẩu'}
                                </button>
                            </div>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-purple-600 text-white">
                                        <tr><th className="py-3 px-4">Doanh nghiệp</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Mật khẩu (MST)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {generatedCompanies.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{acc.name}</td>
                                                <td className="py-3 px-4 text-blue-600">{acc.email}</td>
                                                <td className="py-3 px-4 font-mono text-red-600 font-bold">{showCompanyPass ? acc.password : '******'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* HIỂN THỊ DANH SÁCH BỊ LỖI DOANH NGHIỆP */}
                    {failedCompanies.length > 0 && (
                        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
                            <h4 className="font-bold text-red-800 mb-4 text-lg">❌ BỎ QUA {failedCompanies.length} CÔNG TY (BỊ LỖI)</h4>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-red-100">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-red-100 text-red-800">
                                        <tr><th className="py-3 px-4">Doanh nghiệp</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Nguyên nhân lỗi</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {failedCompanies.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-red-50">
                                                <td className="py-3 px-4 font-medium">{acc.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{acc.email}</td>
                                                <td className="py-3 px-4 text-red-600 font-semibold">{acc.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;