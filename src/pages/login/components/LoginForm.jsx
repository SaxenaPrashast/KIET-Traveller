import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Test credentials for different user types (from our backend)
  const testCredentials = {
    student: { email: 'test.student@kiet.edu', password: 'test123' },
    staff: { email: 'test.staff@kiet.edu', password: 'test123' },
    driver: { email: 'test.driver@kiet.edu', password: 'test123' },
    admin: { email: 'test.admin@kiet.edu', password: 'test123' }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
    { value: 'driver', label: 'Driver' },
    { value: 'admin', label: 'Administrator' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Send credentials as a properly formatted object
      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      };
      
      const result = await login(credentials);
      
      if (result.success) {
        // AuthContext will handle storing the tokens and user data
        switch (result.user.role) {
          case 'student':
          case 'staff':
            navigate('/student-dashboard');
            break;
          case 'driver':
            navigate('/driver-dashboard');
            break;
          case 'admin':
            navigate('/admin-management');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      let errorMessage = error.message;
      
      // Reset password field on authentication errors
      if (error.message.includes('Invalid email or password')) {
        setFormData(prev => ({ ...prev, password: '' }));
      }
      
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here. For demo, use the provided test credentials.');
  };

  const handleCreateAccount = () => {
    alert('Registration functionality would be implemented here. For demo, use the provided test credentials to login.');
  };

  // Auto-fill test credentials when role changes
  const handleRoleChange = (role) => {
    handleInputChange('role', role);
    const credentials = testCredentials[role];
    if (credentials) {
      setFormData(prev => ({
        ...prev,
        role,
        email: credentials.email,
        password: credentials.password
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <Select
          label="Select Role"
          description="Choose your account type"
          options={roleOptions}
          value={formData?.role}
          onChange={handleRoleChange}
          className="mb-4"
        />

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
          className="mb-4"
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            className="mb-4"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>

        {/* General Error */}
        {errors?.general && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          disabled={isLoading}
          className="relative"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Icon name="loader-2" className="animate-spin mr-2" size={16} />
              <span>Signing In...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Icon name="log-in" className="mr-2" size={16} />
              <span>Sign In</span>
            </div>
          )}
        </Button>

        {/* Additional Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot your password?
          </button>
          
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Create Account
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;