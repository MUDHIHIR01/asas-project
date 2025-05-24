import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
}

interface User {
  id: number;
  name: string;
}

interface Choice {
  text: string;
  marks: string;
}

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_id: '',
    question_category: [''],
    choice: [''],
    marks_caryy_that_choice: [''],
    employee_id: ''
  });
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState({
    item_id: '',
    question_category: [] as string[],
    choice: [] as string[],
    marks_caryy_that_choice: [] as string[],
    employee_id: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch items and users for dropdowns
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get('/api/items');
        setItems(response.data.items || []);
      } catch (error: any) {
        toast.error('Failed to fetch items', { position: 'top-right' });
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users'); // Adjust endpoint as needed
        setUsers(response.data.users || []);
      } catch (error: any) {
        toast.error('Failed to fetch users', { position: 'top-right' });
      }
    };

    fetchItems();
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number, field?: string) => {
    const { name, value } = e.target;
    if (field === 'question_category' && index !== undefined) {
      const newCategories = [...formData.question_category];
      newCategories[index] = value;
      setFormData(prev => ({ ...prev, question_category: newCategories }));
      const newErrors = [...errors.question_category];
      newErrors[index] = '';
      setErrors(prev => ({ ...prev, question_category: newErrors }));
    } else if (field === 'choice' && index !== undefined) {
      const newChoices = [...formData.choice];
      newChoices[index] = value;
      setFormData(prev => ({ ...prev, choice: newChoices }));
      const newErrors = [...errors.choice];
      newErrors[index] = '';
      setErrors(prev => ({ ...prev, choice: newErrors }));
    } else if (field === 'marks_caryy_that_choice' && index !== undefined) {
      const newMarks = [...formData.marks_caryy_that_choice];
      newMarks[index] = value;
      setFormData(prev => ({ ...prev, marks_caryy_that_choice: newMarks }));
      const newErrors = [...errors.marks_caryy_that_choice];
      newErrors[index] = '';
      setErrors(prev => ({ ...prev, marks_caryy_that_choice: newErrors }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addCategoryInput = () => {
    setFormData(prev => ({
      ...prev,
      question_category: [...prev.question_category, '']
    }));
    setErrors(prev => ({
      ...prev,
      question_category: [...prev.question_category, '']
    }));
  };

  const removeCategoryInput = (index: number) => {
    setFormData(prev => ({
      ...prev,
      question_category: prev.question_category.filter((_, i) => i !== index)
    }));
    setErrors(prev => ({
      ...prev,
      question_category: prev.question_category.filter((_, i) => i !== index)
    }));
  };

  const addChoiceInput = () => {
    setFormData(prev => ({
      ...prev,
      choice: [...prev.choice, ''],
      marks_caryy_that_choice: [...prev.marks_caryy_that_choice, '']
    }));
    setErrors(prev => ({
      ...prev,
      choice: [...prev.choice, ''],
      marks_caryy_that_choice: [...prev.marks_caryy_that_choice, '']
    }));
  };

  const removeChoiceInput = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choice: prev.choice.filter((_, i) => i !== index),
      marks_caryy_that_choice: prev.marks_caryy_that_choice.filter((_, i) => i !== index)
    }));
    setErrors(prev => ({
      ...prev,
      choice: prev.choice.filter((_, i) => i !== index),
      marks_caryy_that_choice: prev.marks_caryy_that_choice.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      item_id: '',
      question_category: new Array(formData.question_category.length).fill(''),
      choice: new Array(formData.choice.length).fill(''),
      marks_caryy_that_choice: new Array(formData.marks_caryy_that_choice.length).fill(''),
      employee_id: ''
    };

    if (!formData.item_id) {
      newErrors.item_id = 'Item is required';
      isValid = false;
    }

    formData.question_category.forEach((category, index) => {
      if (!category.trim()) {
        newErrors.question_category[index] = 'Question category is required';
        isValid = false;
      } else if (category.length > 255) {
        newErrors.question_category[index] = 'Question category must not exceed 255 characters';
        isValid = false;
      }
    });

    formData.choice.forEach((choice, index) => {
      if (!choice.trim()) {
        newErrors.choice[index] = 'Choice is required';
        isValid = false;
      } else if (choice.length > 255) {
        newErrors.choice[index] = 'Choice must not exceed 255 characters';
        isValid = false;
      }
    });

    formData.marks_caryy_that_choice.forEach((marks, index) => {
      if (!marks.trim()) {
        newErrors.marks_caryy_that_choice[index] = 'Marks are required';
        isValid = false;
      } else if (isNaN(Number(marks)) || Number(marks) < 0) {
        newErrors.marks_caryy_that_choice[index] = 'Marks must be a non-negative number';
        isValid = false;
      }
    });

    if (formData.choice.length !== formData.marks_caryy_that_choice.length) {
      newErrors.marks_caryy_that_choice[0] = 'Number of marks must match number of choices';
      isValid = false;
    }

    if (formData.employee_id && !users.some(user => user.id === Number(formData.employee_id))) {
      newErrors.employee_id = 'Invalid employee selected';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        item_id: parseInt(formData.item_id),
        question_category: formData.question_category.filter(category => category.trim()),
        choice: formData.choice.filter(choice => choice.trim()),
        marks_caryy_that_choice: formData.marks_caryy_that_choice.map(marks => Number(marks)).filter(marks => !isNaN(marks)),
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null
      };
      const response = await axiosInstance.post('/api/questions', payload);
      if (response.status === 201) {
        toast.success(response.data.message || 'Question created successfully', { position: 'top-right' });
        setTimeout(() => navigate('/questions'), 3000);
      }
    } catch (error: any) {
      const errorResponse = error.response?.data;
      if (errorResponse?.errors) {
        setErrors(prev => ({
          ...prev,
          item_id: errorResponse.errors.item_id?.[0] || '',
          question_category: errorResponse.errors['question_category']?.map((_: any, i: number) => errorResponse.errors[`question_category.${i}`]?.[0] || '') || prev.question_category,
          choice: errorResponse.errors['choice']?.map((_: any, i: number) => errorResponse.errors[`choice.${i}`]?.[0] || '') || prev.choice,
          marks_caryy_that_choice: errorResponse.errors['marks_caryy_that_choice']?.map((_: any, i: number) => errorResponse.errors[`marks_caryy_that_choice.${i}`]?.[0] || '') || prev.marks_caryy_that_choice,
          employee_id: errorResponse.errors.employee_id?.[0] || ''
        }));
      }
      const errorMessage = errorResponse?.message || 'Failed to create question';
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} closeOnClick pauseOnHover draggable draggablePercent={60} hideProgressBar closeButton />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg mb-6">Create Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">Item *</label>
            <select
              name="item_id"
              value={formData.item_id}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.item_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select an item</option>
              {items.map(item => (
                <option key={item.item_id} value={item.item_id}>{item.item_category}</option>
              ))}
            </select>
            {errors.item_id && <p className="mt-1 text-sm text-red-500">{errors.item_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Categories *</label>
            {formData.question_category.map((category, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  name="question_category"
                  value={category}
                  onChange={(e) => handleInputChange(e, index, 'question_category')}
                  className={`w-full p-2 border rounded-md ${errors.question_category[index] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={`Category ${index + 1}`}
                  maxLength={255}
                />
                {formData.question_category.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategoryInput(index)}
                    className="p-2 text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {errors.question_category[index] && <p className="mt-1 text-sm text-red-500">{errors.question_category[index]}</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={addCategoryInput}
              className="mt-2 text-blue-500 hover:text-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Choices and Marks *</label>
            {formData.choice.map((choice, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  name="choice"
                  value={choice}
                  onChange={(e) => handleInputChange(e, index, 'choice')}
                  className={`w-full p-2 border rounded-md ${errors.choice[index] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={`Choice ${index + 1}`}
                  maxLength={255}
                />
                <input
                  type="number"
                  name="marks_caryy_that_choice"
                  value={formData.marks_caryy_that_choice[index]}
                  onChange={(e) => handleInputChange(e, index, 'marks_caryy_that_choice')}
                  className={`w-24 p-2 border rounded-md ${errors.marks_caryy_that_choice[index] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Marks"
                  min="0"
                />
                {formData.choice.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChoiceInput(index)}
                    className="p-2 text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <div className="w-full">
                  {errors.choice[index] && <p className="mt-1 text-sm text-red-500">{errors.choice[index]}</p>}
                  {errors.marks_caryy_that_choice[index] && <p className="mt-1 text-sm text-red-500">{errors.marks_caryy_that_choice[index]}</p>}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addChoiceInput}
              className="mt-2 text-blue-500 hover:text-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Choice
            </button>
          </div>
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">Employee (Optional)</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.employee_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select an employee</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.employee_id && <p className="mt-1 text-sm text-red-500">{errors.employee_id}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}