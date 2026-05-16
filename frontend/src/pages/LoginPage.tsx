import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import authService from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
// REVISI: Di-comment agar tidak memicu error linter karena tidak lagi digunakan setelah Footer dihapus
// import Footer from '../components/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const setAuth = useAuthStore(state => state.setAuth);

    try {
      const response = await authService.login({
        email,
        password,
      });
      setAuth(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau Kata Sandi salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
      <Navbar minimal />
      
      {/* Spacing konstan py-2xl (64px) sesuai DESIGN.MD */}
      <main className="flex-grow flex items-center justify-center py-[64px] px-4">
        <div className="w-full max-w-[440px] bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-10 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-[#1E3A5F] text-[28px] font-bold leading-tight">Selamat Datang Kembali</h1>
            <p className="text-[#6B7280] text-[16px] mt-2">Silakan masuk ke akun StepWise Anda untuk melanjutkan perjalanan karier Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1F2937]">Email</label>
              <input 
                type="email" placeholder="nama@email.com" autoComplete="new-email" 
                className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] px-4 focus:border-[#3B82F6] outline-none text-sm" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1F2937]">Kata Sandi</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" 
                  className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] px-4 pr-12 focus:border-[#3B82F6] outline-none text-sm" 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E3A5F]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" disabled={!email || !password || isLoading} 
              className="w-full h-[48px] bg-[#1E3A5F] text-white rounded-[8px] font-bold text-[16px] hover:bg-[#152A44] disabled:bg-[#D1D5DB] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20} /><span>Memproses...</span></> : 'Masuk'}
            </button>
          </form>

          <div className="text-center mt-10 text-[14px] text-[#6B7280]">
            Belum punya akun? <Link to="/register" className="text-[#1E3A5F] font-bold hover:underline">Daftar di sini</Link>
          </div>
        </div>
      </main>

    </div>
  );
};

export default LoginPage;