import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {Function} apiFunc - Async function gọi API
   * @param {Object} options - Tùy chọn
   * @param {string} options.successMessage - Toast message khi thành công
   * @param {string} options.errorMessage - Toast message khi lỗi (optional)
   * @param {Function} options.onSuccess - Callback sau khi thành công
   * @param {Function} options.onError - Callback khi lỗi
   * @returns {Promise} - Kết quả từ API
   */
  const execute = useCallback(async (apiFunc, options = {}) => {
    const {
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      showErrorToast = true,
      showSuccessToast = true,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunc();

      if (successMessage && showSuccessToast) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMsg =
        errorMessage ||
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi';

      setError(errorMsg);

      if (showErrorToast) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []); 

  return { loading, error, execute };
};
