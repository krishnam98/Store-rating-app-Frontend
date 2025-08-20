import React, { useState, useEffect, useRef } from 'react';
import { X, Search, User, AlertCircle, Check } from 'lucide-react';
import { apiCall } from '../utils/api';

const AddStoreForm = ({ isOpen, onClose, onStoreAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        ownerId: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [showUserList, setShowUserList] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form when opened
            setFormData({ name: '', email: '', address: '', ownerId: '' });
            setErrors({});
            setSelectedOwner(null);
            setSearchTerm('');
            setUsers([]);
            setShowUserList(false);
        }
    }, [isOpen]);

    // Debounced search function
    useEffect(() => {
        if (searchTerm.trim() && !selectedOwner) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                searchUsers(searchTerm);
            }, 300);
        } else {
            setUsers([]);
            setShowUserList(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, selectedOwner]);

    const searchUsers = async (term) => {
        setSearchLoading(true);
        try {
            const params = new URLSearchParams();

            // Add search parameters - you can customize this based on your API
            if (term.includes('@')) {
                params.append('email', term);
            } else {
                params.append('name', term);
            }

            const data = await apiCall(`/admin/getUsers?${params.toString()}`);
            setUsers(data.Users || []);
            setShowUserList(true);
        } catch (err) {
            console.error('Failed to search users:', err);
            setUsers([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // If there was a selected owner and user is typing, clear the selection
        if (selectedOwner) {
            setSelectedOwner(null);
            setFormData(prev => ({ ...prev, ownerId: '' }));
            setErrors(prev => ({ ...prev, owner: '' }));
        }
    };

    const handleUserSelect = (user) => {
        // Check if user is store_owner and doesn't have a store assigned
        if (user.role !== 'store_owner') {
            setErrors(prev => ({
                ...prev,
                owner: 'Only store owners can be assigned to stores.'
            }));
            return;
        }

        if (user.Store) {
            setErrors(prev => ({
                ...prev,
                owner: 'This store owner already has a store assigned.'
            }));
            return;
        }

        setSelectedOwner(user);
        setFormData(prev => ({ ...prev, ownerId: user.id }));
        setSearchTerm(`${user.name} (${user.email})`);
        setShowUserList(false);
        setErrors(prev => ({ ...prev, owner: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Store name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.ownerId) {
            newErrors.owner = 'Please select a store owner';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const newStore = await apiCall('/admin/addStore', {
                method: 'POST',
                body: formData
            });

            onStoreAdded(newStore.store);
            onClose();
        } catch (err) {
            console.error('Failed to create store:', err);
            setErrors({ submit: 'Failed to create store. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add New Store</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 relative">
                            {/* Store Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Store Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter store name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter store email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address *
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter store address"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* Store Owner Search */}
                            <div className="relative">
                                <label htmlFor="owner-search" className="block text-sm font-medium text-gray-700">
                                    Store Owner *
                                </label>
                                <div className="relative mt-1">
                                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        id="owner-search"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.owner ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Search for store owner..."
                                    />
                                    {searchLoading && (
                                        <div className="absolute right-3 top-3">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>

                                {/* User List - positioned inside form with proper z-index */}
                                {showUserList && (
                                    <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                        {users.length > 0 ? users.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${user.role !== 'store_owner' || user.Store ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900">{user.name}</span>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'store_owner' ? 'bg-green-100 text-green-800' :
                                                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {user.role.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        {user.role === 'store_owner' && user.Store && (
                                                            <p className="text-xs text-red-500 mt-1">Already has a store assigned</p>
                                                        )}
                                                        {user.role !== 'store_owner' && (
                                                            <p className="text-xs text-gray-500 mt-1">Not a store owner</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : !searchLoading && (
                                            <div className="py-2">
                                                <p className="text-center text-gray-500">No users found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedOwner && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center">
                                        <Check className="w-4 h-4 text-green-600 mr-2" />
                                        <span className="text-sm text-green-800">
                                            Selected: {selectedOwner.name} ({selectedOwner.email})
                                        </span>
                                    </div>
                                )}

                                {errors.owner && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.owner}
                                    </p>
                                )}
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Store'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStoreForm;