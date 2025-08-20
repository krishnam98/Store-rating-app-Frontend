import React, { useState } from 'react';
import { apiCall } from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../AuthContext/AuthContextProvider';

const RegisterForm = ({ onShowLogin }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (formData.name.length < 20 || formData.name.length > 60) {
            return 'Name must be between 20-60 characters';
        }
        if (formData.address.length > 400) {
            return 'Address must be less than 400 characters';
        }
        if (formData.password.length < 8 || formData.password.length > 16) {
            return 'Password must be between 8-16 characters';
        }
        if (!/[A-Z]/.test(formData.password) || !/[!@#$%^&*]/.test(formData.password)) {
            return 'Password must contain at least one uppercase letter and one special character';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await apiCall('/auth/signup', {
                method: 'POST',
                body: formData
            });

            const decoded = jwtDecode(data.token);
            console.log("Decoded Token:", decoded);
            await login(decoded.id, data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join the Store Rating App</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (20-60 chars)</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address (max 400 chars)</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password (8-16 chars, 1 uppercase, 1 special)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onShowLogin}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        Already have an account? Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;