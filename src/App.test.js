import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders FuturePath welcome message', () => {
  render(<App />);
  const welcomeText = screen.getByText(/Welcome to FuturePath/i);
  expect(welcomeText).toBeInTheDocument();
});
