import { useEffect, useState } from 'react';
import { Auth, API } from 'aws-amplify';
import Dashboard from '../components/Dashboard';

function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        //  Confirm the user is authenticated with Cognito
        const currentUser = await Auth.currentAuthenticatedUser();
        console.log('Authenticated user:', currentUser);

        const userId = currentUser.username;
        console.log('Using userId for API:', userId);

        //  Call your REST API
        const apiName = 'FuturePathAPI';
        const path = `/users/${userId}`;
        console.log(`Calling API: ${apiName}${path}`);

        const response = await API.get(apiName, path);
        console.log('API Response:', response);

        setUser(response[0]); // Assuming API returns array
      } catch (error) {
        console.error('Dashboard Error:', error);
        alert(error.message || 'Authentication error.');
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading your dashboard...</p>;

  return <Dashboard user={user} />;
}

export default DashboardPage;
