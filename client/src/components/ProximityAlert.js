import React, { useState, useEffect } from 'react';
import './ProximityAlert.css';

const ProximityAlert = ({ alert, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    // Play notification sound on first render
    if (!hasPlayed) {
      playNotificationSound();
      setHasPlayed(true);
    }

    // Auto-dismiss after 10 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(dismissTimer);
  }, []);

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(alert.id);
    }
  };

  if (!isVisible) {
    return null;
  }

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'ENTERING':
        return '🚨';
      case 'EXITING':
        return '✅';
      case 'IN_RANGE':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getAlertTitle = () => {
    switch (alert.alertType) {
      case 'ENTERING':
        return `${alert.relativeName} is nearby!`;
      case 'EXITING':
        return `${alert.relativeName} is moving away`;
      case 'IN_RANGE':
        return `${alert.relativeName} is within range`;
      default:
        return 'Proximity Alert';
    }
  };

  const distanceText = alert.distance ? `${alert.distance.toFixed(2)} km away` : 'Distance unknown';

  return (
    <div className="proximity-alert-container">
      <div className={`proximity-alert proximity-alert-${alert.alertType.toLowerCase()}`}>
        <div className="alert-icon">{getAlertIcon()}</div>
        
        <div className="alert-content">
          <h3 className="alert-title">{getAlertTitle()}</h3>
          <p className="alert-distance">{distanceText}</p>
          {alert.relativeName && (
            <p className="alert-phone">📱 {alert.relativePhoneNumber}</p>
          )}
        </div>

        <button
          className="alert-dismiss-btn"
          onClick={handleDismiss}
          title="Dismiss alert"
        >
          ✕
        </button>
      </div>

      {/* Alert progress bar showing auto-dismiss timer */}
      <div className="alert-progress"></div>
    </div>
  );
};

export default ProximityAlert;
