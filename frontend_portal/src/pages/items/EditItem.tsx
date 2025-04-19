import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
  created_at?: string;
}

// Utility function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return 'N/A';
  }
};

export default function EditItem() {
  const navigate = useNavigate();
  const { itemId }: { itemId: string } = useParams();
  const [formData, setFormData] = useState({
    item_category: '',
    created_at: ''
  });
  const [errors, setErrors] = useState({
    item_category: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axiosInstance.get(`/api/items/${itemId}`);
        const item = response.data.item;
        if (item) {
          setFormData({
            item_category: item.item_category || '',
            created_at: item.created_at || ''
          });
        } else {
          toast.error('Item not found');
          navigate('/items');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch item';
        toast.error(errorMessage);
        navigate('/items');
      }
    };
    fetchItem();
  }, [itemId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { item_category: '' };

    if (!formData.item_category.trim()) {
      newErrors.item_category = 'Item category is required';
      isValid = false;
    } else if (formData.item_category.length > 255) {
      newErrors.item_category = 'Item category must not exceed 255 characters';
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
      const payload = { item_category: formData.item_category };
      const response = await axiosInstance.put(`/api/items/${itemId}`, payload);
      if (response.status === 200) {
        toast.success(response.data.message || 'Item updated successfully');
        setTimeout(() => navigate('/items'), 3000);
      }
    } catch (error: any) {
      const errorResponse = error.response?.data;
      if (errorResponse?.errors) {
        setErrors(prev => ({ ...prev, ...errorResponse.errors }));
      }
      const errorMessage = errorResponse?.message || 'Failed to update item';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} closeOnClick pauseOnHover draggable draggablePercent={60} hideProgressBar closeButton />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg mb-6">Edit Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="item_category" className="block text-sm font-medium text-gray-700">Item Category *</label>
            <input
              type="text"
              name="item_category"
              value={formData.item_category}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.item_category ? 'border-red-500' : 'border-gray-300'}`}
              required
              maxLength={255}
            />
            {errors.item_category && <p className="mt-1 text-sm text-red-500">{errors.item_category}</p>}
          </div>
          <div>
            <label htmlFor="created_at" className="block text-sm font-medium text-gray-700">Created At</label>
            <input
              type="text"
              name="created_at"
              value={formatDate(formData.created_at)}
              className="w-full p-2 border rounded-md border-gray-300 bg-gray-100"
              disabled
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}