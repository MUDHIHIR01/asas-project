import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
}

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_id: '',
    question_category: [''] // Start with one empty input
  });
  const [items, setItems] = useState<Item[]>([]);
  const [errors, setErrors] = useState({
    item_id: '',
    question_category: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  // Fetch items for dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get('/api/items');
        setItems(response.data.items || []);
      } catch (error: any) {
        toast.error('Failed to fetch items', { position: 'top-right' });
      }
    };
    fetchItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target;
    if (name === 'question_category' && index !== undefined) {
      const newCategories = [...formData.question_category];
      newCategories[index] = value;
      setFormData(prev => ({ ...prev, question_category: newCategories }));
      const newErrors = [...errors.question_category];
      newErrors[index] = '';
      setErrors(prev => ({ ...prev, question_category: newErrors }));
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      item_id: '',
      question_category: new Array(formData.question_category.length).fill('')
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
        question_category: formData.question_category.filter(category => category.trim())
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
          question_category: errorResponse.errors['question_category']?.map((_: any, i: number) => errorResponse.errors[`question_category.${i}`]?.[0] || '') || prev.question_category
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
                  onChange={(e) => handleInputChange(e, index)}
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