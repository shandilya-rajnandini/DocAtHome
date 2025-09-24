import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getForumQuestions } from "../api";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  CheckBadgeIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const ForumPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({}); // eslint-disable-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current filters from URL parameters
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentSortBy = searchParams.get("sortBy") || "recent";
  const currentSearch = searchParams.get("search") || "";
  const currentTags = searchParams.get("tags") || "";

  const categories = [
    { value: "all", label: "All Categories", icon: "📋" },
    { value: "general", label: "General Health", icon: "🏥" },
    { value: "nutrition", label: "Nutrition", icon: "🥗" },
    { value: "fitness", label: "Fitness", icon: "💪" },
    { value: "mental-health", label: "Mental Health", icon: "🧠" },
    { value: "chronic-conditions", label: "Chronic Conditions", icon: "⚕️" },
    { value: "women-health", label: "Women's Health", icon: "👩‍⚕️" },
    { value: "pediatrics", label: "Pediatrics", icon: "👶" },
    { value: "elderly-care", label: "Elderly Care", icon: "👴" },
    { value: "medication", label: "Medication", icon: "💊" },
    { value: "symptoms", label: "Symptoms", icon: "🩺" },
    { value: "prevention", label: "Prevention", icon: "🛡️" },
  ];

  const sortOptions = [
    {
      value: "recent",
      label: "Most Recent",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    {
      value: "most-viewed",
      label: "Most Viewed",
      icon: <EyeIcon className="w-4 h-4" />,
    },
    {
      value: "most-answers",
      label: "Most Answers",
      icon: <ChatBubbleLeftIcon className="w-4 h-4" />,
    },
    {
      value: "unanswered",
      label: "Unanswered",
      icon: <QuestionMarkCircleIcon className="w-4 h-4" />,
    },
    {
      value: "oldest",
      label: "Oldest First",
      icon: <ClockIcon className="w-4 h-4" />,
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Questions" },
    { value: "open", label: "Open" },
    { value: "answered", label: "Answered" },
    { value: "closed", label: "Closed" },
  ];

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        category: currentCategory,
        status: currentStatus,
        sortBy: currentSortBy,
        search: currentSearch,
        tags: currentTags,
      };

      // Remove empty parameters
      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === "all" || params[key] === "") {
          delete params[key];
        }
      });

      const response = await getForumQuestions(params);

      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setPagination(response.data.data.pagination);
        setFilters(response.data.data.filters);
        setError("");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentCategory, currentStatus, currentSortBy, currentSearch, currentTags]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (newFilters.page === undefined) {
      params.delete("page");
    }

    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("search");
    updateFilters({ search: searchTerm });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || "📋";
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Health Q&A Forum
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Ask questions, get answers from our community of verified health
            professionals
          </p>
          <Link
            to="/forum/ask"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Ask a Question
          </Link>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={currentSearch}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={currentSortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {sortOptions.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your filters or be the first to ask a question!
              </p>
              <Link
                to="/forum/ask"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ask a Question
              </Link>
            </motion.div>
          ) : (
            questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">
                        {getCategoryIcon(question.category)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                          question.status
                        )}`}
                      >
                        {question.status.toUpperCase()}
                      </span>
                      {question.category !== "general" && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          {
                            categories.find(
                              (c) => c.value === question.category
                            )?.label
                          }
                        </span>
                      )}
                    </div>

                    {/* Question Title */}
                    <Link
                      to={`/forum/question/${question._id}`}
                      className="block hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {question.title}
                      </h3>
                    </Link>

                    {/* Question Preview */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {question.body.length > 150
                        ? `${question.body.substring(0, 150)}...`
                        : question.body}
                    </p>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full"
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{question.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Author and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <img
                            src={
                              question.author.profilePictureUrl ||
                              "/api/placeholder/32/32"
                            }
                            alt={question.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {question.author.name}
                          </span>
                          {question.author.isVerified && (
                            <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <span>•</span>
                        <span>{question.timeAgo}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{question.answerCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{question.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => updateFilters({ page: currentPage - 1 })}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {[...Array(Math.min(5, pagination.totalPages))].map(
                (_, index) => {
                  const pageNumber = Math.max(1, currentPage - 2) + index;
                  if (pageNumber <= pagination.totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => updateFilters({ page: pageNumber })}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNumber === currentPage
                            ? "bg-indigo-600 text-white"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                }
              )}

              {/* Next Button */}
              <button
                onClick={() => updateFilters({ page: currentPage + 1 })}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading overlay for filter changes */}
        {loading && questions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-900 dark:text-white">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
