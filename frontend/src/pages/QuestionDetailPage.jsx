import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getForumQuestion,
  createForumAnswer,
  voteOnQuestion,
  voteOnAnswer,
  acceptAnswer,
} from "../api";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  TagIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";

const QuestionDetailPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await getForumQuestion(questionId);

      if (response.data.success) {
        setQuestion(response.data.data.question);
        setAnswers(response.data.data.answers);
        setStats(response.data.data.stats);
        setError("");
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setError("Failed to load question. Please try again.");
      if (err.response?.status === 404) {
        navigate("/forum");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await voteOnQuestion(questionId, { voteType });

      if (response.data.success) {
        setQuestion((prev) => ({
          ...prev,
          score: response.data.data.score,
          userVote: response.data.data.userVote,
        }));
      }
    } catch (err) {
      console.error("Error voting on question:", err);
      setError(
        err.response?.data?.message || "Failed to vote. Please try again."
      );
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await voteOnAnswer(answerId, { voteType });

      if (response.data.success) {
        setAnswers((prev) =>
          prev.map((answer) =>
            answer._id === answerId
              ? {
                  ...answer,
                  score: response.data.data.score,
                  userVote: response.data.data.userVote,
                }
              : answer
          )
        );
      }
    } catch (err) {
      console.error("Error voting on answer:", err);
      setError(
        err.response?.data?.message || "Failed to vote. Please try again."
      );
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await acceptAnswer(answerId);

      if (response.data.success) {
        // Update the accepted answer
        setAnswers((prev) =>
          prev.map((answer) => ({
            ...answer,
            isAccepted: answer._id === answerId,
            canAccept: false,
          }))
        );

        // Update question status
        setQuestion((prev) => ({
          ...prev,
          status: "answered",
        }));
      }
    } catch (err) {
      console.error("Error accepting answer:", err);
      setError(
        err.response?.data?.message ||
          "Failed to accept answer. Please try again."
      );
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!answerText.trim()) {
      setError("Please provide an answer");
      return;
    }

    if (answerText.length < 20) {
      setError("Answer must be at least 20 characters long");
      return;
    }

    setSubmittingAnswer(true);
    setError("");

    try {
      const response = await createForumAnswer(questionId, {
        body: answerText,
      });

      if (response.data.success) {
        setAnswers((prev) => [...prev, response.data.data]);
        setAnswerText("");
        setStats((prev) => ({
          ...prev,
          totalAnswers: prev.totalAnswers + 1,
          verifiedAnswers: response.data.data.isVerifiedResponse
            ? prev.verifiedAnswers + 1
            : prev.verifiedAnswers,
        }));
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit answer. Please try again."
      );
    } finally {
      setSubmittingAnswer(false);
    }
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

  const categories = [
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

  const getCategoryInfo = (category) => {
    return (
      categories.find((c) => c.value === category) || {
        icon: "📋",
        label: category,
      }
    );
  };

  if (loading) {
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

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Link to="/forum" className="text-indigo-600 hover:text-indigo-800">
              ← Back to Forum
            </Link>
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

        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Question */}
          {question && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
            >
              {/* Question Header */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">
                  {getCategoryInfo(question.category).icon}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeColor(
                    question.status
                  )}`}
                >
                  {question.status.toUpperCase()}
                </span>
                <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {getCategoryInfo(question.category).label}
                </span>
              </div>

              {/* Question Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {question.title}
              </h1>

              {/* Question Body */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                {question.body.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Question Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Author and Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        question.author.profilePictureUrl ||
                        "/api/placeholder/40/40"
                      }
                      alt={question.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {question.author.name}
                        </span>
                        {question.author.isVerified && (
                          <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {question.author.role === "doctor" && "👨‍⚕️ Doctor"}
                        {question.author.role === "nurse" && "👩‍⚕️ Nurse"}
                        {question.author.role === "patient" && "👤 Patient"}
                        {question.author.specialty &&
                          ` • ${question.author.specialty}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{question.timeAgo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{question.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{stats.totalAnswers} answers</span>
                    </div>
                  </div>
                </div>

                {/* Voting */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVoteQuestion("upvote")}
                    disabled={!user || question.canEdit}
                    className={`p-2 rounded-lg transition-colors ${
                      question.userVote === "upvote"
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {question.userVote === "upvote" ? (
                      <HandThumbUpIconSolid className="w-5 h-5" />
                    ) : (
                      <HandThumbUpIcon className="w-5 h-5" />
                    )}
                  </button>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {question.score}
                  </span>
                  <button
                    onClick={() => handleVoteQuestion("downvote")}
                    disabled={!user || question.canEdit}
                    className={`p-2 rounded-lg transition-colors ${
                      question.userVote === "downvote"
                        ? "bg-red-100 text-red-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {question.userVote === "downvote" ? (
                      <HandThumbDownIconSolid className="w-5 h-5" />
                    ) : (
                      <HandThumbDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Answers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Answers ({stats.totalAnswers})
              </h2>
              {stats.verifiedAnswers > 0 && (
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <CheckBadgeIcon className="w-4 h-4" />
                  <span>
                    {stats.verifiedAnswers} from verified professionals
                  </span>
                </div>
              )}
            </div>

            {/* Answers List */}
            <div className="space-y-6">
              {answers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No answers yet. Be the first to help!</p>
                </div>
              ) : (
                answers.map((answer, index) => (
                  <motion.div
                    key={answer._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-l-4 pl-6 py-4 ${
                      answer.isAccepted
                        ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                        : answer.isVerifiedResponse
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {/* Answer Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            answer.author.profilePictureUrl ||
                            "/api/placeholder/32/32"
                          }
                          alt={answer.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {answer.author.name}
                            </span>
                            {answer.author.isVerified && (
                              <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                            )}
                            {answer.isVerifiedResponse && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Verified Professional
                              </span>
                            )}
                            {answer.isAccepted && (
                              <span className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                <CheckCircleIconSolid className="w-3 h-3 mr-1" />
                                Accepted Answer
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {answer.author.role === "doctor" && "👨‍⚕️ Doctor"}
                            {answer.author.role === "nurse" && "👩‍⚕️ Nurse"}
                            {answer.author.role === "patient" && "👤 Patient"}
                            {answer.author.specialty &&
                              ` • ${answer.author.specialty}`}
                            {answer.author.experience &&
                              ` • ${answer.author.experience} years exp.`}
                            <span> • {answer.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Answer Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Accept Button (only for question author) */}
                        {answer.canAccept &&
                          user &&
                          question.author._id === user.id &&
                          !answer.isAccepted && (
                            <button
                              onClick={() => handleAcceptAnswer(answer._id)}
                              className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Accept
                            </button>
                          )}

                        {/* Voting */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() =>
                              handleVoteAnswer(answer._id, "upvote")
                            }
                            disabled={!user || answer.canEdit}
                            className={`p-1 rounded transition-colors ${
                              answer.userVote === "upvote"
                                ? "bg-green-100 text-green-600"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {answer.userVote === "upvote" ? (
                              <HandThumbUpIconSolid className="w-4 h-4" />
                            ) : (
                              <HandThumbUpIcon className="w-4 h-4" />
                            )}
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {answer.score}
                          </span>
                          <button
                            onClick={() =>
                              handleVoteAnswer(answer._id, "downvote")
                            }
                            disabled={!user || answer.canEdit}
                            className={`p-1 rounded transition-colors ${
                              answer.userVote === "downvote"
                                ? "bg-red-100 text-red-600"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {answer.userVote === "downvote" ? (
                              <HandThumbDownIconSolid className="w-4 h-4" />
                            ) : (
                              <HandThumbDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Answer Body */}
                    <div className="prose dark:prose-invert max-w-none">
                      {answer.body.split("\n").map((paragraph, pIndex) => (
                        <p key={pIndex} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Answer Form */}
          {user && question?.status !== "closed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Answer
              </h3>

              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Provide a helpful and detailed answer..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none mb-4"
                  maxLength={3000}
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {answerText.length}/3000 characters (minimum 20)
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAnswer || answerText.length < 20}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submittingAnswer ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                        Post Answer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Login Prompt for Non-Users */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center"
            >
              <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Join the conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Log in to answer questions, vote, and help others in our health
                community.
              </p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
