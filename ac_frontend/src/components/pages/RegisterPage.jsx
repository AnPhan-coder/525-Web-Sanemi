import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService"; 
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Eye, EyeOff, UserPlus } from "lucide-react"; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.warning("⚠️ Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.code === 1000) {
        Swal.fire({
            title: "Đăng ký thành công!",
            text: "Chào mừng bạn đến với AnCinema. Vui lòng đăng nhập để tiếp tục.",
            icon: "success",
            background: "#171717",
            color: "#fff",
            confirmButtonColor: "#EAB308",
            confirmButtonText: "Đăng nhập ngay"
        }).then(() => {
            navigate("/login");
        });
      } else {
        toast.error(response.data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const msg = error.response?.data?.message || "Lỗi kết nối Server";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 font-sans text-white pt-20 pb-10">
      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white uppercase tracking-wide">Đăng Ký</h2>
            <p className="text-neutral-400 text-sm mt-2">Tạo tài khoản mới tại AnCinema</p>
        </div>
                
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Mật khẩu</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự..."
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all pr-12"
                required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Nhập lại mật khẩu</label>
            <div className="relative">
                <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu..."
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all pr-12"
                required
                />
                <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 font-bold rounded-lg transition-all transform hover:scale-[1.02] mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black"></div> : <><UserPlus size={20}/> ĐĂNG KÝ NGAY</>}
          </button>
          
          <div className="mt-6 text-center text-sm text-neutral-400">
            Đã có tài khoản?{" "}
            <Link 
              to="/login" 
              className="text-yellow-500 hover:text-yellow-400 font-bold ml-1 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;