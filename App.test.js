import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
test('renders welcome message', () => {
  render(<App />);
  const msg = screen.getByText(/Welcome to FuturePath/i);
  expect(msg).toBeInTheDocument();
});
