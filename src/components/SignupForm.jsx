import { useState } from 'react';
import { Auth, API } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      // Step 1: Cognito SignUp
      await Auth.signUp({
        username: formData.username,
        password: formData.password,
        attributes: {
          email: formData.email,
          name: formData.name,
        },
      });
      alert('Account created! Check your email to confirm. Now signing in...');

      // Step 2: Cognito SignIn (assuming user confirmed email already for this test)
      await Auth.signIn(formData.username, formData.password);

      // Step 3: POST user data to API
      const apiName = 'FuturePathAPI';
      const path = '/users';
      const userData = {
        userId: formData.username,
        username: formData.username,
        email: formData.email,
        name: formData.name,
        age: formData.age,
        profilePicture: formData.profilePicture,
        school: formData.school,
        district: formData.district,
        careerPath: formData.careerPath,
      };

      await API.post(apiName, path, { body: userData });
      alert('User profile saved to database!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || 'Something went wrong.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
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
