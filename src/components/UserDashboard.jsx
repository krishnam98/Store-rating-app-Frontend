import React, { useState, useEffect } from 'react';
import { LogOut, Search, Edit2 } from 'lucide-react';
import { apiCall } from '../utils/api';
import StarRating from './StarRating';
import { useAuth } from '../AuthContext/AuthContextProvider';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    console.log('User:', user);

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/store/getStores');
            console.log('Stores:', data.stores);
            setStores(data.stores || []);
        } catch (err) {
            console.error('Failed to load stores:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async (storeId, rating) => {
        try {
            await apiCall(`/rating/${storeId}`, {
                method: 'POST',
                body: { rating }
            });
            loadStores(); // Reload to get updated ratings
        } catch (err) {
            console.error('Failed to submit rating:', err);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
            setPasswordError('Password must be between 8-16 characters');
            return;
        }
        if (!/[A-Z]/.test(passwordData.newPassword) || !/[!@#$%^&*]/.test(passwordData.newPassword)) {
            setPasswordError('Password must contain at least one uppercase letter and one special character');
            return;
        }

        try {
            await apiCall('/password/update', {
                method: 'POST',
                body: passwordData
            });
            setPasswordSuccess('Password changed successfully');
            setPasswordData({ oldPassword: '', newPassword: '' });
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err) {
            setPasswordError(err.message);
        }
    };

    console.log(stores)

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Store Directory</h1>
                            <p className="text-sm text-gray-600">Welcome, {user.user.name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Change Password</span>
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Password Change Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            {passwordError && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                                    {passwordSuccess}
                                </div>
                            )}
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="relative max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search stores by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Stores Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Loading stores...</div>
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No stores found</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStores.map((store) => (
                            <div key={store.id} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>
                                <p className="text-gray-600 mb-4">{store.address}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Overall Rating</p>
                                        <div className="flex items-center space-x-2">
                                            <StarRating rating={store.avgRating || 0} readOnly />
                                            <span className="text-sm text-gray-500">({store.avgRating?.toFixed(2) || '0.0'})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Your Rating</p>
                                    <div className="flex items-center space-x-2">
                                        <StarRating
                                            rating={store.myRating || 0}
                                            onRate={(rating) => submitRating(store.id, rating)}
                                        />
                                        {store.myRating && (
                                            <span className="text-sm text-gray-500">({store.myRating})</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;