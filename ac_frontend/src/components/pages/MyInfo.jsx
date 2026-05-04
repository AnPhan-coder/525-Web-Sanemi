import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { Save, Mail, User } from "lucide-react";

const MyInfo = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    id: user.id,
    name: user.name || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isChangePassword) {
        if (!formData.password || formData.password.length < 6) {
            toast.warning("Mật khẩu mới phải từ 6 ký tự!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
    }

    setLoading(true);
    try {
      const payload = {
          name: formData.name,
          ...(isChangePassword && { password: formData.password })
      };

      await axiosClient.put(`/users/${formData.id}`, payload);
      
      toast.success("Cập nhật hồ sơ thành công!");
      if (onUpdate) {
        onUpdate({ name: formData.name }); 
      }
      
      setIsChangePassword(false);
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

    } catch (error) {
      toast.error("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase tracking-wider border-b border-neutral-700 pb-4">
        Thông tin tài khoản
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        <div>
            <label className="flex text-neutral-400 text-sm font-bold mb-2 items-center gap-2">
                <User size={16}/> Họ và Tên
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
        </div>

        <div className="mt-8 bg-neutral-900/50 p-6 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-3 mb-4">
                <input 
                    type="checkbox" 
                    id="changePass" 
                    checked={isChangePassword} 
                    onChange={(e) => setIsChangePassword(e.target.checked)}
                    className="w-5 h-5 accent-yellow-500 cursor-pointer"
                />
                <label htmlFor="changePass" className="text-white font-bold cursor-pointer select-none">
                    Thay đổi mật khẩu đăng nhập
                </label>
            </div>

            {isChangePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <div>
                        <label className="block text-neutral-400 text-sm font-bold mb-2">Mật khẩu mới</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-neutral-400 text-sm font-bold mb-2">Xác nhận mật khẩu</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                    </div>
                </div>
            )}
        </div>

        <button type="submit" disabled={loading}
            className="px-8 py-3 bg-yellow-500 text-neutral-900 font-bold rounded-lg hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20">
            {loading ? "Đang lưu..." : <><Save size={20}/> Lưu Thay Đổi</>}
        </button>
      </form>
    </div>
  );
};

export default MyInfo;