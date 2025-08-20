import { useState } from "react";
import { forgotPassword } from "../api";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form
        onSubmit={onSubmit}
        className="bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Forgot Password
        </h2>
        <p className="text-center text-secondary-text mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <div className="mb-4">
          <label className="block text-secondary-text mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
