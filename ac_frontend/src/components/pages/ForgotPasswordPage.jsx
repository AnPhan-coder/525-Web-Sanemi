import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import Swal from "sweetalert2";
const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); 
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [msg, setMsg] = useState({ type: "", content: "" }); 
  const navigate = useNavigate();

  const handleSendMail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", content: "" });

    try {
      await authService.forgotPassword(email);
      
      setMsg({ type: "success", content: "Mã OTP đã được gửi. Vui lòng kiểm tra email!" });
      setStep(2); 
    } catch (error) {
      const errorText = error.response?.data?.message || "Không thể gửi email. Thử lại sau.";
      setMsg({ type: "error", content: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", content: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    setLoading(true);
    setMsg({ type: "", content: "" });

    try {
      await authService.resetPassword({
        email: email,
        otp: otp,
        newPassword: newPassword
      });

     Swal.fire({
        title: "Thành công!",
        text: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại.",
        icon: "success",
        background: "#171717",
        color: "#fff",
        confirmButtonColor: "#EAB308",
        confirmButtonText: "Đăng nhập ngay"
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      const errorText = error.response?.data?.message || "Lỗi đổi mật khẩu.";
      setMsg({ type: "error", content: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{step === 1 ? "Quên Mật Khẩu" : "Đặt Lại Mật Khẩu"}</h2>
        
        {msg.content && (
          <p className={`p-3 rounded-md text-sm mb-4 text-center border ${
            msg.type === 'error' 
              ? 'bg-red-900/20 text-red-400 border-red-900/50' 
              : 'bg-green-900/20 text-green-400 border-green-900/50'
          }`}>
            {msg.content}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendMail}>
            <div className="form-group">
              <label>Nhập Email đã đăng ký:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                disabled={loading} 
              />
            </div>
            <button 
                type="submit" 
                className={`btn-login w-full font-bold flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
              {loading ? "Đang gửi..." : "GỬI MÃ OTP"}
            </button>
            <div className="mt-4 text-center">
                <button type="button" onClick={() => navigate("/login")} className="text-neutral-500 hover:text-yellow-500 text-sm">
                    Quay lại đăng nhập
                </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Mã OTP (6 số):</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã từ email..."
                required
                maxLength={6}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                required
              />
            </div>
            <button 
                type="submit" 
                className="btn-login w-full font-bold"
                disabled={loading}
            >
              {loading ? "Đang xử lý..." : "ĐỔI MẬT KHẨU"}
            </button>
            
            <div className="mt-4 text-center">
                <button 
                    type="button" 
                    onClick={() => { setStep(1); setMsg({type:'', content:''}); }} 
                    className="text-neutral-500 hover:text-yellow-500 text-sm"
                >
                    Gửi lại mã?
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;