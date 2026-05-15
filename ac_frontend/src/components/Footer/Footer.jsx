import React from 'react';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-4">
              SA<span className="text-red-500">NEMI</span>
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Đến Sanemi để thưởng thức Cinema
            </p>
            
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-red-500 hover:text-red-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-red-500 hover:text-red-500 transition-colors"
                aria-label="Youtube"
              >
                <Youtube size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-red-500 hover:text-red-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 relative pb-2">
              Điều khoản
              <span className="absolute left-0 bottom-0 w-8 h-0.5 bg-red-500"></span>
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-neutral-500 hover:text-red-500 transition-colors">
                  Điều khoản chung
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-neutral-500 hover:text-red-500 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-neutral-500 hover:text-red-500 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 relative pb-2">
              Liên hệ
              <span className="absolute left-0 bottom-0 w-8 h-0.5 bg-red-500"></span>
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Phone size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400">Hotline:</span>
                  <p className="text-white font-medium">52200311</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Mail size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400">Email:</span>
                  <p className="text-white font-medium break-all">dh52200311@student.stu.edu.vn</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-400">Địa chỉ:</span>
                  <p className="text-white font-medium">180 Cao Lỗ, Q8, TP.HCM</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 relative pb-2">
              Nhận tin mới
              <span className="absolute left-0 bottom-0 w-8 h-0.5 bg-red-500"></span>
            </h4>
            <p className="text-sm text-neutral-500 mb-4">
              Đăng ký để nhận thông tin phim mới nhất
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder:text-neutral-500 focus:border-red-500 outline-none transition-colors"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-linear-to-r from-red-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-blue-700 transition-all"
              >
                Gửi
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-neutral-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-600">
              &copy; 2025 SANEMI. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-xs text-neutral-600">
              <Link to="/terms" className="hover:text-red-500 transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/privacy" className="hover:text-red-500 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/cookies" className="hover:text-red-500 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
