import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

console.log('Attempting sign in with:', credentials);


function SignInPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Auth.signIn(credentials.username, credentials.password);
      alert('Sign-in successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      alert(error.message || 'Sign-in failed.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      <input
        name="username"
        placeholder="Username"
        value={credentials.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Sign In</button>
    </form>
  );
}

export default SignInPage;
