import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from "../../axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  item_id: number;
  item_category: string;
}

export default function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    status: 'is_active',
    nida: '',
    address: '',
    sex: '',
    date_of_birth: '',
    contact: '',
    auto_number: '',
    item_id: ''
  });
  const [errors, setErrors] = useState({
    name: '', email: '', password: '', role_id: '', status: '',
    nida: '', address: '', sex: '', date_of_birth: '', contact: '',
    auto_number: '', item_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [roleResponse, itemResponse] = await Promise.all([
          axiosInstance.get('/api/roles/dropdown-options'),
          axiosInstance.get('/api/item/by-dropdown')
        ]);
        setRoles(roleResponse.data || []);
        setItems(itemResponse.data || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load dropdown options', { position: "top-right" });
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '', email: '', password: '', role_id: '', status: '',
      nida: '', address: '', sex: '', date_of_birth: '', contact: '',
      auto_number: '', item_id: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must not exceed 255 characters';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
      isValid = false;
    }

    if (formData.nida && formData.nida.length > 255) {
      newErrors.nida = 'NIDA must not exceed 255 characters';
      isValid = false;
    }

    if (formData.address && formData.address.length > 255) {
      newErrors.address = 'Address must not exceed 255 characters';
      isValid = false;
    }

    if (formData.sex && !['male', 'female', 'other'].includes(formData.sex)) {
      newErrors.sex = 'Sex must be male, female, or other';
      isValid = false;
    }

    if (formData.date_of_birth && isNaN(Date.parse(formData.date_of_birth))) {
      newErrors.date_of_birth = 'Invalid date of birth';
      isValid = false;
    }

    if (formData.contact && formData.contact.length > 255) {
      newErrors.contact = 'Contact must not exceed 255 characters';
      isValid = false;
    }

    if (formData.auto_number && formData.auto_number.length > 255) {
      newErrors.auto_number = 'Auto number must not exceed 255 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: parseInt(formData.role_id),
        status: formData.status,
        nida: formData.nida || null,
        address: formData.address || null,
        sex: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        contact: formData.contact || null,
        auto_number: formData.auto_number || null,
        item_id: formData.item_id === 'others' ? 'others' : (formData.item_id ? parseInt(formData.item_id) : null)
      };

      const apiCall = axiosInstance.post('/api/auth/add-user', payload);
      const [response] = await Promise.all([apiCall, minLoadingTime]);

      if (response.status === 201 || response.status === 200) {
        toast.success(response.data.message || 'User created successfully', { position: "top-right" });
        setTimeout(() => navigate('/users'), 3000);
      }
    } catch (error: any) {
      const errorResponse = error.response?.data;
      if (errorResponse?.errors) {
        setErrors(prev => ({ ...prev, ...errorResponse.errors }));
      }
      const errorMessage = errorResponse?.message || 'Failed to create user';
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: "70px" }} closeOnClick pauseOnHover draggable draggablePercent={60} hideProgressBar closeButton />
      <div className="border border-gray-200 dark:border-gray-800 w-full lg:p-6 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg text-gray-800">Create New User</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`} placeholder="Enter user name" maxLength={255} />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`} placeholder="Enter user email" maxLength={255} />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`} placeholder="Enter password" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role *</label>
            <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.role_id ? 'border-red-500' : ''}`}>
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>{role.category}</option>
              ))}
            </select>
            {errors.role_id && <p className="mt-1 text-sm text-red-500">{errors.role_id}</p>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.status ? 'border-red-500' : ''}`}>
              <option value="">Select status</option>
              <option value="is_active">Is Active</option>
              <option value="not_active">Not Active</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
          </div>
          <div>
            <label htmlFor="nida" className="block text-sm font-medium text-gray-700">NIDA</label>
            <input type="text" id="nida" name="nida" value={formData.nida} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.nida ? 'border-red-500' : ''}`} placeholder="Enter NIDA" maxLength={255} />
            {errors.nida && <p className="mt-1 text-sm text-red-500">{errors.nida}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.address ? 'border-red-500' : ''}`} placeholder="Enter address" maxLength={255} />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
            <select id="sex" name="sex" value={formData.sex} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.sex ? 'border-red-500' : ''}`}>
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.sex && <p className="mt-1 text-sm text-red-500">{errors.sex}</p>}
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.date_of_birth ? 'border-red-500' : ''}`} />
            {errors.date_of_birth && <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
            <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.contact ? 'border-red-500' : ''}`} placeholder="Enter contact" maxLength={255} />
            {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
          </div>
          <div>
            <label htmlFor="auto_number" className="block text-sm font-medium text-gray-700">Auto Number</label>
            <input type="text" id="auto_number" name="auto_number" value={formData.auto_number} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.auto_number ? 'border-red-500' : ''}`} placeholder="Enter auto number" maxLength={255} />
            {errors.auto_number && <p className="mt-1 text-sm text-red-500">{errors.auto_number}</p>}
          </div>
          <div>
            <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">Item</label>
            <select id="item_id" name="item_id" value={formData.item_id} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.item_id ? 'border-red-500' : ''}`}>
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>{item.item_category}</option>
              ))}
              <option value="others">Others</option>
            </select>
            {errors.item_id && <p className="mt-1 text-sm text-red-500">{errors.item_id}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md">Cancel</button>
            <button type="submit" disabled={loading} className={`relative px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : ('Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}