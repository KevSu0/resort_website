import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../../../components/ui/switch/Switch';

describe('Switch', () => {
  it('renders correctly', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('can be controlled', () => {
    const handleChange = jest.fn();
    render(<Switch checked={true} onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('calls onCheckedChange when clicked', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('can be disabled', () => {
    const handleChange = jest.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
    fireEvent.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});