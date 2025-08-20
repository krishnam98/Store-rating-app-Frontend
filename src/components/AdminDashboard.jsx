import React, { useState, useEffect } from 'react';
import { User, Star, Store, Users, BarChart3, LogOut, Search, Plus } from 'lucide-react';
import { apiCall } from '../utils/api';
import StarRating from './StarRating';
import AddUserForm from './AddUserForm'; // Import the AddUserForm component
import AddStoreForm from './AddStoreForm'; // Import the AddStoreForm component
import { useAuth } from '../AuthContext/AuthContextProvider';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
    const [stores, setStores] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
    const [isAddStoreFormOpen, setIsAddStoreFormOpen] = useState(false); // New state for store form

    useEffect(() => {
        loadStats();
        if (activeTab === 'stores') loadStores();
        if (activeTab === 'users') loadUsers();
    }, [activeTab]);

    const loadStats = async () => {
        try {
            const data = await apiCall('/admin/dashboard');
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const loadStores = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/admin/getStores');
            setStores(data.stores);
        } catch (err) {
            console.error('Failed to load stores:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/admin/getUsers');
            console.log(data.Users);
            setUsers(data.Users);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handler for when a new user is added
    const handleUserAdded = (newUser) => {
        setUsers(prev => [...prev, newUser]);
        loadStats(); // Refresh stats to show updated user count
    };

    // Handler for when a new store is added
    const handleStoreAdded = (newStore) => {
        setStores(prev => [...prev, newStore]);
        loadStats(); // Refresh stats to show updated store count
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.address && u.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome, {user.user.name}</p>
                        </div>
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

            {/* Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                            { id: 'stores', name: 'Stores', icon: Store },
                            { id: 'users', name: 'Users', icon: Users }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Store className="w-8 h-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Stores</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.stores}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Star className="w-8 h-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.ratings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stores' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Stores</h2>
                                <button
                                    onClick={() => setIsAddStoreFormOpen(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Store</span>
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search stores..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : filteredStores.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No stores found</td>
                                        </tr>
                                    ) : (
                                        filteredStores.map((store) => (
                                            <tr key={store.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{store.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <StarRating rating={store.avgRating || 0} readOnly />
                                                        <span className="text-sm text-gray-500">({store.avgRating?.toFixed(2) || '0.0'})</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Users</h2>
                                <button
                                    onClick={() => setIsAddUserFormOpen(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add User</span>
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                        u.role === 'store_owner' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {u.role.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{u.address || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {u.role === 'store_owner' && u.Store && (
                                                        <div className="flex items-center space-x-2">
                                                            <StarRating rating={u.Store.avgRating || 0} readOnly />
                                                            <span className="text-sm text-gray-500">({u.Store.avgRating?.toFixed(2) || '0.0'})</span>
                                                        </div>
                                                    )}
                                                    {(u.role !== 'store_owner' || !u.Store) && (
                                                        <span className="text-sm text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Form Modal */}
            <AddUserForm
                isOpen={isAddUserFormOpen}
                onClose={() => setIsAddUserFormOpen(false)}
                onUserAdded={handleUserAdded}
            />

            {/* Add Store Form Modal */}
            <AddStoreForm
                isOpen={isAddStoreFormOpen}
                onClose={() => setIsAddStoreFormOpen(false)}
                onStoreAdded={handleStoreAdded}
            />
        </div>
    );
};

export default AdminDashboard;