import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function ConfirmPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await Auth.confirmSignUp(username, code);
      alert('Account confirmed! You can now sign in.');
      navigate('/');
    } catch (error) {
      console.error('Error confirming sign up', error);
      alert(error.message);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleConfirm}>
      <h2>Confirm Your Account</h2>
      <input
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        name="code"
        placeholder="Confirmation Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Confirm Account</button>
    </form>
  );
}

export default ConfirmPage;
