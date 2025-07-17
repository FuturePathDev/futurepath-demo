import Dashboard from '../components/Dashboard';
import { useEffect, useState } from 'react';

function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('userProfile');
    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  if (!user) return <p>Loading...</p>;

  return <Dashboard user={user} />;
}

export default DashboardPage;

