import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Item {
  item_id: number;
  item_category: string;
}

export default function EditUser() {
  const navigate = useNavigate();
  const { userId }: { userId: string } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "",
    role_id: "",
    password: "",
    nida: "",
    address: "",
    sex: "",
    date_of_birth: "",
    contact: "",
    auto_number: "",
    item_id: "",
    custom_item: "" // New field for custom item when "Others" is selected
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    status: "",
    role_id: "",
    password: "",
    nida: "",
    address: "",
    sex: "",
    date_of_birth: "",
    contact: "",
    auto_number: "",
    item_id: "",
    custom_item: ""
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, roleResponse, itemResponse] = await Promise.all([
          axiosInstance.get(`/api/all/users`),
          axiosInstance.get('/api/roles/dropdown-options'),
          axiosInstance.get('/api/item/by-dropdown')
        ]);

        const user = userResponse.data.users.find((u: any) => u.user_id === parseInt(userId || ""));
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            status: user.status,
            role_id: "",
            password: "",
            nida: user.nida || "",
            address: user.address || "",
            sex: user.sex || "",
            date_of_birth: user.date_of_birth || "",
            contact: user.contact || "",
            auto_number: user.auto_number || "",
            item_id: user.item_id ? user.item_id.toString() : "",
            custom_item: ""
          });
        }

        setRoles(roleResponse.data || []);
        setItems(itemResponse.data || []);

        if (user) {
          const role = roleResponse.data.find((r: any) => r.category === user.role);
          setFormData(prev => ({
            ...prev,
            role_id: role ? role.role_id.toString() : ""
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch user data or dropdown options");
        navigate("/users");
      }
    };
    fetchData();
  }, [userId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "", email: "", status: "", role_id: "", password: "",
      nida: "", address: "", sex: "", date_of_birth: "", contact: "",
      auto_number: "", item_id: "", custom_item: ""
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length > 255) {
      newErrors.name = "Name must not exceed 255 characters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must not exceed 255 characters";
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    } else if (formData.status.length > 255) {
      newErrors.status = "Status must not exceed 255 characters";
      isValid = false;
    }

    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
      isValid = false;
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.nida && formData.nida.length > 255) {
      newErrors.nida = "NIDA must not exceed 255 characters";
      isValid = false;
    }

    if (formData.address && formData.address.length > 255) {
      newErrors.address = "Address must not exceed 255 characters";
      isValid = false;
    }

    if (formData.sex && !['male', 'female', 'other'].includes(formData.sex)) {
      newErrors.sex = "Sex must be male, female, or other";
      isValid = false;
    }

    if (formData.date_of_birth && isNaN(Date.parse(formData.date_of_birth))) {
      newErrors.date_of_birth = "Invalid date of birth";
      isValid = false;
    }

    if (formData.contact && formData.contact.length > 255) {
      newErrors.contact = "Contact must not exceed 255 characters";
      isValid = false;
    }

    if (formData.auto_number && formData.auto_number.length > 255) {
      newErrors.auto_number = "Auto number must not exceed 255 characters";
      isValid = false;
    }

    if (formData.item_id === 'others' && !formData.custom_item.trim()) {
      newErrors.custom_item = "Custom item category is required when Others is selected";
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
        name: formData.name,
        email: formData.email,
        status: formData.status,
        role_id: parseInt(formData.role_id),
        nida: formData.nida || null,
        address: formData.address || null,
        sex: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        contact: formData.contact || null,
        auto_number: formData.auto_number || null,
        item_id: formData.item_id && formData.item_id !== 'others' ? parseInt(formData.item_id) : null,
        ...(formData.password && { password: formData.password })
      };

      const response = await axiosInstance.put(`/api/update-user/${userId}`, payload);
      if (response.status === 200) {
        toast.success(response.data.message || "User updated successfully");
        setTimeout(() => navigate("/users"), 3000);
      }
    } catch (error: any) {
      const errorResponse = error.response?.data;
      if (errorResponse?.errors) {
        setErrors(prev => ({ ...prev, ...errorResponse.errors }));
      }
      const errorMessage = errorResponse?.message || "Failed to update user";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: "70px" }} closeOnClick pauseOnHover draggable draggablePercent={60} hideProgressBar closeButton />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg mb-6">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`} required maxLength={255} />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} required maxLength={255} />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.status ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select status</option>
              <option value="is_active">Is Active</option>
              <option value="not_active">Not Active</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
          </div>
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role *</label>
            <select name="role_id" value={formData.role_id} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.role_id ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select a role</option>
              {roles.map((role: any) => (
                <option key={role.role_id} value={role.role_id}>{role.category}</option>
              ))}
            </select>
            {errors.role_id && <p className="mt-1 text-sm text-red-500">{errors.role_id}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter new password (optional)" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="nida" className="block text-sm font-medium text-gray-700">NIDA</label>
            <input type="text" name="nida" value={formData.nida} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.nida ? 'border-red-500' : 'border-gray-300'}`} maxLength={255} />
            {errors.nida && <p className="mt-1 text-sm text-red-500">{errors.nida}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`} maxLength={255} />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
            <select name="sex" value={formData.sex} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.sex ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.sex && <p className="mt-1 text-sm text-red-500">{errors.sex}</p>}
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.date_of_birth && <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.contact ? 'border-red-500' : 'border-gray-300'}`} maxLength={255} />
            {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
          </div>
          <div>
            <label htmlFor="auto_number" className="block text-sm font-medium text-gray-700">Auto Number</label>
            <input type="text" name="auto_number" value={formData.auto_number} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.auto_number ? 'border-red-500' : 'border-gray-300'}`} maxLength={255} />
            {errors.auto_number && <p className="mt-1 text-sm text-red-500">{errors.auto_number}</p>}
          </div>
          <div>
            <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">Item</label>
            <select name="item_id" value={formData.item_id} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.item_id ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>{item.item_category}</option>
              ))}
              <option value="others">Others</option>
            </select>
            {errors.item_id && <p className="mt-1 text-sm text-red-500">{errors.item_id}</p>}
          </div>
          {formData.item_id === 'others' && (
            <div>
              <label htmlFor="custom_item" className="block text-sm font-medium text-gray-700">Custom Item Category *</label>
              <input
                type="text"
                id="custom_item"
                name="custom_item"
                value={formData.custom_item}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.custom_item ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter custom item category"
                maxLength={255}
              />
              {errors.custom_item && <p className="mt-1 text-sm text-red-500">{errors.custom_item}</p>}
            </div>
          )}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate("/users")} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Cancel</button>
            <button type="submit" disabled={loading} className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}