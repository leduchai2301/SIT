import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; // BẮT BUỘC CÓ DÒNG NÀY

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdvisorReportView from './pages/AdvisorReportView';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword'; // Thêm dòng này ở trên cùng

function App() {
  return (
    <>
      {/* CÁI NÀY LÀ MÀN HÌNH ĐỂ HIỂN THỊ TOAST */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/advisor-dashboard" element={<AdvisorDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        
        {/* Đã xóa 1 route bị trùng, chỉ giữ lại view chi tiết báo cáo này */}
        <Route path="/advisor/reports/:id" element={<AdvisorReportView />} />
        
        {/* ĐÃ SỬA: Đổi /admin thành /admin-dashboard để khớp 100% với file Login */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doi-mat-khau" element={<ChangePassword />} />
      </Routes>
    </>
  );
}

export default App;