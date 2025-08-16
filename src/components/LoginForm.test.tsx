import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('renders the login form correctly', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows the user to type in email and password', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls the onSubmit handler with form data when submitted', () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByTestId('login-form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false, // default value
    });
  });

  it('shows validation errors for invalid input', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    const form = screen.getByTestId('login-form');

    // Submit with empty fields
    fireEvent.submit(form);

    const emailError = await screen.findByTestId('email-error');
    const passwordError = await screen.findByTestId('password-error');

    expect(emailError).toHaveTextContent('Email is required');
    expect(passwordError).toHaveTextContent('Password is required');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    const form = screen.getByTestId('login-form');

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.submit(form);

    const emailError = await screen.findByTestId('email-error');
    expect(emailError).toHaveTextContent('Please enter a valid email');
  });
});
