import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';

// Simple test component
const TestApp: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          <h1>Digital Claims Management System</h1>
          <p>Test setup successful!</p>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

test('renders test app', () => {
  render(<TestApp />);
  const linkElement = screen.getByText(/Digital Claims Management System/i);
  expect(linkElement).toBeInTheDocument();
});
