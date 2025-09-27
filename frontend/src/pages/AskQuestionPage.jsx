import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createForumQuestion } from "../api";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  XMarkIcon,
  InformationCircleIcon,
  TagIcon,
  PlusIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "general",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    {
      value: "general",
      label: "General Health",
      icon: "🏥",
      description: "General health questions and concerns",
    },
    {
      value: "nutrition",
      label: "Nutrition",
      icon: "🥗",
      description: "Diet, nutrition, and eating habits",
    },
    {
      value: "fitness",
      label: "Fitness",
      icon: "💪",
      description: "Exercise, physical activity, and fitness",
    },
    {
      value: "mental-health",
      label: "Mental Health",
      icon: "🧠",
      description: "Mental health, stress, and wellbeing",
    },
    {
      value: "chronic-conditions",
      label: "Chronic Conditions",
      icon: "⚕️",
      description: "Long-term health conditions and management",
    },
    {
      value: "women-health",
      label: "Women's Health",
      icon: "👩‍⚕️",
      description: "Women-specific health topics",
    },
    {
      value: "pediatrics",
      label: "Pediatrics",
      icon: "👶",
      description: "Children's health and development",
    },
    {
      value: "elderly-care",
      label: "Elderly Care",
      icon: "👴",
      description: "Health concerns for older adults",
    },
    {
      value: "medication",
      label: "Medication",
      icon: "💊",
      description: "Medications, side effects, and interactions",
    },
    {
      value: "symptoms",
      label: "Symptoms",
      icon: "🩺",
      description: "Symptom-related questions",
    },
    {
      value: "prevention",
      label: "Prevention",
      icon: "🛡️",
      description: "Disease prevention and health maintenance",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.title.length < 10) {
      setError("Title must be at least 10 characters long");
      return;
    }

    if (formData.body.length < 20) {
      setError("Question description must be at least 20 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createForumQuestion(formData);

      if (response.data.success) {
        navigate(`/forum/question/${response.data.data._id}`);
      }
    } catch (err) {
      console.error("Error creating question:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create question. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();

    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd(e);
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Login Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need to be logged in to ask a question in our health forum.
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/forum"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Forum
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ask a Health Question
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get answers from our community of verified health professionals
            </p>
          </div>

          {/* Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Guidelines for Asking Questions
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li>• Be specific and clear about your health concern</li>
                  <li>
                    • Provide relevant background information (age, symptoms,
                    duration)
                  </li>
                  <li>
                    • Choose the most appropriate category for your question
                  </li>
                  <li>
                    • Add relevant tags to help professionals find your question
                  </li>
                  <li>
                    • Remember: This is not a substitute for professional
                    medical advice
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Be specific and concise (e.g., 'Persistent headaches for 2 weeks with nausea')"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                maxLength={200}
                required
              />
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.title.length}/200 characters (minimum 10)
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      formData.category === category.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Body */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Details *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Provide detailed information about your question. Include relevant symptoms, duration, age, and any other context that might help professionals provide accurate answers."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                maxLength={2000}
                required
              />
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.body.length}/2000 characters (minimum 20)
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {formData.tags.length < 5 && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag (e.g., headache, medication, symptoms)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    disabled={!tagInput.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tags help professionals find your question (
                {formData.tags.length}/5)
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/forum")}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading || !formData.title.trim() || !formData.body.trim()
                }
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  "Post Question"
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
