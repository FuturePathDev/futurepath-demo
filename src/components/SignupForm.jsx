import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';

function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '', // You can use username as userId for now, or generate UUID
    username: '',
    email: '',
    name: '',
    age: '',
    profilePicture: '',
    school: '',
    district: '',
    careerPath: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiName = 'FuturePathAPI'; // This matches your Amplify resource name
      const path = '/users'; // This matches your API path
      const userData = { ...formData, userId: formData.username };

      await API.post(apiName, path, { body: userData });

      alert('User profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('API error:', error);
      alert('Something went wrong saving your data.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="name" placeholder="Full Name" onChange={handleChange} required />
      <input name="age" placeholder="Age" onChange={handleChange} />
      <input name="profilePicture" placeholder="Profile Picture URL" onChange={handleChange} />
      <input name="school" placeholder="School" onChange={handleChange} />
      <input name="district" placeholder="District" onChange={handleChange} />
      <input name="careerPath" placeholder="Career Path (Optional)" onChange={handleChange} />
      <button type="submit">Create Account</button>
    </form>
  );
}

export default SignupForm;
