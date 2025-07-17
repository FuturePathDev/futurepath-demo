import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profilePicture: '',
    username: '',
    school: '',
    district: '',
    careerPath: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(formData));
    navigate('/dashboard');
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="age" placeholder="Age" onChange={handleChange} required />
      <input name="profilePicture" placeholder="Profile Picture URL" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="school" placeholder="School" onChange={handleChange} required />
      <input name="district" placeholder="District" onChange={handleChange} required />
      <input name="careerPath" placeholder="Career Path (Optional)" onChange={handleChange} />
      <button type="submit">Create Account</button>
    </form>
  );
}

export default SignupForm;

