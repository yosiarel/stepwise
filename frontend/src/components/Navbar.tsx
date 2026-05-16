import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  minimal?: boolean;
}

const Navbar = ({ minimal = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm shrink-0">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Konsisten */}
          <Link to="/" className="text-[#1E3A5F] text-[24px] font-bold tracking-tight shrink-0">
            StepWise
          </Link>
          
          {!minimal && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#fitur" className="text-[#6B7280] hover:text-[#1E3A5F] font-medium transition-colors">Fitur</a>
                <a href="#cara-kerja" className="text-[#6B7280] hover:text-[#1E3A5F] font-medium transition-colors">Cara Kerja</a>
                <Link to="/login" className="text-[#1E3A5F] font-semibold hover:underline">Masuk</Link>
                <Link to="/register" className="h-[48px] px-6 bg-[#1E3A5F] text-white rounded-[8px] flex items-center font-medium hover:bg-[#152A44] transition-all">
                  Mulai Gratis
                </Link>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#1F2937] p-2 flex items-center">
                  <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {!minimal && isMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-4 py-4 space-y-4 shadow-lg">
          <a href="#fitur" onClick={() => setIsMenuOpen(false)} className="block text-[#6B7280]">Fitur</a>
          <a href="#cara-kerja" onClick={() => setIsMenuOpen(false)} className="block text-[#6B7280]">Cara Kerja</a>
          <hr />
          <Link to="/login" className="block text-[#1E3A5F] font-semibold">Masuk</Link>
          <Link to="/register" className="block bg-[#1E3A5F] text-white text-center py-3 rounded-[8px]">Mulai Gratis</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;