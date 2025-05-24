import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useGlobalFilter, usePagination, Column, Row } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface QuestionData {
  question_id: number;
  item_id: number;
  question_category: string[];
  choice: string[];
  marks_caryy_that_choice: number[];
  marks_per_choice_attempted: {
    user_id: number | null;
    choice_index: number;
    marks: number;
    attempted_at: string;
  }[];
  user_id: (number | null)[];
  employee_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  item_category: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  } catch {
    return 'N/A';
  }
};

const ActionButtons: React.FC<{ questionId: number }> = ({ questionId }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/questions/${questionId}`);
      toast.success(response.data.message || 'Question deleted successfully', { position: 'top-right' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete question', { position: 'top-right' });
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Link to={`/edit-question/${questionId}`} className="p-1 text-blue-500 hover:text-blue-600">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Questions: React.FC = () => {
  const [data, setData] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string>(''); // State for item_id input
  const [items, setItems] = useState<{ item_id: number; item_category: string }[]>([]); // State for item list

  // Fetch available items for dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get<{ data: { item_id: number; item_category: string }[] }>('/api/items'); // Adjust endpoint as needed
        setItems(response.data.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch items', { position: 'top-right' });
      }
    };
    fetchItems();
  }, []);

  // Fetch questions based on item_id or all questions if no item_id
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const endpoint = itemId ? `/api/questions/item/${itemId}` : '/api/questions';
        const response = await axiosInstance.get<{ data: QuestionData[] }>(endpoint);
        setData(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch questions');
        toast.error('Failed to fetch questions', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [itemId]);

  const columns: Column<QuestionData>[] = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'count' as any,
        Cell: ({ row }: { row: Row<QuestionData> }) => <span>{row.index + 1}</span>,
        width: 60,
        minWidth: 50
      },
      {
        Header: 'Item Category',
        accessor: 'item_category',
        width: 150,
        minWidth: 120
      },
      {
        Header: 'Question Categories',
        accessor: 'question_category',
        Cell: ({ value }: { value: string[] }) => {
          const joined = value.join(', ');
          return (
            <div className="max-w-[200px] sm:max-w-[300px] break-words whitespace-normal">
              {joined}
            </div>
          );
        },
        width: 200,
        minWidth: 150
      },
      {
        Header: 'Choices',
        accessor: 'choice',
        Cell: ({ value }: { value: string[] }) => {
          const joined = value.join(', ');
          return (
            <div className="max-w-[200px] sm:max-w-[300px] break-words whitespace-normal">
              {joined}
            </div>
          );
        },
        width: 200,
        minWidth: 150
      },
      {
        Header: 'Marks per Choice',
        accessor: 'marks_caryy_that_choice',
        Cell: ({ value }: { value: number[] }) => {
          const joined = value.join(', ');
          return (
            <div className="max-w-[200px] sm:max-w-[300px] break-words whitespace-normal">
              {joined}
            </div>
          );
        },
        width: 150,
        minWidth: 120
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }: { value: string }) => formatDate(value),
        width: 120,
        minWidth: 100
      },
      {
        Header: 'Actions',
        accessor: 'question_id',
        Cell: ({ value }: { value: number }) => <ActionButtons questionId={value} />,
        width: 100,
        minWidth: 80
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable<QuestionData>(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10
      }
    },
    useGlobalFilter,
    usePagination
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Questions Data', 14, 10);
    autoTable(doc, {
      head: [['#', 'Item Category', 'Question Categories', 'Choices', 'Marks per Choice', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.item_category,
        row.question_category.join(', '),
        row.choice.join(', '),
        row.marks_caryy_that_choice.join(', '),
        formatDate(row.created_at)
      ]),
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
        4: { cellWidth: 40 },
        5: { cellWidth: 30 }
      }
    });
    doc.save('questions_data.pdf');
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Item_Category: row.item_category,
        Question_Categories: row.question_category.join(', '),
        Choices: row.choice.join(', '),
        Marks_per_Choice: row.marks_caryy_that_choice.join(', '),
        Created_At: formatDate(row.created_at),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    XLSX.writeFile(workbook, 'questions_data.xlsx');
    toast.success('Excel exported successfully');
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-full mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ top: '70px' }}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Questions Management</h2>
          <Link
            to="/create-question"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Question
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            >
              <option value="">All Questions</option>
              {items.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_category} (ID: {item.item_id})
                </option>
              ))}
            </select>
            <input
              value={globalFilter || ''}
              onChange={(iotics) => setGlobalFilter(e.target.value)}
              placeholder="Search questions..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border-collapse">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                      style={{
                        minWidth: column.minWidth,
                        width: column.width
                      }}
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50">
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        className="px-3 py-4 text-sm text-gray-900 border-b"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
            >
              Next
            </button>
          </div>
          <span className="text-sm text-gray-700">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 10, 20, 30, 50].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Questions;