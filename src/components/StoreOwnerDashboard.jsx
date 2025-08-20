import React, { useState, useEffect, use } from 'react';
import { LogOut, Star, Users, Edit2 } from 'lucide-react';
import { apiCall } from '../utils/api';
import StarRating from './StarRating';
import { useAuth } from '../AuthContext/AuthContextProvider';

const StoreOwnerDashboard = () => {
    const { user, logout } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [storeStats, setStoreStats] = useState({ averageRating: 0, totalRatings: 0 });
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    console.log('Store Owner Dashboard User:', user.user);

    useEffect(() => {
        loadStoreData();
    }, []);

    const loadStoreData = async () => {
        setLoading(true);
        try {
            const resp = await apiCall('/store/getStoreByOwnerId')
            setStoreStats(resp.store);
            console.log(resp.store)

            const ratingsData = await apiCall(`/store/getRatingsByStoreId/${resp.store.id}`);
            console.log('Ratings Data:', ratingsData.ratings);

            // Fetch user data for each rating
            const ratingsWithUserData = await Promise.all(
                ratingsData.ratings.map(async (rating) => {
                    try {
                        const userData = await apiCall(`/user/getUserByID/${rating.userId}`);
                        return {
                            ...rating,
                            userName: userData.user.name,
                            userEmail: userData.user.email
                        };
                    } catch (error) {
                        console.error(`Failed to fetch user data for userId ${rating.userId}:`, error);
                        return {
                            ...rating,
                            userName: 'Unknown User',
                            userEmail: 'N/A'
                        };
                    }
                })
            );

            setRatings(ratingsWithUserData);
        } catch (err) {
            console.error('Failed to load store data:', err);
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Store Owner Dashboard</h1>
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

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Star className="w-8 h-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-2xl font-semibold text-gray-900">{storeStats.avgRating?.toFixed(1) || '0.0'}</p>
                                    <StarRating rating={storeStats.avgRating || 0} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                                <p className="text-2xl font-semibold text-gray-900">{ratings.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Customer Ratings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : ratings.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No ratings yet</td>
                                    </tr>
                                ) : (
                                    ratings.map((rating, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rating.userName || 'Unknown User'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rating.userEmail || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <StarRating rating={rating.rating} readOnly />
                                                    <span className="text-sm text-gray-500">({rating.rating})</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreOwnerDashboard;