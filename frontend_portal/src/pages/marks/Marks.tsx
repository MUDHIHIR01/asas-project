import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define interfaces based on the /api/marks/all response
interface Mark {
  mark_id: number | null;
  user_id: number;
  user_name: string;
  question_id: number;
  item_id: number;
  item_category: string;
  total_marks: number;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  name: string;
}

interface GroupedMarks {
  user: User;
  marksByCategory: { [key: string]: Mark[] };
}

const UserAnswers: React.FC = () => {
  const [marksByMonth, setMarksByMonth] = useState<Record<string, GroupedMarks[]>>({});
  const [filteredMarksByMonth, setFilteredMarksByMonth] = useState<Record<string, GroupedMarks[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Fetch marks from /api/marks/all and group by month, user, and category
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ data: Mark[] }>('/api/marks/all');
        const marks = response.data.data || [];

        // Group marks by month, then by user and item_category
        const groupedByMonth = marks.reduce((acc: Record<string, GroupedMarks[]>, mark: Mark) => {
          const date = new Date(mark.created_at);
          const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }

          // Map mark to user and category
          const user: User = { user_id: mark.user_id, name: mark.user_name };
          const item_category = mark.item_category || 'Uncategorized';

          let userGroup = acc[monthYear].find((group) => group.user.user_id === user.user_id);
          if (!userGroup) {
            userGroup = {
              user,
              marksByCategory: {},
            };
            acc[monthYear].push(userGroup);
          }

          if (!userGroup.marksByCategory[item_category]) {
            userGroup.marksByCategory[item_category] = [];
          }
          userGroup.marksByCategory[item_category].push(mark);

          return acc;
        }, {} as Record<string, GroupedMarks[]>);

        // Sort months in descending order (newest first)
        const sortedGrouped = Object.keys(groupedByMonth)
          .sort((a, b) => {
            const dateA = new Date(a + ' 1');
            const dateB = new Date(b + ' 1');
            return dateB.getTime() - dateA.getTime();
          })
          .reduce((acc, key) => {
            acc[key] = groupedByMonth[key];
            return acc;
          }, {} as Record<string, GroupedMarks[]>);

        setMarksByMonth(sortedGrouped);
        setFilteredMarksByMonth(sortedGrouped);
      } catch (err: any) {
        console.error('Error fetching marks:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load marks. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage, { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  // Handle search by user.name and item_category
  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = Object.keys(marksByMonth).reduce((acc: Record<string, GroupedMarks[]>, month) => {
      acc[month] = marksByMonth[month].filter((group) => {
        const matchesUserName = group.user.name.toLowerCase().includes(lowercasedSearch);
        const matchesCategory = Object.keys(group.marksByCategory).some((category) =>
          category.toLowerCase().includes(lowercasedSearch)
        );
        return matchesUserName || matchesCategory;
      });
      return acc;
    }, {} as Record<string, GroupedMarks[]>);
    setFilteredMarksByMonth(filtered);
  }, [search, marksByMonth]);

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
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading marks...</p>
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

  // Render grouped marks with search
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
          Employee Marks
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
        {Object.keys(filteredMarksByMonth).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
            No marks found.
          </p>
        ) : (
          Object.keys(filteredMarksByMonth).map((month) => (
            <div key={month} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{month}</h3>
              {filteredMarksByMonth[month].length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
                  No marks found for {month}.
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredMarksByMonth[month].map((group, index) => (
                    <div
                      key={`user-${group.user.user_id}-${index}`}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 w-full transform hover:shadow-xl transition-all duration-300 animate-fade-in"
                    >
                      <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                        {group.user.name}
                      </h3>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        {Object.entries(group.marksByCategory).map(([category, marks], catIndex) => (
                          <div key={`${category}-${catIndex}`} className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              {category}
                            </h4>
                            {marks.map((mark, markIndex) => (
                              <div key={`mark-${mark.question_id}-${markIndex}`}>
                                <div className="flex flex-row items-center gap-6 flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <div className="min-w-[150px] text-yellow-600">
                                    <strong>Category:</strong> {category}
                                  </div>
                                 
                                  <div className="min-w-[200px]">
                                    <strong>Mark Created At:</strong>{' '}
                                    <span className="text-red-600 font-medium">{formatDate(mark.created_at)}</span>
                                  </div>
                                  <div className="min-w-[100px]">
                                    <strong>Total Marks:</strong> {mark.total_marks ?? 'N/A'}
                                  </div>
                                </div>
                                <hr className="my-2 border-t-2 border-blue-300" />
                              </div>
                            ))}
                            {catIndex < Object.keys(group.marksByCategory).length - 1 && (
                              <hr className="my-4 border-t-2 py-5 border-gray-900 dark:border-gray-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserAnswers;