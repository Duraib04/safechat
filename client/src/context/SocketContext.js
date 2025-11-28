import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle, tracking, error, permission-denied
  const [nearbyRelatives, setNearbyRelatives] = useState([]);
  const [proximityAlerts, setProximityAlerts] = useState([]);
  
  // Refs for geolocation
  const watchIdRef = useRef(null);
  const locationUpdateIntervalRef = useRef(null);

  const initializeSocket = useCallback((userId) => {
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      newSocket.emit('userOnline', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('userStatusChanged', (data) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    newSocket.on('userTyping', (data) => {
      setTypingUsers((prev) => new Set(prev).add(data.userId));
    });

    newSocket.on('userStopTyping', (data) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Proximity Alert event handler
    newSocket.on('proximityAlert', (data) => {
      console.log('Proximity Alert:', data);
      setProximityAlerts((prev) => [
        { ...data, id: Date.now() },
        ...prev
      ]);
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setProximityAlerts((prev) => prev.filter(alert => alert.id !== data.id));
      }, 10000);
    });

    // Nearby relatives update
    newSocket.on('nearbyRelativesUpdate', (data) => {
      console.log('Nearby relatives updated:', data);
      setNearbyRelatives(data.relatives || []);
    });

    // Location tracking error from server
    newSocket.on('locationError', (data) => {
      console.error('Location error:', data.message);
      setGpsStatus('error');
    });

    setSocket(newSocket);
    return newSocket;
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Start geolocation tracking
  const startLocationTracking = useCallback((userId) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setGpsStatus('error');
      return;
    }

    setGpsStatus('tracking');

    // Use watchPosition for continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        setCurrentLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
        });

        // Emit location to server
        if (socket && socket.connected && locationSharingEnabled) {
          socket.emit('updateLocation', {
            userId,
            latitude,
            longitude,
            accuracy,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        
        if (error.code === 1) { // PERMISSION_DENIED
          setGpsStatus('permission-denied');
        } else if (error.code === 3) { // TIMEOUT
          setGpsStatus('error');
        } else {
          setGpsStatus('error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000, // Use cached position if < 5s old
      }
    );

    watchIdRef.current = watchId;
    return watchId;
  }, [socket, locationSharingEnabled]);

  // Stop geolocation tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus('idle');
    setCurrentLocation(null);
  }, []);

  // Toggle location sharing
  const toggleLocationSharing = useCallback((userId) => {
    const newSharingState = !locationSharingEnabled;
    setLocationSharingEnabled(newSharingState);

    if (newSharingState) {
      // Start tracking when sharing enabled
      startLocationTracking(userId);
      setGpsStatus('tracking');
    } else {
      // Stop tracking and notify server
      stopLocationTracking();
      if (socket && socket.connected) {
        socket.emit('stopLocationSharing', { userId });
      }
    }
  }, [locationSharingEnabled, socket, startLocationTracking, stopLocationTracking]);

  // Clear old proximity alerts
  const clearProximityAlerts = useCallback(() => {
    setProximityAlerts([]);
  }, []);

  // Dismiss specific alert
  const dismissProximityAlert = useCallback((alertId) => {
    setProximityAlerts((prev) => prev.filter(alert => alert.id !== alertId));
  }, []);

  return (
    <SocketContext.Provider
      value={{
        // Socket state
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        
        // Socket methods
        initializeSocket,
        disconnectSocket,
        
        // Geolocation state
        currentLocation,
        locationSharingEnabled,
        gpsStatus,
        nearbyRelatives,
        proximityAlerts,
        
        // Geolocation methods
        startLocationTracking,
        stopLocationTracking,
        toggleLocationSharing,
        clearProximityAlerts,
        dismissProximityAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
