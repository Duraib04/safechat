import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import ProximityAlert from '../components/ProximityAlert';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { 
    onlineUsers, 
    socket,
    currentLocation,
    locationSharingEnabled,
    gpsStatus,
    nearbyRelatives,
    proximityAlerts,
    toggleLocationSharing,
    dismissProximityAlert,
  } = useContext(SocketContext);
  
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Relatives state
  const [showRelativesPanel, setShowRelativesPanel] = useState(false);
  const [relatives, setRelatives] = useState([]);
  const [showAddRelative, setShowAddRelative] = useState(false);
  const [newRelative, setNewRelative] = useState({ phoneNumber: '', name: '', notes: '' });
  const [relativeLoading, setRelativeLoading] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const [showAlertHistory, setShowAlertHistory] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchAllUsers();
    fetchRelatives();
    fetchAlertHistory();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // Initialize geolocation tracking when user is authenticated and socket is connected
    if (user && socket && !socket.disconnected) {
      if (locationSharingEnabled && !currentLocation) {
        // Start tracking if sharing is enabled but location is not yet set
        toggleLocationSharing(user._id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, socket]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/messages/send', {
        recipientId: selectedUserId,
        content: messageInput,
      });

      setMessages([...messages, response.data.data]);
      setMessageInput('');
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Relatives API functions
  const fetchRelatives = async () => {
    try {
      const response = await axios.get('/api/relatives');
      setRelatives(response.data.relatives || []);
    } catch (error) {
      console.error('Failed to fetch relatives:', error);
    }
  };

  const addRelative = async (e) => {
    e.preventDefault();
    if (!newRelative.phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setRelativeLoading(true);
    try {
      const response = await axios.post('/api/relatives/add', {
        phoneNumber: newRelative.phoneNumber,
        name: newRelative.name,
        notes: newRelative.notes,
      });

      setRelatives([...relatives, response.data.relative]);
      setNewRelative({ phoneNumber: '', name: '', notes: '' });
      setShowAddRelative(false);
      alert('Relative added successfully');
    } catch (error) {
      console.error('Failed to add relative:', error);
      alert(error.response?.data?.message || 'Failed to add relative');
    } finally {
      setRelativeLoading(false);
    }
  };

  const deleteRelative = async (phoneNumber) => {
    if (!window.confirm('Are you sure you want to remove this relative?')) return;

    try {
      await axios.delete(`/api/relatives/${phoneNumber}`);
      setRelatives(relatives.filter(r => r.phoneNumber !== phoneNumber));
      alert('Relative removed successfully');
    } catch (error) {
      console.error('Failed to delete relative:', error);
      alert(error.response?.data?.message || 'Failed to delete relative');
    }
  };

  // Note: updateRelative function available for future feature enhancement
  // const updateRelative = async (phoneNumber, updates) => {
  //   try {
  //     const response = await axios.put(`/api/relatives/${phoneNumber}`, updates);
  //     setRelatives(relatives.map(r => r.phoneNumber === phoneNumber ? response.data.relative : r));
  //   } catch (error) {
  //     console.error('Failed to update relative:', error);
  //     alert(error.response?.data?.message || 'Failed to update relative');
  //   }
  // };

  const fetchAlertHistory = async () => {
    try {
      const response = await axios.get('/api/relatives/alerts?limit=20');
      setAlertHistory(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alert history:', error);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await axios.put(`/api/relatives/alerts/${alertId}/dismiss`);
      fetchAlertHistory();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const getGpsStatusColor = () => {
    switch (gpsStatus) {
      case 'tracking':
        return '#4CAF50';
      case 'error':
        return '#f44336';
      case 'permission-denied':
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const getGpsStatusText = () => {
    switch (gpsStatus) {
      case 'tracking':
        return '📍 Tracking';
      case 'error':
        return '❌ Error';
      case 'permission-denied':
        return '⛔ Permission Denied';
      case 'idle':
        return '⊙ Idle';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Proximity Alerts */}
      {proximityAlerts.map((alert) => (
        <ProximityAlert
          key={alert.id}
          alert={alert}
          onDismiss={dismissProximityAlert}
        />
      ))}

      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>SafeChat</h2>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.username}</p>
            <p className="user-status">
              {onlineUsers.has(user?._id) ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>

        {/* Location Sharing Toggle */}
        <div className="location-sharing-section">
          <div className="location-header">
            <span style={{ color: getGpsStatusColor() }}>
              {getGpsStatusText()}
            </span>
          </div>
          <button
            className={`location-toggle-btn ${locationSharingEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => toggleLocationSharing(user?._id)}
            title={locationSharingEnabled ? 'Click to disable location sharing' : 'Click to enable location sharing'}
          >
            {locationSharingEnabled ? '📍 Sharing Location' : '📍 Enable Location'}
          </button>
          {currentLocation && (
            <p className="location-accuracy">
              Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
            </p>
          )}
        </div>

        {/* Relatives Panel Toggle */}
        <button
          className="relatives-toggle-btn"
          onClick={() => setShowRelativesPanel(!showRelativesPanel)}
        >
          👥 Relatives {relatives.length > 0 && `(${relatives.length})`}
        </button>

        {/* Alert History Toggle */}
        <button
          className="alert-history-toggle-btn"
          onClick={() => {
            setShowAlertHistory(!showAlertHistory);
            if (!showAlertHistory) fetchAlertHistory();
          }}
        >
          🔔 Alert History {alertHistory.filter(a => !a.dismissed).length > 0 && `(${alertHistory.filter(a => !a.dismissed).length})`}
        </button>

        {/* Relatives Panel */}
        {showRelativesPanel && (
          <div className="relatives-panel">
            <div className="relatives-header">
              <h3>Nearby Relatives</h3>
              <button
                className="add-relative-btn"
                onClick={() => setShowAddRelative(!showAddRelative)}
                title="Add a new relative"
              >
                +
              </button>
            </div>

            {/* Add Relative Form */}
            {showAddRelative && (
              <form onSubmit={addRelative} className="add-relative-form">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newRelative.phoneNumber}
                  onChange={(e) => setNewRelative({ ...newRelative, phoneNumber: e.target.value })}
                  pattern="[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}"
                  required
                />
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={newRelative.name}
                  onChange={(e) => setNewRelative({ ...newRelative, name: e.target.value })}
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newRelative.notes}
                  onChange={(e) => setNewRelative({ ...newRelative, notes: e.target.value })}
                  rows="2"
                />
                <div className="form-buttons">
                  <button type="submit" disabled={relativeLoading}>
                    {relativeLoading ? 'Adding...' : 'Add Relative'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRelative(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Relatives List */}
            {relatives.length === 0 ? (
              <p className="no-relatives">No relatives registered yet</p>
            ) : (
              <div className="relatives-list">
                {relatives.map((relative) => {
                  const isNearby = nearbyRelatives.some(nr => nr.phoneNumber === relative.phoneNumber);
                  return (
                    <div key={relative.phoneNumber} className={`relative-item ${isNearby ? 'nearby' : ''}`}>
                      <div className="relative-info">
                        <p className="relative-name">
                          {relative.name || 'Unknown'}
                          {isNearby && ' 📍'}
                        </p>
                        <p className="relative-phone">{relative.phoneNumber}</p>
                        {relative.notes && <p className="relative-notes">{relative.notes}</p>}
                        <p className="relative-added">
                          Added: {new Date(relative.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="delete-relative-btn"
                        onClick={() => deleteRelative(relative.phoneNumber)}
                        title="Delete relative"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Alert History Panel */}
        {showAlertHistory && (
          <div className="alert-history-panel">
            <h3>Recent Alerts</h3>
            {alertHistory.length === 0 ? (
              <p className="no-alerts">No proximity alerts yet</p>
            ) : (
              <div className="alerts-list">
                {alertHistory.slice(0, 10).map((alert) => (
                  <div
                    key={alert._id}
                    className={`alert-item ${alert.alertType.toLowerCase()} ${alert.dismissed ? 'dismissed' : ''}`}
                  >
                    <div className="alert-info">
                      <p className="alert-relative">{alert.relativeName}</p>
                      <p className="alert-type">{alert.alertType}</p>
                      <p className="alert-distance">{alert.distance.toFixed(2)} km</p>
                      <p className="alert-time">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!alert.dismissed && (
                      <button
                        className="dismiss-alert-btn"
                        onClick={() => dismissAlert(alert._id)}
                      >
                        ✓ Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="conversations-list">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <p className="no-conversations">No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants.find((p) => p._id !== user?._id);
              const isSelected = selectedUserId === otherUser?._id;

              return (
                <div
                  key={conv._id}
                  className={`conversation-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedUserId(otherUser?._id)}
                >
                  <div className="conversation-avatar">
                    {otherUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <p className="conversation-name">{otherUser?.username}</p>
                    <p className="conversation-status">
                      {onlineUsers.has(otherUser?._id) ? '🟢 Online' : '⚫ Offline'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="all-users">
          <h3>All Users</h3>
          {allUsers.map((u) => {
            const isSelected = selectedUserId === u._id;
            const hasConversation = conversations.some((conv) =>
              conv.participants.some((p) => p._id === u._id)
            );

            if (hasConversation) return null;

            return (
              <div
                key={u._id}
                className={`user-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedUserId(u._id)}
              >
                <div className="user-avatar-small">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-small">
                  <p>{u.username}</p>
                  <p className="status">
                    {onlineUsers.has(u._id) ? '🟢 Online' : '⚫ Offline'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-main">
        {selectedUserId ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                <div className="chat-avatar">
                  {allUsers.find((u) => u._id === selectedUserId)?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="chat-user-info">
                  <p className="chat-user-name">
                    {allUsers.find((u) => u._id === selectedUserId)?.username}
                  </p>
                  <p className="chat-user-status">
                    {onlineUsers.has(selectedUserId) ? '🟢 Online' : '⚫ Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${msg.sender._id === user?._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="message-input-form">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !messageInput.trim()}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
