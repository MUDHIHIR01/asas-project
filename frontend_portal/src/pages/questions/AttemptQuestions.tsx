import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Question {
  question_id: number;
  item_id: number;
  question_category: string[];
  created_at: string;
  updated_at: string;
  item: Item;
}

interface User {
  user_id: number;
  name: string;
}

interface CategoryAnswer {
  category: string;
  answer: string;
}

interface FormData {
  user_id: number | null;
  category_answers: CategoryAnswer[];
  total_marks: number | null;
}

const AttemptQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    user_id: null,
    category_answers: [],
    total_marks: null,
  });

  // Fetch questions and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsResponse, usersResponse] = await Promise.all([
          axiosInstance.get<{ questions: Question[] }>('/api/logged-user/questions'),
          axiosInstance.get<{ users: User[] }>('/api/user-dropdown'),
        ]);
        setQuestions(questionsResponse.data.questions || []);
        setFilteredQuestions(questionsResponse.data.questions || []);
        setUsers(usersResponse.data.users || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load questions or users. Please try again.');
        toast.error('Failed to load data.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = questions.filter(
      (question) =>
        question.item.item_category.toLowerCase().includes(lowercasedSearch) ||
        question.question_category.some((cat) => cat.toLowerCase().includes(lowercasedSearch))
    );
    setFilteredQuestions(filtered);
    setCurrentPage(1);
  }, [search, questions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Open modal and initialize form
  const handleAddClick = (question: Question) => {
    setSelectedQuestion(question);
    const initialCategoryAnswers = question.question_category.map((category) => ({
      category,
      answer: '',
    }));
    setFormData({
      user_id: null,
      category_answers: initialCategoryAnswers,
      total_marks: null,
    });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === 'category_answer' && index !== undefined) {
      setFormData((prev) => {
        const updatedCategoryAnswers = [...prev.category_answers];
        updatedCategoryAnswers[index] = {
          ...updatedCategoryAnswers[index],
          answer: value,
        };
        return { ...prev, category_answers: updatedCategoryAnswers };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'total_marks' ? (value ? Number(value) : null) : value ? Number(value) : null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuestion) {
      toast.error('No question selected.', { position: 'top-right' });
      return;
    }

    if (!formData.user_id) {
      toast.error('Please select a user.', { position: 'top-right' });
      return;
    }
    if (!formData.total_marks || formData.total_marks < 1) {
      toast.error('Please enter valid total marks (minimum 1).', { position: 'top-right' });
      return;
    }
    if (formData.category_answers.some((ca) => !ca.answer || ca.answer.trim() === '')) {
      toast.error('Please provide answers for all categories.', { position: 'top-right' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        user_id: formData.user_id,
        question_id: selectedQuestion.question_id,
        category_answers: formData.category_answers,
        total_marks: formData.total_marks,
      };

      const response = await axiosInstance.post('/api/answers', payload);
      toast.success(response.data.message || 'Answers submitted successfully!', {
        position: 'top-right',
      });
      setIsModalOpen(false);
      setSelectedQuestion(null);
      setFormData({
        user_id: null,
        category_answers: [],
        total_marks: null,
      });
    } catch (err: any) {
      console.error('Error submitting answers:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit answers.';
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setFormData({
      user_id: null,
      category_answers: [],
      total_marks: null,
    });
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
          Explore Questions
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedQuestions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium col-span-full animate-fade-in">
              No questions found.
            </p>
          ) : (
            paginatedQuestions.map((question) => (
              <div
                key={question.question_id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between transform hover:shadow-lg transition-all duration-300 animate-fade-in"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 truncate">
                    {question.item.item_category}
                  </h3>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(question.created_at)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                      Questions:
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
                </div>
                <button
                  onClick={() => handleAddClick(question)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base mt-3 sm:mt-0"
                >
                  Submit Marks
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-sm text-sm sm:text-base"
            >
              Next
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
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

        {/* Modal for entering answers */}
        {isModalOpen && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md sm:max-w-lg shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">
                Submit Marks for Question ID: {selectedQuestion.question_id}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="user_id"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2"
                  >
                    Select User
                  </label>
                  <select
                    id="user_id"
                    name="user_id"
                    value={formData.user_id ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.category_answers.map((categoryAnswer, index) => (
                  <div key={index} className="mb-4 sm:mb-6">
                    <label
                      htmlFor={`category_answer_${index}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2"
                    >
                      {categoryAnswer.category}
                    </label>
                    <input
                      type="text"
                      id={`category_answer_${index}`}
                      name="category_answer"
                      value={categoryAnswer.answer}
                      onChange={(e) => handleInputChange(e, index)}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                      placeholder={`Enter marks for ${categoryAnswer.category}`}
                      required
                    />
                  </div>
                ))}
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="total_marks"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2"
                  >
                    Total Marks
                  </label>
                  <input
                    type="number"
                    id="total_marks"
                    name="total_marks"
                    value={formData.total_marks ?? ''}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                    placeholder="Enter total marks"
                    required
                  />
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
                      'Submit Answers'
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