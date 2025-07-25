// src/pages/Workers.jsx
import { useEffect, useState } from 'react';
import { workersAPI } from '../utils/api';
import './users.css'; // Reuse users.css or create workers.css

const Workers = () => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await workersAPI.getAll();
      setWorkers(res.data);
    } catch (err) {
      console.error("Error fetching workers:", err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">All Workers</h1>
      <div className="user-list">
        {workers.map(worker => (
          <div key={worker.id} className="user-card">
            <h3>{worker.name}</h3>
            <p><strong>Phone:</strong> {worker.phone}</p>
            <p><strong>Email:</strong> {worker.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workers;
