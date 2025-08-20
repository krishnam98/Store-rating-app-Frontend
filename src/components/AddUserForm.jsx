import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, MapPin, UserCheck } from 'lucide-react';
import { apiCall } from '../utils/api';

const AddUserForm = ({ isOpen, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'normal_user'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) return 'Name is required';
        if (name.length < 20) return 'Name must be at least 10 characters long';
        if (name.length > 60) return 'Name must not exceed 60 characters';
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (password.length > 16) return 'Password must not exceed 16 characters';
        if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Password must include at least one special character';
        }
        return '';
    };

    const validateAddress = (address) => {
        if (address.length > 400) return 'Address must not exceed 400 characters';
        return '';
    };

    const validateRole = (role) => {
        const validRoles = ['admin', 'store_owner', 'user'];
        if (!validRoles.includes(role)) return 'Please select a valid role';
        return '';
    };

    // Handle input changes with real-time validation
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear previous errors and validate
        let fieldError = '';
        switch (field) {
            case 'name':
                fieldError = validateName(value);
                break;
            case 'email':
                fieldError = validateEmail(value);
                break;
            case 'password':
                fieldError = validatePassword(value);
                break;
            case 'address':
                fieldError = validateAddress(value);
                break;
            case 'role':
                fieldError = validateRole(value);
                break;
        }

        setErrors(prev => ({ ...prev, [field]: fieldError }));
        setSubmitError('');
        setSubmitSuccess('');
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            address: validateAddress(formData.address),
            role: validateRole(formData.role)
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // API call to add user
            const response = await apiCall('/admin/addUser', {
                method: 'POST',
                body: formData,

            });

            setSubmitSuccess('User added successfully!');

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                address: '',
                role: 'normal_user'
            });
            setErrors({});

            // Notify parent component
            if (onUserAdded) {
                onUserAdded(response.user);
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
                setSubmitSuccess('');
            }, 1500);

        } catch (error) {
            console.error('Failed to add user:', error);
            setSubmitError(error.message || 'Failed to add user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            address: '',
            role: 'normal_user'
        });
        setErrors({});
        setSubmitError('');
        setSubmitSuccess('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {submitSuccess}
                        </div>
                    )}

                    {/* Error Message */}
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {submitError}
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter full name (10-60 characters)"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        <p className="text-xs text-gray-500 mt-1">{formData.name.length}/60 characters</p>
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter email address"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter password (8-16 characters)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                            Must include uppercase letter and special character
                        </p>
                    </div>

                    {/* Role Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <UserCheck className="w-4 h-4 inline mr-2" />
                            Role *
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="normal_user">Normal User</option>
                            <option value="store_owner">Store Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                    </div>

                    {/* Address Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter address (optional, max 400 characters)"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        <p className="text-xs text-gray-500 mt-1">{formData.address.length}/400 characters</p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting || Object.values(errors).some(error => error !== '')
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserForm;