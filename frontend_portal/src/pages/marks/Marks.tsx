import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define interfaces based on the backend response
interface CategoryAnswer {
  category: string;
  answer: string;
}

interface Question {
  question_id: number;
  item_id: number;
  status: string;
  question_category: string[];
  item_category: string | null; // Nullable due to leftJoin
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  name: string;
}

interface Answer {
  answer_id: number;
  user: User;
  question: Question;
  category_answers: CategoryAnswer[];
  created_at: string;
  total_marks: number;
}

interface GroupedAnswers {
  user: User;
  answersByCategory: { [key: string]: { answers: Answer[] } };
}

const UserAnswers: React.FC = () => {
  const [groupedAnswers, setGroupedAnswers] = useState<GroupedAnswers[]>([]);
  const [filteredAnswers, setFilteredAnswers] = useState<GroupedAnswers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Fetch answers from /api/answers and group by user and category
  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ answers: Answer[] }>('/api/logged/user-answers');
        const answers = response.data.answers || [];

        // Group answers by user and then by item_category
        const grouped = answers.reduce((acc: GroupedAnswers[], answer: Answer) => {
          const user = answer.user || { user_id: 0, name: 'Unknown' };
          const item_category = answer.question?.item_category || 'Uncategorized';
          let userGroup = acc.find((group) => group.user.user_id === user.user_id);

          if (!userGroup) {
            userGroup = {
              user,
              answersByCategory: {},
            };
            acc.push(userGroup);
          }

          if (!userGroup.answersByCategory[item_category]) {
            userGroup.answersByCategory[item_category] = { answers: [] };
          }
          userGroup.answersByCategory[item_category].answers.push(answer);

          return acc;
        }, []);

        setGroupedAnswers(grouped);
        setFilteredAnswers(grouped);
      } catch (err: any) {
        console.error('Error fetching answers:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load answers. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage, { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, []);

  // Handle search by user.name and item_category
  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = groupedAnswers.filter((group) => {
      const matchesUserName = group.user.name.toLowerCase().includes(lowercasedSearch);
      const matchesCategory = Object.keys(group.answersByCategory).some((category) =>
        category.toLowerCase().includes(lowercasedSearch)
      );
      return matchesUserName || matchesCategory;
    });
    setFilteredAnswers(filtered);
  }, [search, groupedAnswers]);

  // Format created_at date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading answers...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render grouped answers with search
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6">
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
        <h2 className="text-4xl font-extrabold mb-10 text-gray-800 dark:text-white tracking-tight animate-fade-in">
          Sellers Marks
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div className="relative w-full sm:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or category..."
              className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
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
        {filteredAnswers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
            No answers found.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredAnswers.map((group, index) => (
              <div
                key={`user-${group.user.user_id}-${index}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 w-full transform hover:shadow-xl transition-all duration-300 animate-fade-in"
              >
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  {group.user.name}
                </h3>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {Object.entries(group.answersByCategory).map(([category, { answers }], catIndex) => (
                    <div key={`${category}-${catIndex}`} className="mb-4">
                      <div className="mb-2">
                        <h4 className="text-lg font-semibold text-silver-800 dark:text-gray-100">
                          {category}
                        </h4>
                      </div>
                      {answers.map((answer, answerIndex) => (
                        <div key={answer.answer_id}>
                          <div
                            className="flex flex-row items-center gap-6 flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-2"
                          >
                            <div className="min-w-[150px]  text-yellow-600 ">
                              <strong>Category:</strong> {category}
                            </div>
                            <div className="min-w-[150px]">
                              <strong>Questions:</strong>{' '}
                              {answer.question?.question_category?.join(', ') || 'N/A'}
                            </div>
                            <div className="min-w-[200px]">
                              <strong>Question Created At:</strong>{' '}
                              <span className="text-red-600 font-medium">{formatDate(answer.question.created_at)}</span>
                            </div>
                            <div className="min-w-[200px] pr-4 border-r border-gray-300 dark:border-gray-600">
                              <strong>Marks:</strong>{' '}
                              {answer.category_answers
                                ? answer.category_answers
                                    .map((ca) => (
                                      <span key={`${ca.category}-${ca.answer}`}>
                                        {ca.category}: <span className="font-bold text-green-900">{ca.answer}</span>
                                      </span>
                                    ))
                                    .reduce((prev, curr, i) => (i === 0 ? [curr] : [...prev, '; ', curr]), [] as React.ReactNode[])
                                : 'No answers provided'}
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="min-w-[100px]">
                                <strong>Total Marks:</strong> {answer.total_marks ?? 'N/A'}
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                Marks Created At: {formatDate(answer.created_at)}
                              </div>
                            </div>
                          </div>
                          <hr className="my-2 border-t-2 border-blue-300" />
                        </div>
                      ))}
                      {catIndex < Object.keys(group.answersByCategory).length - 1 && (
                        <hr className="my-4 border-t-2 py-5 border-gray-900 dark:border-gray-600"  />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnswers;