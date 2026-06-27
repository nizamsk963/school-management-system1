import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';

const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  eventType: 'Other',
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data || []);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingId) {
        await eventService.update(editingId, formData);
        setSuccessMessage('Event updated successfully.');
      } else {
        await eventService.add(formData);
        setSuccessMessage('Event added successfully.');
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      setError('Failed to save event');
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      organizer: event.organizer?._id || '',
      eventType: event.eventType || 'Other',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.delete(id);
      setSuccessMessage('Event deleted successfully.');
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🎉 School Events</h2>
        <button className="btn btn-primary" onClick={() => {
          if (showForm) resetForm();
          else setShowForm(true);
        }}>
          {showForm ? 'Cancel' : '➕ Add Event'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '20px' }}>
          <h3>{editingId ? 'Edit Event' : 'Add New Event'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange}>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Academic">Academic</option>
                  <option value="Celebration">Celebration</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={formData.location} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input name="startTime" value={formData.startTime} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input name="endTime" value={formData.endTime} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>

            <div className="form-group">
              <label>Organizer ID</label>
              <input name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="Optional user id" />
            </div>

            <button type="submit" className="btn btn-primary">{editingId ? 'Update Event' : 'Save Event'}</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Organizer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7">No events available.</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.eventType || 'General'}</td>
                    <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '-'}</td>
                    <td>{event.startTime ? `${event.startTime} - ${event.endTime || ''}` : '-'}</td>
                    <td>{event.location || '-'}</td>
                    <td>{event.organizer ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim() || event.organizer._id : '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEdit(event)}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventList;
