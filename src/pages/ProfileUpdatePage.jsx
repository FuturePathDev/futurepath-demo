import { useEffect, useState } from 'react';
import { API, Auth } from 'aws-amplify';

function ProfileUpdatePage() {
    const [user, setUser] = useState(null);
    const [age, setAge] = useState('');
    const [school, setSchool] = useState('');
    const [district, setDistrict] = useState('');
    const [careerPath, setCareerPath] = useState('');

    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then(currentUser => {
                setUser({
                    userId: currentUser.attributes.sub,
                    username: currentUser.attributes.email,
                });
            })
            .catch(error => console.error('Auth error:', error));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            await API.put('FuturePathAPI', `/users/${user.userId}`, {
                body: {
                    userId: user.userId,
                    name: '',  // You can add a name field later if needed
                    age,
                    username: user.username,
                    school,
                    district,
                    careerPath,
                },
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    if (!user) return <p>Loading user profile...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Update Your Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="School"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="District"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Career Path"
                        value={careerPath}
                        onChange={(e) => setCareerPath(e.target.value)}
                    />
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

export default ProfileUpdatePage;

