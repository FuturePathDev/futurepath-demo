import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await Auth.signIn(credentials.username, credentials.password);
      console.log('Signed in user:', user);
      alert('Sign-in successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      alert(error.message || 'Sign-in failed.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px', margin: 'auto', paddingTop: '100px' }}>
      <h2>Sign In</h2>
      <input
        type="text"
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

      <p>
        Need to confirm your account?{' '}
        <a href="/confirm">Confirm here</a>
      </p>
    </form>
  );
}

export default SignInPage;

