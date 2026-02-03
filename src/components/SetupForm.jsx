/**
 * Interview Setup Form Component
 * Collects candidate details before starting the interview
 */
import { useState } from 'react';
import { generateUserId } from '../services/api';

// Available categories and modules (can be fetched from backend later)
const CATEGORIES = [
  { value: 'call_center', label: 'Call Center' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Customer Support' },
];

const MODULES = [
  { value: '1', label: 'Module 1' },
  { value: '2', label: 'Module 2' },
  { value: '3', label: 'Module 3' },
];

export function SetupForm({ onStart, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'call_center',
    module: '1',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.module) {
      newErrors.module = 'Module is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userId = generateUserId();
    onStart({
      userId,
      name: formData.name.trim(),
      category: formData.category,
      module: formData.module,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wimaan AI</h1>
          <p className="text-purple-300">Voice Interview Assessment</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">Start Your Interview</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  errors.name ? 'border-red-500' : 'border-white/20'
                }`}
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-purple-200 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none cursor-pointer"
                disabled={isLoading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Dropdown */}
            <div>
              <label htmlFor="module" className="block text-sm font-medium text-purple-200 mb-2">
                Module
              </label>
              <select
                id="module"
                name="module"
                value={formData.module}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none cursor-pointer"
                disabled={isLoading}
              >
                {MODULES.map((mod) => (
                  <option key={mod.value} value={mod.value} className="bg-slate-800">
                    {mod.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Start Interview'
              )}
            </button>
          </form>

          {/* Info */}
          <p className="mt-6 text-center text-sm text-gray-400">
            The interview will be conducted in Hinglish and will take approximately 5-10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SetupForm;
