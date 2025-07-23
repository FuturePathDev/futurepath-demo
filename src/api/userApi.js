import { API } from 'aws-amplify';

export const getUserData = async (userId) => {
  try {
    const response = await API.get('FuturePathAPI', `/users/${userId}`, {});
    return JSON.parse(response.body);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
