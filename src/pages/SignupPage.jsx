import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, password, email } = formData;
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email
        }
      });
      console.log('Signed up user:', user);
      alert('Account created! Please confirm your email.');
      navigate('/confirm');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message || 'Sign-up failed.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px', margin: 'auto', paddingTop: '100px' }}>
      <h2>Sign Up</h2>
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <button type="submit">Create Account</button>
      <p>Already confirmed? <a href="/signin">Sign In</a></p>
    </form>
  );
}

export default SignupPage;
