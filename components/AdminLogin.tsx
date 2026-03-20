import React, { useState } from 'react';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../src/firebase';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLogin: (admin: AdminUser) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setErrorMessage('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // For this simple app, we just map the logged in user to the admin role
      // In a real app, you'd check if their email is in an allowed list
      const adminInfo: AdminUser = {
        name: user.displayName || '管理員', 
        ownerId: user.uid
      };

      onLogin(adminInfo);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(true);
      setErrorMessage(error.message || '登入失敗，請重試');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-[#A67C52]/10 border border-[#E6DCC3] text-center animate-in fade-in zoom-in-95 duration-500 mt-20">
      <div className="w-16 h-16 bg-[#F9F5F0] text-[#A67C52] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-[#E6DCC3]">
        <Lock size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-[#5C4033] mb-6">繪師後台登入</h2>
      <p className="text-[#A67C52] mb-8 font-medium">請使用 Google 帳號登入以進入後台管理系統。</p>
      
      {authError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm text-left">
          <AlertCircle size={16} className="shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleAdminLogin} className="space-y-4">
        <button 
          type="submit"
          className="w-full bg-[#BC4A3C] hover:bg-[#A33E32] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 mt-6 flex items-center justify-center gap-2 group"
        >
          <span>Google 登入</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;