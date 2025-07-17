function Dashboard({ user }) {
  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <div className="profile">
        <img src={user.profilePicture || 'https://via.placeholder.com/150'} alt="Profile" />
        <ul>
          <li>Username: {user.username}</li>
          <li>Age: {user.age}</li>
          <li>School: {user.school}</li>
          <li>District: {user.district}</li>
          <li>Career Path: {user.careerPath || 'Undecided'}</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;

