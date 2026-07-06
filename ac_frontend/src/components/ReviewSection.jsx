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
  
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);
  
  // Lấy user từ localStorage để check quyền
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const { loading: loadingList, execute: fetchList } = useApiCall();
  const { loading: loadingSubmit, execute: submitReview } = useApiCall();

  useEffect(() => {
    loadReviews();
    if (user) loadMyReview();
    setVisibleReviewsCount(5);
    setActiveReplyId(null);
  }, [movieId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const targetReviewId = queryParams.get("reviewId");
    
    if (targetReviewId && reviews.length > 0) {
      const reviewIndex = reviews.findIndex(r => r.id.toString() === targetReviewId);
      if (reviewIndex !== -1) {
        if (reviewIndex >= visibleReviewsCount) {
          setVisibleReviewsCount(reviewIndex + 1);
        }
        setActiveReplyId(parseInt(targetReviewId));

        setTimeout(() => {
          const commentEl = document.getElementById(`review-card-${targetReviewId}`);
          if (commentEl) {
            commentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            commentEl.classList.add("border-red-500/80", "shadow-lg", "shadow-red-950/20");
            setTimeout(() => {
              commentEl.classList.remove("border-red-500/80", "shadow-lg", "shadow-red-950/20");
            }, 3000);
          }
        }, 500);
      }
    }
  }, [reviews]);

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

  const handleReplySubmit = async (reviewId) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để phản hồi!");
      return;
    }
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi!");
      return;
    }

    try {
      await reviewApi.createReply({
        reviewId,
        content: replyContent
      });
      toast.success("Đã gửi phản hồi!");
      setReplyContent('');
      setActiveReplyId(null);
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi phản hồi thất bại!");
    }
  };

  const handleReplyDelete = async (replyId) => {
    Swal.fire({
      title: "Xóa phản hồi?",
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
          await reviewApi.deleteReply(replyId);
          toast.success("Đã xóa phản hồi!");
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
    <section id="reviews-section" className="bg-neutral-800 p-6 md:p-8 rounded-2xl border border-neutral-700 shadow-xl mt-8">
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
      <div>
        {loadingList ? (
          <div className="text-center text-neutral-500 py-4">Đang tải đánh giá...</div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-4">
              {reviews.slice(0, visibleReviewsCount).map((rv) => (
                <div id={`review-card-${rv.id}`} key={rv.id} className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex gap-4 group transition-all duration-500 hover:border-neutral-700">
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

                    {/* Phản Hồi Buttons */}
                    {user && (
                      <div className="mt-2 flex gap-4 text-xs">
                        <button
                          onClick={() => {
                            if (activeReplyId === rv.id) {
                              setActiveReplyId(null);
                            } else {
                              setActiveReplyId(rv.id);
                              setReplyContent('');
                            }
                          }}
                          className="text-neutral-500 hover:text-red-500 font-semibold transition-colors"
                        >
                          Phản hồi
                        </button>
                      </div>
                    )}

                    {/* Inline Form */}
                    {activeReplyId === rv.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Viết phản hồi..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 bg-neutral-800 border border-neutral-700 text-white text-xs px-3 py-1.5 rounded-lg focus:border-red-500 outline-none transition-colors"
                        />
                        <button
                          onClick={() => handleReplySubmit(rv.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md"
                        >
                          Gửi
                        </button>
                      </div>
                    )}

                    {/* Danh sách Phản hồi lồng nhau */}
                    {rv.replies && rv.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-neutral-800">
                        {rv.replies.map((reply) => (
                          <div key={reply.id} className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-800 flex gap-3 group/reply">
                            <div className="w-7 h-7 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 font-bold shrink-0 text-xs">
                              {(reply.userName || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <div>
                                  <h5 className="font-bold text-white text-xs">{reply.userName || "Thành viên"}</h5>
                                  <span className="text-[9px] text-neutral-550">{reply.createdAt}</span>
                                </div>
                                {user?.role?.toUpperCase() === 'ADMIN' && (
                                  <button
                                    onClick={() => handleReplyDelete(reply.id)}
                                    className="text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100"
                                    title="Xóa phản hồi"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-neutral-400 text-xs mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {visibleReviewsCount < reviews.length && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleReviewsCount(prev => prev + 5)}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-350 font-semibold rounded-lg border border-neutral-700 transition-all text-xs"
                >
                  Xem thêm bình luận
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-neutral-500 py-4 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;