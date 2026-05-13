import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import reviewApi from '../api/reviewApi';
import { useApiCall } from '../hooks/useApiCall';

const ReviewSection = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState({ rating: 0, content: '' });
  const [hoverRating, setHoverRating] = useState(0);
  
  // Lấy user từ localStorage để check quyền
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const { loading: loadingList, execute: fetchList } = useApiCall();
  const { loading: loadingSubmit, execute: submitReview } = useApiCall();

  useEffect(() => {
    loadReviews();
    if (user) loadMyReview();
  }, [movieId]);

  const loadReviews = async () => {
    await fetchList(
      () => reviewApi.getReviewsByMovie(movieId),
      {
        onSuccess: (res) => setReviews(res.data.result || []),
        showSuccessToast: false
      }
    );
  };

  const loadMyReview = async () => {
    try {
      const res = await reviewApi.getMyReview(movieId);
      if (res.data.code === 1000 && res.data.result) {
        setMyReview({
          rating: res.data.result.rating || 0,
          content: res.data.result.content || ''
        });
      }
    } catch (error) {
      console.log("User chưa đánh giá phim này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để bình luận!");
      return;
    }
    
    if (!myReview.content.trim() && myReview.rating === 0) {
      toast.warning("Vui lòng nhập nội dung hoặc chọn số sao!");
      return;
    }

    const payload = {
      movieId: Number(movieId),
      content: myReview.content,
      ...(myReview.rating > 0 && { rating: myReview.rating })
    };

    await submitReview(
      () => reviewApi.upsertReview(payload),
      {
        successMessage: "Đã lưu đánh giá của bạn!",
        onSuccess: () => loadReviews()
      }
    );
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Xóa bình luận?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reviewApi.deleteReview(id);
          toast.success("Đã xóa bình luận!");
          loadReviews();
        } catch (error) {
          toast.error("Xóa thất bại!");
        }
      }
    });
  };

  // Helper render sao
  const renderStars = (ratingValue, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        type="button"
        key={star}
        disabled={!interactive}
        onClick={() => interactive && setMyReview({ ...myReview, rating: star })}
        onMouseEnter={() => interactive && setHoverRating(star)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        className={`transition-colors ${!interactive && 'cursor-default'} ${
          ((interactive ? hoverRating : 0) || ratingValue) >= star 
            ? 'text-yellow-500' 
            : 'text-neutral-600'
        }`}
      >
        <Star size={interactive ? 28 : 16} fill="currentColor" />
      </button>
    ));
  };

  return (
    <section className="bg-neutral-800 p-6 md:p-8 rounded-2xl border border-neutral-700 shadow-xl mt-8">
      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-red-600 pl-3 uppercase">
        <MessageCircle size={20} className="text-red-500" /> Đánh giá & Bình luận
      </h3>

      {/* Form nhập liệu */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-neutral-900/50 p-5 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neutral-400 text-sm font-bold uppercase">Chấm điểm:</span>
            <div className="flex gap-1">{renderStars(myReview.rating, true)}</div>
            <span className="text-xs text-neutral-500 ml-2">(Chỉ dành cho tài khoản đã mua vé)</span>
          </div>
          
          <div className="relative">
            <textarea
              rows="3"
              placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim..."
              value={myReview.content}
              onChange={(e) => setMyReview({ ...myReview, content: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 text-white p-4 rounded-xl focus:border-red-500 outline-none transition-colors resize-none placeholder:text-neutral-500"
            ></textarea>
            <button 
              type="submit" 
              disabled={loadingSubmit}
              className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all shadow-lg hover:shadow-red-600/20 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 text-center py-6 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-700">
          <p className="text-neutral-400">Vui lòng đăng nhập để gửi đánh giá của bạn.</p>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {loadingList ? (
          <div className="text-center text-neutral-500 py-4">Đang tải đánh giá...</div>
        ) : reviews.length > 0 ? (
          reviews.map((rv) => (
            <div key={rv.id} className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex gap-4 group transition-colors hover:border-neutral-700">
              <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-300 font-bold shrink-0">
                {(rv.userName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rv.userName|| "Thành viên"}</h4>
                    <span className="text-[10px] text-neutral-500">{rv.createdAt}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    {rv.rating > 0 && (
                      <div className="flex gap-0.5">{renderStars(rv.rating, false)}</div>
                    )}
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                      <button 
                        onClick={() => handleDelete(rv.id)}
                        className="text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {rv.content && <p className="text-neutral-300 text-sm mt-2">{rv.content}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-neutral-500 py-4 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;