import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';

const ParentProfileSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setProfile(response.data);
      } catch (err) {
        setError('Unable to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>⚙️ Profile Settings</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="card-content">
          <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
          <p><strong>Email:</strong> {profile?.email || 'Not set'}</p>
          <p><strong>Phone:</strong> {profile?.phone || 'Not set'}</p>
          <p><strong>Address:</strong> {profile?.address || 'Not set'}</p>
          <p><strong>Relationship:</strong> {profile?.relationship || 'Parent'}</p>
          <p>Please contact the school office to update your login details.</p>
        </div>
      )}
    </div>
  );
};

export default ParentProfileSettings;
