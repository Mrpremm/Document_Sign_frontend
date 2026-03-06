import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, PenLine } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await registerUser(data);
    } catch (error) {
      setAuthError(error?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.72rem 1rem',
    border: hasError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '0.92rem', color: '#1e293b',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4f46e5 100%)' }}
      >
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'rgba(99,102,241,0.25)', filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.2)', filter: 'blur(100px)',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px', padding: '10px',
            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          }}>
            <PenLine size={24} color="#fff" />
          </div>
          <div>
            <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Digi<span style={{ color: '#a5b4fc' }}>Sign</span>
            </span>
            <p style={{ color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 500, margin: 0 }}>DOCUMENT SIGNING PLATFORM</p>
          </div>
        </div>

        {/* Center hero text */}
        <div className="relative z-10">
          <h1 style={{
            color: '#fff', fontSize: '3rem', fontWeight: 800,
            lineHeight: 1.15, margin: '0 0 1rem',
          }}>
            Join thousands<br />
            <span style={{
              background: 'linear-gradient(90deg,#a5b4fc,#c4b5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              going paperless
            </span>
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '360px' }}>
            Create your account and start signing legally binding documents — free, fast, and secure.
          </p>
        </div>

        {/* Bottom spacer */}
        <div className="relative z-10" />
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12"
        style={{ background: '#f8fafc' }}>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', padding: '10px' }}>
            <PenLine size={22} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b' }}>
            Digi<span style={{ color: '#6366f1' }}>Sign</span>
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
              Create your account
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '1.75rem', boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
            border: '1px solid #e2e8f0',
          }}>
            {authError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '0.75rem 1rem',
                color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>⚠️</span> {authError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Full name
                </label>
                <input
                  id="register-name"
                  type="text"
                  {...register('name')}
                  placeholder="John Doe"
                  style={inputStyle(errors.name)}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = errors.name ? '#ef4444' : '#e2e8f0'}
                />
                {errors.name && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Email address
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  style={inputStyle(errors.email)}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
                />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Min. 6 characters"
                    style={{ ...inputStyle(errors.password), paddingRight: '3rem' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                  }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="••••••••"
                    style={{ ...inputStyle(errors.confirmPassword), paddingRight: '3rem' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e2e8f0'}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                  }}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '0.85rem',
                  background: isSubmitting ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontSize: '0.95rem', fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                  transition: 'all 0.2s', letterSpacing: '0.3px',
                  marginTop: '0.25rem',
                }}
              >
                {isSubmitting ? 'Creating account…' : 'Create free account →'}
              </button>
            </form>
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;