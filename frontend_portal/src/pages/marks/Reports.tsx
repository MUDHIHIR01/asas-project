import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  item_category: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  name: string;
}

interface ItemCategory {
  item_id: number;
  item_category: string;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [itemCategory, setItemCategory] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(true);
  const [filtersSubmitted, setFiltersSubmitted] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Generate a list of dates for the dropdowns (e.g., last 365 days)
  const generateDateOptions = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dates.push(formattedDate);
    }
    return dates;
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get<{ users: User[] }>('/api/user-dropdown');
      setUsers(response.data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users for dropdown.', { position: 'top-right' });
    }
  };

  // Fetch item categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get<ItemCategory[]>('/api/item/by-dropdown');
      setCategories(response.data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load item categories.', { position: 'top-right' });
    }
  };

  // Fetch answers from /api/report-for-answers with filters
  const fetchAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { [key: string]: string } = {};
      if (userId) params.user_id = userId;
      if (itemCategory && itemCategory !== 'all') params.item_category = itemCategory;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const response = await axiosInstance.get<{ answers: Answer[] }>('/api/report-for-answers', { params });
      const answers = response.data.answers || [];

      // Group answers byOBS user and then by item_category
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
      const errorMessage = err.response?.data?.message || 'Failed to load answers report. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter submission
  const handleFilterSubmit = () => {
    setFiltersSubmitted(true);
    fetchAnswers();
  };

  // Fetch dropdown data and generate dates on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      setDropdownLoading(true);
      await Promise.all([fetchUsers(), fetchCategories()]);
      setAvailableDates(generateDateOptions());
      setDropdownLoading(false);
    };
    loadDropdowns();
  }, []);

  // Handle search by user.name and item_category
  useEffect(() => {
    if (!filtersSubmitted) return;

    const lowercasedSearch = search.toLowerCase();
    const filtered = groupedAnswers.filter((group) => {
      const matchesUserName = group.user.name.toLowerCase().includes(lowercasedSearch);
      const matchesCategory = Object.keys(group.answersByCategory).some((category) =>
        category.toLowerCase().includes(lowercasedSearch)
      );
      return matchesUserName || matchesCategory;
    });
    setFilteredAnswers(filtered);
  }, [search, groupedAnswers, filtersSubmitted]);

  // Format created_at date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate and download PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    // Set document title
    doc.setFontSize(16);
    doc.text('Sellers Marks Report', margin, 20);

    // Add filter information
    doc.setFontSize(12);
    let yOffset = 30;
    const filters = [
      userId ? `User: ${users.find(u => u.user_id === parseInt(userId))?.name || 'Unknown'}` : null,
      itemCategory !== 'all' ? `Category: ${itemCategory}` : null,
      fromDate ? `From Date: ${formatDate(fromDate)}` : null,
      toDate ? `To Date: ${formatDate(toDate)}` : null,
    ].filter(Boolean);
    doc.text('Filters Applied:', margin, yOffset);
    yOffset += 6;
    doc.setFontSize(10);
    filters.forEach(filter => {
      doc.text(filter || '', margin + 5, yOffset);
      yOffset += 5;
    });
    yOffset += 5;

    // Generate table for each user and category
    filteredAnswers.forEach((group) => {
      // User header
      doc.setFontSize(14);
      doc.text(`User: ${group.user.name}`, margin, yOffset);
      yOffset += 8;

      Object.entries(group.answersByCategory).forEach(([category, { answers }]) => {
        // Category header
        doc.setFontSize(12);
        doc.text(`Category: ${category}`, margin, yOffset);
        yOffset += 6;

        // Table for answers
        const tableData = answers.map((answer) => [
          answer.question?.question_category?.join(', ') || 'N/A',
          formatDate(answer.question.created_at),
          answer.category_answers
            ? answer.category_answers.map((ca) => `${ca.category}: ${ca.answer}`).join('; ')
            : 'No answers provided',
          answer.total_marks?.toString() || 'N/A',
          formatDate(answer.created_at),
        ]);

        (doc as any).autoTable({
          startY: yOffset,
          head: [['Questions', 'Question Created At', 'Marks', 'Total Marks', 'Answer Created At']],
          body: tableData,
          theme: 'striped',
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
          },
          columnStyles: {
            0: { cellWidth: maxWidth * 0.25 },
            1: { cellWidth: maxWidth * 0.15 },
            2: { cellWidth: maxWidth * 0.25 },
            3: { cellWidth: maxWidth * 0.15 },
            4: { cellWidth: maxWidth * 0.15 },
          },
        });

        yOffset = (doc as any).lastAutoTable.finalY + 10;
      });

      yOffset += 10;
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save('sellers_marks_report.pdf');
  };

  // Render loading state for dropdowns
  if (dropdownLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading filters...</p>
        </div>
      </div>
    );
  }

  // Render main UI
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
          Sellers Marks Report
        </h2>
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Filters</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={`${category.item_id}-${index}`} value={category.item_category}>
                  {category.item_category}
                </option>
              ))}
            </select>
            <select
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="">Select From Date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <select
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="">Select To Date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <button
              onClick={handleFilterSubmit}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 w-full sm:w-auto"
            >
              Search Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading answers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <p className="text-red-500 text-lg font-semibold">{error}</p>
              <button
                onClick={handleFilterSubmit}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !filtersSubmitted ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
            Please apply filters to view marks.
          </p>
        ) : filteredAnswers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg font-medium animate-fade-in">
            No marks found for the selected filters.
          </p>
        ) : (
          <>
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
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Print PDF
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {filteredAnswers.map((group, index) => (
                <div
                  key={`user-${group.user.user_id}-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 w-full transform hover:shadow-xl transition-all duration-300 animate-fade-in"
                >
                  <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                    {group.user.name}
                  </h3>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {Object.entries(group.answersByCategory).map(([category, { answers }], catIndex) => (
                      <div key={`${category}-${catIndex}`} className="mb-4">
                        <div className="mb-2">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {category}
                          </h4>
                        </div>
                        {answers.map((answer, answerIndex) => (
                          <div key={answer.answer_id}>
                            <div
                              className="flex flex-row items-center gap-6 flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-2"
                            >
                              <div className="min-w-[150px]">
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
                                  : 'No marks provided'}
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="min-w-[100px]">
                                  <strong>Total Marks:</strong> {answer.total_marks ?? 'N/A'}
                                </div>
                                <div className="text-sm text-red-600 font-medium">
                                  Marks Created At: {formatDate(answer.created_at)}
                                </div>
                              </div>
                            </div>
                            <hr className="my-2 border-t-2 border-blue-900" />
                          </div>
                        ))}
                        {catIndex < Object.keys(group.answersByCategory).length - 1 && (
                          <hr className="my-4 border-t-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserAnswers;