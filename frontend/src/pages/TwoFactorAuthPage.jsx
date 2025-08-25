import React, { useState, useEffect } from "react";
import API from "../api";
import toast from "react-hot-toast";

const TwoFactorAuthPage = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const { data } = await API.post("/twofactor/setup");
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to set up 2FA. Please try again later.");
        toast.error("Failed to set up 2FA. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    setup2FA();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    try {
      await API.post("/twofactor/verify", { token });
      setIsVerified(true);
      setError("");
      toast.success("2FA enabled successfully!");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Invalid token. Please try again.");
      toast.error("Invalid token. Please try again.");
    }
  };

  return (
    <div className="bg-amber-200 dark:!bg-primary-dark min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-secondary-dark p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          Two-Factor Authentication
        </h1>
        {isVerified ? (
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-green-500 font-bold mt-4 text-xl">
              2FA has been enabled successfully!
            </p>
            <p className="text-secondary-text mt-2">
              You can now close this page.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-center text-secondary-text mb-4">
              Scan the QR code with your authenticator app (like Google
              Authenticator).
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg mb-4">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center text-secondary-text">
                  Loading QR Code...
                </div>
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-red-500">
                  {error}
                </div>
              )}
            </div>
            <p className="text-center text-secondary-text text-sm mb-2">
              Or enter this secret manually:
            </p>
            <p className="font-mono bg-gray-200 dark:bg-primary-dark p-2 rounded text-center text-black dark:text-white mb-6 overflow-auto">
              {secret || "Loading..."}
            </p>

            <form onSubmit={handleVerify}>
              <label className="block text-slate-700 dark:text-secondary-text mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue text-black dark:text-white"
              />
              <button
                type="submit"
                className="w-full mt-4 bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300"
              >
                Verify & Enable 2FA
              </button>
            </form>
            {error && !isVerified && (
              <p className="text-red-500 text-center mt-4">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
