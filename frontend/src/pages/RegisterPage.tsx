import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  Lock, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import authService from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    status: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  }, [formData.password]);

  const getStrengthColor = (step: number) => {
    if (passwordStrength < step) return 'bg-gray-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        category: formData.status
      });
      navigate('/login');
    } catch (err) {
      console.error('Register error detail:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Terjadi kesalahan saat mendaftar.');
    } {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.fullName && formData.email && formData.dob && 
                      formData.status && formData.password.length >= 8 && 
                      formData.confirmPassword === formData.password && 
                      formData.agreeToTerms;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
      <Navbar minimal />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-10 md:p-12 border border-gray-50">
          <div className="text-center mb-8">
            <h1 className="text-[#1E3A5F] text-[28px] font-bold leading-tight">Buat Akun Baru</h1>
            <p className="text-[#6B7280] text-[16px] mt-2">Mulai perjalanan karier IT-mu bersama StepWise.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#1F2937]">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                <input 
                  type="text" name="fullName" placeholder="Masukkan nama lengkap" required
                  className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-4 focus:border-[#3B82F6] focus:bg-white transition-all outline-none text-sm"
                  value={formData.fullName} onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#1F2937]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                <input 
                  type="email" name="email" placeholder="nama@email.com" required
                  className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-4 focus:border-[#3B82F6] focus:bg-white transition-all outline-none text-sm"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={18} />
                  <input 
                    type="date" name="dob" required
                    className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-4 focus:border-[#3B82F6] focus:bg-white outline-none text-sm appearance-none transition-all"
                    value={formData.dob} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Status Saat Ini</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={18} />
                  <select 
                    name="status" value={formData.status} onChange={handleChange} required
                    className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-4 focus:border-[#3B82F6] focus:bg-white outline-none text-sm appearance-none cursor-pointer transition-all"
                  >
                    <option value="" disabled>Pilih Status</option>
                    <option value="PELAJAR_SMA_SMK">Pelajar SMA/SMK</option>
                    <option value="MAHASISWA">Mahasiswa</option>
                    <option value="FRESH_GRADUATE">Fresh Graduate</option>
                    <option value="BEKERJA">Bekerja</option>
                    <option value="TIDAK_BEKERJA">Tidak Bekerja</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#1F2937]">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} name="password" placeholder="Minimal 8 karakter" required
                  className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-12 focus:border-[#3B82F6] focus:bg-white outline-none text-sm transition-all"
                  value={formData.password} onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E3A5F]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(seg => (
                  <div key={seg} className={`h-1.5 flex-1 rounded-full transition-colors ${getStrengthColor(seg)}`} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#1F2937]">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Ulangi kata sandi" required
                  className="w-full h-[48px] bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] pl-10 pr-12 focus:border-[#3B82F6] focus:bg-white outline-none text-sm transition-all"
                  value={formData.confirmPassword} onChange={handleChange}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E3A5F]">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required
                  className="mt-1 w-4 h-4 rounded border-[#D1D5DB] text-[#1E3A5F] focus:ring-[#1E3A5F]" 
                />
                <span className="text-[14px] text-[#6B7280] leading-snug">
                  Saya menyetujui <Link to="/privacy" className="text-[#1E3A5F] hover:underline font-medium">Kebijakan Privasi</Link> dan <Link to="/terms" className="text-[#1E3A5F] hover:underline font-medium">Syarat & Ketentuan</Link>
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600 text-xs animate-fade-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" disabled={!isFormValid || isLoading}
              className="w-full h-[48px] bg-[#1E3A5F] text-white rounded-[8px] font-bold text-[16px] hover:bg-[#152A44] disabled:bg-[#D1D5DB] transition-all flex items-center justify-center gap-2 mt-4 shadow-sm cursor-pointer"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20} /><span>Memproses...</span></> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="text-center mt-10 text-[14px] text-[#6B7280]">
            Sudah punya akun? <Link to="/login" className="text-[#1E3A5F] font-bold hover:underline">Masuk di sini</Link>
          </div>
        </div>
      </main>

    </div>
  );
};

export default RegisterPage;