import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phone: '',
    studentId: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.role === 'student' && !formData.studentId?.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare registration data
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone || undefined,
        studentId: formData.role === 'student' ? formData.studentId : undefined
      };

      const response = await register(registrationData);
      if (response.success) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login.' }
        });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Registration failed. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          error={errors.firstName}
          required
        />
        <Input
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        required
      />

      <Select
        label="Role"
        value={formData.role}
        onChange={(value) => handleInputChange('role', value)}
        options={roleOptions}
      />

      {formData.role === 'student' && (
        <Input
          label="Student ID"
          type="text"
          value={formData.studentId}
          onChange={(e) => handleInputChange('studentId', e.target.value)}
          error={errors.studentId}
          required
        />
      )}

      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        error={errors.phone}
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        error={errors.password}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        required
      />

      {errors.submit && (
        <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </Button>

      <div className="text-sm text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-800">
          Login here
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
