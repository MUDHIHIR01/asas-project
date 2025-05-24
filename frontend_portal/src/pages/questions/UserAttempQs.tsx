import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
}

interface Attempt {
  user_id: number | null;
  choice_index: number;
  marks: number;
  attempted_at: string;
}

interface Question {
  question_id: number;
  item_id: number;
  item_category: string;
  question_category: string[];
  choice: string[];
  marks_caryy_that_choice: number[];
  marks_per_choice_attempted: Attempt[];
  user_id: (number | null)[];
  employee_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const AttemptQuestions: React.FC = () => {
  const [questionsByMonth, setQuestionsByMonth] = useState<Record<string, Question[]>>({});
  const [filteredQuestionsByMonth, setFilteredQuestionsByMonth] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [currentPageByMonth, setCurrentPageByMonth] = useState<Record<string, number>>({});
  const [pageSize, setPageSize] = useState<number>(9);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ choice_index: number | null }>({
    choice_index: null,
  });

  // Fetch questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ data: Question[] }>('/api/questions');
        const questions = response.data.data || [];

        // Group questions by month and year
        const grouped = questions.reduce((acc, question) => {
          const date = new Date(question.created_at);
          const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }
          acc[monthYear].push(question);
          return acc;
        }, {} as Record<string, Question[]>);

        // Sort months in descending order (newest first)
        const sortedGrouped = Object.keys(grouped)
          .sort((a, b) => {
            const dateA = new Date(a + ' 1');
            const dateB = new Date(b + ' 1');
            return dateB.getTime() - dateA.getTime();
          })
          .reduce((acc, key) => {
            acc[key] = grouped[key];
            return acc;
          }, {} as Record<string, Question[]>);

        setQuestionsByMonth(sortedGrouped);
        setFilteredQuestionsByMonth(sortedGrouped);

        // Initialize pagination for each month
        const initialPages = Object.keys(sortedGrouped).reduce((acc, month) => {
          acc[month] = 1;
          return acc;
        }, {} as Record<string, number>);
        setCurrentPageByMonth(initialPages);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
        toast.error('Failed to load questions.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = Object.keys(questionsByMonth).reduce((acc, month) => {
      acc[month] = questionsByMonth[month].filter(
        (question) =>
          question.item_category.toLowerCase().includes(lowercasedSearch) ||
          question.question_category.some((cat) => cat.toLowerCase().includes(lowercasedSearch))
      );
      return acc;
    }, {} as Record<string, Question[]>);

    setFilteredQuestionsByMonth(filtered);

    // Reset pagination to page 1 for each month when search changes
    const resetPages = Object.keys(filtered).reduce((acc, month) => {
      acc[month] = 1;
      return acc;
    }, {} as Record<string, number>);
    setCurrentPageByMonth(resetPages);
  }, [search, questionsByMonth]);

  // Pagination logic for a specific month
  const getPaginatedQuestions = (month: string) => {
    const questions = filteredQuestionsByMonth[month] || [];
    const currentPage = currentPageByMonth[month] || 1;
    return questions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  };

  const getTotalPages = (month: string) => {
    const questions = filteredQuestionsByMonth[month] || [];
    return Math.ceil(questions.length / pageSize);
  };

  const handleNextPage = (month: string) => {
    const totalPages = getTotalPages(month);
    if (currentPageByMonth[month] < totalPages) {
      setCurrentPageByMonth((prev) => ({
        ...prev,
        [month]: prev[month] + 1,
      }));
    }
  };

  const handlePreviousPage = (month: string) => {
    if (currentPageByMonth[month] > 1) {
      setCurrentPageByMonth((prev) => ({
        ...prev,
        [month]: prev[month] - 1,
      }));
    }
  };

  // Open modal and initialize form
  const handleAttemptClick = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({ choice_index: null });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData({ choice_index: value ? Number(value) : null });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuestion) {
      toast.error('No question selected.', { position: 'top-right' });
      return;
    }

    if (formData.choice_index === null || formData.choice_index < 0 || formData.choice_index >= selectedQuestion.choice.length) {
      toast.error('Please select a valid choice.', { position: 'top-right' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        choice_index: formData.choice_index,
      };

      const response = await axiosInstance.post(`/api/questions/${selectedQuestion.question_id}/attempt`, payload);
      const marks = response.data.data.marks.total_marks;
      toast.success(`Attempt submitted! You scored ${marks} marks.`, { position: 'top-right' });

      // Update questions state with new attempt data
      setQuestionsByMonth((prev) => {
        const updated = { ...prev };
        const month = new Date(selectedQuestion.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        updated[month] = updated[month].map((q) =>
          q.question_id === selectedQuestion.question_id
            ? {
                ...q,
                marks_per_choice_attempted: response.data.data.question.marks_per_choice_attempted,
                status: response.data.data.question.status,
                user_id: response.data.data.question.user_id,
                updated_at: response.data.data.question.updated_at,
              }
            : q
        );
        return updated;
      });

      setFilteredQuestionsByMonth((prev) => {
        const updated = { ...prev };
        const month = new Date(selectedQuestion.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        updated[month] = updated[month].map((q) =>
          q.question_id === selectedQuestion.question_id
            ? {
                ...q,
                marks_per_choice_attempted: response.data.data.question.marks_per_choice_attempted,
                status: response.data.data.question.status,
                user_id: response.data.data.question.user_id,
                updated_at: response.data.data.question.updated_at,
              }
            : q
        );
        return updated;
      });

      setIsModalOpen(false);
      setSelectedQuestion(null);
      setFormData({ choice_index: null });
    } catch (err: any) {
      console.error('Error submitting attempt:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit attempt.';
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setFormData({ choice_index: null });
  };

  // Format created_at date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ top: '70px' }}
        closeOnClick
        pauseOnHover
        draggable
        hideProgressBar
        theme="colored"
      />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-gray-800 dark:text-white tracking-tight animate-fade-in">
          Attempt Questions
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:w-80 md:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category..."
              className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {Object.keys(filteredQuestionsByMonth).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
            No questions found.
          </p>
        ) : (
          Object.keys(filteredQuestionsByMonth).map((month) => (
            <div key={month} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{month}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {getPaginatedQuestions(month).length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium col-span-full animate-fade-in">
                    No questions found for {month}.
                  </p>
                ) : (
                  getPaginatedQuestions(month).map((question) => (
                    <div
                      key={question.question_id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between transform hover:shadow-lg transition-all duration-300 animate-fade-in"
                    >
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 truncate">
                          {question.item_category}
                        </h4>
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(question.created_at)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Status: {question.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                            Categories:
                          </span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5">
                            {question.question_category.map((category, index) => (
                              <span
                                key={index}
                                className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                            Choices:
                          </span>
                          <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1.5">
                            {question.choice.map((choice, index) => (
                              <li key={index}>{choice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAttemptClick(question)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base mt-3 sm:mt-0"
                      >
                        Attempt Question
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handlePreviousPage(month)}
                    disabled={currentPageByMonth[month] === 1}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleNextPage(month)}
                    disabled={currentPageByMonth[month] === getTotalPages(month)}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base"
                  >
                    Next
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Page <span className="font-semibold">{currentPageByMonth[month] || 1}</span> of{' '}
                  <span className="font-semibold">{getTotalPages(month)}</span>
                </div>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPageByMonth((prev) => {
                      const updated = { ...prev };
                      updated[month] = 1;
                      return updated;
                    });
                  }}
                  className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-sm sm:text-base"
                >
                  {[6, 9, 12, 15].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
        {/* Modal for attempting question */}
        {isModalOpen && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md sm:max-w-lg shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">
                Attempt Question ID: {selectedQuestion.question_id}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="choice_index"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2"
                  >
                    Select Choice
                  </label>
                  <select
                    id="choice_index"
                    name="choice_index"
                    value={formData.choice_index ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="">Select a choice</option>
                    {selectedQuestion.choice.map((choice, index) => (
                      <option key={index} value={index}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base ${
                      isSubmitting
                        ? 'opacity-75 cursor-not-allowed'
                        : 'hover:from-indigo-600 hover:to-blue-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Attempt'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptQuestions;