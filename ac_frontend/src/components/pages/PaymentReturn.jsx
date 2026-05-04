import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CheckCircle, XCircle, Home } from "lucide-react";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("LOADING");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryString = searchParams.toString();
        const res = await axiosClient.get(`/bookings/payment/vnpay-callback?${queryString}`);
        
        if (res.data.result === 1) {
          setStatus("SUCCESS");
        } else {
          setStatus("FAILED");
        }
      } catch (error) {
        console.error(error);
        setStatus("FAILED");
      }
    };

    if (searchParams.toString()) {
        verifyPayment();
    } else {
        navigate("/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 text-white">
      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 text-center">
        
        {status === "LOADING" && (
          <div>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-6"></div>
            <h2 className="text-xl font-bold animate-pulse">Đang xác thực giao dịch...</h2>
            <p className="text-neutral-400 mt-2">Vui lòng không tắt trình duyệt.</p>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="space-y-6">
            <div className="flex justify-center">
                <CheckCircle size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase">Thanh toán thành công!</h2>
            <p className="text-neutral-400">Vé đã được gửi vào email của bạn. Cảm ơn bạn đã sử dụng dịch vụ.</p>
            <button 
                onClick={() => navigate("/")} 
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Home size={20} /> Về Trang Chủ
            </button>
          </div>
        )}

        {status === "FAILED" && (
          <div className="space-y-6">
            <div className="flex justify-center">
                <XCircle size={80} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase">Thanh toán thất bại</h2>
            <p className="text-neutral-400">Giao dịch bị hủy hoặc xảy ra lỗi trong quá trình xử lý.</p>
            <button 
                onClick={() => navigate("/")} 
                className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-lg transition-colors"
            >
                Quay lại trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;