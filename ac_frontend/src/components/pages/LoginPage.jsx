import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { toast } from "react-toastify";
import { Eye, EyeOff, LogIn } from "lucide-react"; 
import { authService } from "../../services/authService"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({
        email: email,
        password: password,
      });

      if (response.data.code === 1000) {
        const data = response.data.result;
        
        const realId = data.userID || data.id; 
        if (!realId) {
            toast.error("Lỗi hệ thống: Không lấy được ID người dùng!");
            setLoading(false);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            id: realId, 
            name: data.name,
            role: data.role
        }));

        window.dispatchEvent(new Event("auth-change"));
        
        toast.success(`Chào mừng quay trở lại, ${data.name}!`);
        
        const role = data.role ? data.role.toUpperCase() : "CUSTOMER";
        if (role === "ADMIN") {
            navigate("/admin/dashboard"); 
        } else {
            navigate("/");
        }
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi Login:", error);
      const msg = error.response?.data?.message || "Không thể kết nối đến Server";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.loginWithGoogle({
        token: credentialResponse.credential
      });

      if (response.data.code === 1000) {
        const data = response.data.result;
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            id: data.userID,
            name: data.name,
            role: data.role
        }));
        window.dispatchEvent(new Event("auth-change"));
        toast.success("🌐 Đăng nhập Google thành công!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 font-sans text-white pt-20 pb-10">
      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white uppercase tracking-wide">Đăng Nhập</h2>
            <p className="text-neutral-400 text-sm mt-2">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Mật khẩu</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
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

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-neutral-400 hover:text-yellow-500 transition-colors hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 font-bold rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black"></div> : <><LogIn size={20}/> ĐĂNG NHẬP</>}
          </button>
        </form>

        <div className="mt-8">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-neutral-800 text-neutral-400">Hoặc tiếp tục với</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Login Failed")}
                    useOneTap
                    theme="filled_black" 
                    text="signin_with"
                    shape="pill"
                    width="100%"
                />
            </div>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-yellow-500 hover:text-yellow-400 font-bold ml-1 hover:underline"
            >
              Đăng ký ngay
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;