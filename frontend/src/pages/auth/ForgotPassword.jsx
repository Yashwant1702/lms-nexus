import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useForm } from '@hooks/useForm';
import { Button, Input, Alert } from '@components/common';
import { isValidEmail } from '@utils/validators';

const ForgotPassword = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const validate = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email address';
    }

    return errors;
  };

  const handleSubmit = async (values) => {
    clearError();
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useForm(
    {
      email: '',
    },
    handleSubmit,
    validate
  );

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          We've sent password reset instructions to <strong>{values.email}</strong>
        </p>
        <Link to="/login">
          <Button variant="primary" fullWidth>
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Forgot password?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No worries, we'll send you reset instructions
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible onDismiss={clearError} className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Send reset link
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
