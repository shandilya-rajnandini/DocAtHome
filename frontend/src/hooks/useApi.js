import { useState, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for handling API calls with loading, error, and data states
 *
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToastOnError - Whether to show toast notifications on error (default: true)
 * @param {string} options.defaultErrorMessage - Default error message if none provided
 * @param {boolean} options.initialLoading - Whether to start in loading state (default: false)
 *
 * @returns {Object} - Object containing data, loading, error states and request function
 */
const useApi = (apiFunction, options = {}) => {
  const {
    showToastOnError = true,
    defaultErrorMessage = "An error occurred while fetching data",
    initialLoading = false,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);
        const responseData = response.data;
        setData(responseData);
        return responseData;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          defaultErrorMessage;

        setError(errorMessage);

        if (showToastOnError) {
          toast.error(errorMessage);
        }

        // Re-throw the error so calling components can handle it if needed
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, showToastOnError, defaultErrorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    request,
    reset,
  };
};

export default useApi;
