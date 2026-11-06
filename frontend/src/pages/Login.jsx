import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Trạng thái cho các Modal (Popup)
  const [activeModal, setActiveModal] = useState(null); // 'handbook' | 'support' | 'forgot' | 'google'

  // Trạng thái cho Form Quên Mật Khẩu
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Trạng thái cho Form Hỗ Trợ
  const [supportForm, setSupportForm] = useState({ name: '', email: '', message: '' });

  // Xử lý Đăng Nhập Thường
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        
        // CẬP NHẬT: Lấy thêm cục `user` để check `is_first_login`
        const { token, role, name, user } = response.data;
        
        // Lưu thông tin vào bộ nhớ trình duyệt
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);

        toast.success(`Xin chào, ${name}!`);

        // 1. CHẶN LẠI NẾU LÀ ĐĂNG NHẬP LẦN ĐẦU (Tính năng bảo mật)
        if (user && user.is_first_login === 1) {
            navigate('/doi-mat-khau');
            return; // Dừng luôn, bắt đi đổi pass, không cho vào Dashboard
        }

        // 2. ĐIỀU HƯỚNG CHUẨN XÁC DỰA VÀO ROLE TỪ DATABASE
        if (role === 'STUDENT') {
            navigate('/student-dashboard');
        } else if (role === 'ADVISOR') {
            navigate('/advisor-dashboard');
        } else if (role === 'COMPANY' || role === 'MENTOR') { 
            // ĐÃ FIX: Cho phép cả COMPANY và MENTOR vào trang Doanh nghiệp
            navigate('/company-dashboard');
        } else if (role === 'ADMIN') {
            navigate('/admin-dashboard'); 
        } else {
            toast.error("Tài khoản chưa được cấp quyền truy cập!");
        }

    } catch (error) {
        toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
        setLoading(false);
    }
  };

  // Xử lý gửi Form Quên Mật Khẩu
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
    toast.success('Đã gửi yêu cầu cấp lại mật khẩu!');
  };

  // Xử lý gửi Form Hỗ Trợ
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    toast.success('Yêu cầu hỗ trợ đã được gửi đến Khoa CNTT!');
    setSupportForm({ name: '', email: '', message: '' });
    setActiveModal(null);
  };

  // Xử lý Giả Lập Đăng Nhập Google
  const handleQuickGoogleLogin = async (mockEmail) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google-mock', {
        email: mockEmail
      });
      
      localStorage.setItem('token', response.data.token);
      const userRole = response.data.user.role;
      
      toast.success(`Đăng nhập Google thành công! (${userRole})`);
      setActiveModal(null);

      // Đồng bộ phân luồng cho Google Login
      if (userRole === 'STUDENT') navigate('/student-dashboard');
      else if (userRole === 'ADVISOR') navigate('/advisor-dashboard');
      else if (userRole === 'COMPANY' || userRole === 'MENTOR') navigate('/company-dashboard'); 
      else if (userRole === 'ADMIN') navigate('/admin-dashboard');
    } catch (error) {
      toast.error('❌ Lỗi đăng nhập Google: ' + (error.response?.data?.message || 'Lỗi kết nối Backend'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a3187] to-[#04194d] flex flex-col items-center justify-center py-10 px-4 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Header */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">HỆ THỐNG QUẢN LÝ THỰC TẬP (SITS)</h1>
        <p className="text-blue-200 mt-2 text-lg">Sinh viên hoàn tất báo cáo và nộp hồ sơ trực tuyến dễ dàng, nhanh chóng</p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 z-10">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-3 bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1e48a3] p-2 rounded-full text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
              </div>
              <h2 className="text-[#1e48a3] font-bold text-xl uppercase">DÀNH CHO SINH VIÊN THỰC TẬP</h2>
            </div>
            <p className="text-gray-600 mb-8 font-medium">Sinh viên thực hiện quy trình thực tập theo 3 bước đơn giản: <br/> Cập nhật hồ sơ → Nộp báo cáo hàng tuần → Nhận đánh giá từ doanh nghiệp/giảng viên.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10">
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-[#1e48a3] mb-3 relative shadow-sm">
                  <span className="absolute -top-3 -left-3 bg-[#1e48a3] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">1</span>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                </div>
                <h3 className="font-bold text-[#1e48a3] text-sm uppercase mb-2">TẠO HỒ SƠ</h3>
                <p className="text-xs text-gray-500">Khai báo thông tin nơi thực tập & GVHD.</p>
              </div>
              <div className="relative">
                <div className="hidden md:block absolute top-8 -left-8 w-16 border-t-2 border-dashed border-gray-300"></div>
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-[#1e48a3] mb-3 relative shadow-sm">
                  <span className="absolute -top-3 -left-3 bg-[#1e48a3] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">2</span>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="font-bold text-[#1e48a3] text-sm uppercase mb-2">BÁO CÁO TUẦN</h3>
                <p className="text-xs text-gray-500">Nộp nhật ký thực tập và file báo cáo PDF.</p>
              </div>
              <div className="relative">
                <div className="hidden md:block absolute top-8 -left-8 w-16 border-t-2 border-dashed border-gray-300"></div>
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-[#1e48a3] mb-3 relative shadow-sm">
                  <span className="absolute -top-3 -left-3 bg-[#1e48a3] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">3</span>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="font-bold text-[#1e48a3] text-sm uppercase mb-2">ĐÁNH GIÁ & ĐIỂM</h3>
                <p className="text-xs text-gray-500">Nhận nhận xét từ Doanh nghiệp & Giảng viên.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              type="button" 
              onClick={() => setActiveModal('handbook')}
              className="flex-1 bg-[#2355b9] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#1a4090] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              XEM SỔ TAY THỰC TẬP
            </button>
            <button 
              type="button" 
              onClick={() => setActiveModal('support')}
              className="flex-1 bg-[#ff7b1c] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#e06510] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              TRUNG TÂM HỖ TRỢ
            </button>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="lg:col-span-2 bg-[#f8faff] rounded-3xl p-8 md:p-10 shadow-2xl relative border-4 border-white mt-8 lg:mt-0 pt-12">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
            <div className="bg-[#1e48a3] p-3 rounded-2xl text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-[#1e48a3] mb-8">ĐĂNG NHẬP</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email tài khoản"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]" 
                required 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3] focus:ring-1 focus:ring-[#1e48a3]" 
                required 
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <button type="button" onClick={() => { setActiveModal('forgot'); setForgotSent(false); }} className="text-gray-500 cursor-pointer hover:text-[#1e48a3]">Quên mật khẩu?</button>
              <button type="button" onClick={() => setActiveModal('support')} className="text-[#1e48a3] font-medium cursor-pointer flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Trợ giúp!
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1e48a3] text-white font-bold py-3 rounded-xl hover:bg-[#123073] transition-colors shadow-lg cursor-pointer">
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-600 font-medium border-t border-gray-100 pt-4">
              Chưa có tài khoản hệ thống?{' '}
              <Link to="/register" className="text-[#ff5a36] hover:text-[#e04522] hover:underline font-bold transition-colors">
                  Tạo tài khoản mới
              </Link>
            </div>
            
            <div className="relative flex items-center justify-center my-4">
               <div className="border-t border-gray-300 w-full"></div>
               <span className="bg-[#f8faff] px-3 text-xs text-gray-400 absolute">hoặc đăng nhập bằng</span>
            </div>

            <button type="button" onClick={() => setActiveModal('google')} className="w-full bg-[#ff5a36] text-white font-bold py-3 rounded-xl hover:bg-[#d64728] transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer">
              <svg className="w-5 h-5 bg-white rounded-full p-0.5 text-[#ff5a36]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
              Google
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="w-full max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#082260]/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/50 z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/50 rounded-full"><svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
          <div><h4 className="font-bold text-sm">Bảo mật tuyệt đối</h4><p className="text-xs text-blue-300">Thông tin được bảo vệ an toàn</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/50 rounded-full"><svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
          <div><h4 className="font-bold text-sm">Quản lý an toàn</h4><p className="text-xs text-blue-300">Hệ thống phân quyền chặt chẽ</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/50 rounded-full"><svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
          <div><h4 className="font-bold text-sm">Hỗ trợ 24/7</h4><p className="text-xs text-blue-300">Đội ngũ luôn sẵn sàng giải đáp</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-800/50 rounded-full"><svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
          <div><h4 className="font-bold text-sm">Xác nhận nhanh chóng</h4><p className="text-xs text-blue-300">Xử lý đánh giá trực tuyến</p></div>
        </div>
      </div>

      {/* ================= MODAL 1: SỔ TAY THỰC TẬP ================= */}
      {activeModal === 'handbook' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📘</span>
              <h3 className="text-2xl font-bold text-[#1e48a3]">Sổ Tay Hướng Dẫn Thực Tập (SITS)</h3>
            </div>
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-[#1e48a3] mb-1">1. Quy định thời gian nộp báo cáo</h4>
                <p>Sinh viên có nghĩa vụ cập nhật báo cáo tiến độ thực tập hàng tuần lên hệ thống trước **23h59 Thứ 6**.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-800 mb-1">2. Đánh giá từ Doanh nghiệp & Giảng viên</h4>
                <p>Doanh nghiệp thực tập sẽ chấm điểm chuyên cần và kỹ năng thực tế (40% tổng điểm). Giảng viên hướng dẫn chấm báo cáo cuối kỳ (60% tổng điểm).</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-1">3. Mẫu định dạng File báo cáo</h4>
                <p>File đính kèm báo cáo tuần bắt buộc thuộc định dạng **PDF** hoặc **Word (.docx)**, dung lượng không quá **10MB**.</p>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="mt-6 w-full bg-[#1e48a3] text-white py-3 rounded-xl font-bold hover:bg-[#123073]">Đã hiểu quy định</button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TRUNG TÂM HỖ TRỢ ================= */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📞</span>
              <h3 className="text-2xl font-bold text-[#1e48a3]">Trung Tâm Hỗ Trợ Sinh Viên</h3>
            </div>
            <p className="text-gray-500 text-xs mb-6">Khoa Công nghệ thông tin - Trường Đại học Công nghệ Đông Á</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div><strong className="text-[#1e48a3]">Hotline:</strong> 024.1234.5678</div>
              <div><strong className="text-[#1e48a3]">Email:</strong> cntt@eaut.edu.vn</div>
              <div><strong className="text-[#1e48a3]">Địa điểm:</strong> Phòng 602, Tòa nhà A</div>
              <div><strong className="text-[#1e48a3]">Giờ làm việc:</strong> 08:00 - 17:00 (T2 - T6)</div>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên / MSSV</label>
                <input required type="text" placeholder="Nguyễn Văn A - 20210001" value={supportForm.name} onChange={(e) => setSupportForm({...supportForm, name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#1e48a3]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email liên hệ</label>
                <input required type="email" placeholder="student@eaut.edu.vn" value={supportForm.email} onChange={(e) => setSupportForm({...supportForm, email: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#1e48a3]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung thắc mắc / sự cố</label>
                <textarea required rows="3" placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." value={supportForm.message} onChange={(e) => setSupportForm({...supportForm, message: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#1e48a3]"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#ff7b1c] text-white py-3 rounded-xl font-bold hover:bg-[#e06510]">Gửi Yêu Cầu Hỗ Trợ</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: QUÊN MẬT KHẨU ================= */}
      {activeModal === 'forgot' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative text-center">
            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#1e48a3] mx-auto mb-4 text-2xl">🔑</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Khôi Phục Mật Khẩu</h3>
            
            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-left mt-4">
                <p className="text-xs text-gray-500 text-center">Nhập email tài khoản EAUT của bạn để nhận liên kết khôi phục mật khẩu.</p>
                <div>
                  <input required type="email" placeholder="Nhập email của bạn..." value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1e48a3]" />
                </div>
                <button type="submit" className="w-full bg-[#1e48a3] text-white py-3 rounded-xl font-bold hover:bg-[#123073]">Gửi Liên Kết Khôi Phục</button>
              </form>
            ) : (
              <div className="py-4 space-y-3">
                <div className="p-4 bg-green-50 text-green-800 text-xs rounded-xl border border-green-200">
                  ✅ Hướng dẫn reset mật khẩu đã được gửi đến email <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư.
                </div>
                <button onClick={() => setActiveModal(null)} className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-bold text-sm">Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 4: GIẢ LẬP ĐĂNG NHẬP GOOGLE ================= */}
      {activeModal === 'google' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            <svg className="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <h3 className="text-lg font-bold text-gray-800">Chọn tài khoản Google</h3>
            <p className="text-xs text-gray-500 mb-4">Đăng nhập vào SITS EAUT</p>

            <div className="space-y-2 text-left">
              <button 
                onClick={() => handleQuickGoogleLogin('sinhvien1@eaut.edu.vn')}
                className="w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">SV</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Sinh viên Test</p>
                  <p className="text-[11px] text-gray-500">sinhvien1@eaut.edu.vn</p>
                </div>
              </button>

              <button 
                onClick={() => handleQuickGoogleLogin('giangvien1@eaut.edu.vn')}
                className="w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">GV</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Giảng viên Test</p>
                  <p className="text-[11px] text-gray-500">giangvien1@eaut.edu.vn</p>
                </div>
              </button>

              <button 
                onClick={() => handleQuickGoogleLogin('congty1@eaut.edu.vn')}
                className="w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">CT</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Doanh nghiệp Test</p>
                  <p className="text-[11px] text-gray-500">congty1@eaut.edu.vn</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;