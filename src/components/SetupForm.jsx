/**
 * Interview Setup Form Component
 * Collects name, phone, and module (when category present).
 * Context (jd_id, category) comes from URL.
 */
import { useState } from 'react';
import { AppHeader } from './AppHeader';

const MODULES = [{ value: '1', label: 'Module 1' }];

export function SetupForm({ jdId, category, onStart, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    module: MODULES[0].value,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onStart({ ...formData });
  };

  return (
    <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--wimaan-text)] mb-2">Wimaan AI</h1>
            <p className="text-[var(--wimaan-muted)]">Voice Interview Assessment</p>
            {(jdId || category) && (
              <p className="mt-2 text-xs text-[var(--wimaan-muted)]">
                {jdId && category ? `JD: ${jdId} + ${category}` : jdId ? `JD: ${jdId}` : `Category: ${category}`}
              </p>
            )}
          </div>

          <div className="bg-[var(--wimaan-bg-card)] backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[var(--wimaan-border)]">
            <h2 className="text-xl font-semibold text-[var(--wimaan-text)] mb-6">Start Your Interview</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--wimaan-muted)] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-[var(--wimaan-bg)] border rounded-lg text-[var(--wimaan-text)] placeholder-[var(--wimaan-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--wimaan-accent)] transition ${
                    errors.name ? 'border-red-500' : 'border-[var(--wimaan-border)]'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--wimaan-muted)] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-4 py-3 bg-[var(--wimaan-bg)] border rounded-lg text-[var(--wimaan-text)] placeholder-[var(--wimaan-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--wimaan-accent)] transition ${
                    errors.phone ? 'border-red-500' : 'border-[var(--wimaan-border)]'
                  }`}
                  disabled={isLoading}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              {category && (
                <div>
                  <label htmlFor="module" className="block text-sm font-medium text-[var(--wimaan-muted)] mb-2">
                    Module
                  </label>
                  <select
                    id="module"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--wimaan-bg)] border border-[var(--wimaan-border)] rounded-lg text-[var(--wimaan-text)] focus:outline-none focus:ring-2 focus:ring-[var(--wimaan-accent)] transition appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {MODULES.map((mod) => (
                      <option key={mod.value} value={mod.value}>
                        {mod.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--wimaan-muted)]">
              The interview will be conducted in Hinglish and will take approximately 5-10 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupForm;
