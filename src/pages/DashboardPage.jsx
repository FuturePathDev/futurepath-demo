import { useEffect, useState } from 'react';
import { Auth, API } from 'aws-amplify';
import Dashboard from '../components/Dashboard';

function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {

        const currentUser = await Auth.currentAuthenticatedUser();
        const userId = currentUser.username;


        const apiName = 'FuturePathAPI';
        const path = `/users/${userId}`;
        const response = await API.get(apiName, path);


        setUser(response[0]); // response is an array from DynamoDB query
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading your dashboard...</p>;

  return <Dashboard user={user} />;
}

export default DashboardPage;
