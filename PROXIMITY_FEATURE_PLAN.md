# Relative Nearby Alert Feature - Implementation Plan

## Feature Overview

SafeChat users often need privacy from relatives (family members) who might interrupt intimate moments. This feature allows users to:

1. **Register relative phone numbers** they want to monitor
2. **Share their location in real-time** with specific contacts
3. **Receive proximity alerts** when a registered relative comes within 1km
4. **Control location sharing** with privacy toggles and temporary disabling

---

## Architecture Overview

### Technology Stack
- **Geolocation**: Browser's Geolocation API (GPS, WiFi triangulation)
- **Real-time Tracking**: Socket.IO for low-latency location updates
- **Distance Calculation**: Haversine formula (lat/lng to km)
- **Storage**: MongoDB for location history and alert logs
- **Privacy**: JWT auth + block list + explicit opt-in

---

## Implementation Phases

### Phase 1: Backend Data Models & APIs

#### 1.1 Extend User Schema (`server/models/User.js`)
Add fields:
```javascript
currentLocation: {
  latitude: Number,
  longitude: Number,
  accuracy: Number,  // GPS accuracy in meters
  timestamp: Date,
  accuracy: Number
},
savedRelatives: [{
  phoneNumber: String (unique to user),
  name: String,
  addedAt: Date,
  notes: String
}],
locationSharingEnabled: Boolean (default: false),
locationSharingWith: [ObjectId] // array of user IDs sharing with
```

#### 1.2 Create RelativeAlert Model (`server/models/RelativeAlert.js`)
Stores proximity events for audit trail:
```javascript
{
  user: ObjectId (ref: User),
  relativeName: String,
  relativePhoneNumber: String,
  distance: Number (in km),
  userLocation: { latitude, longitude },
  relativeLocation: { latitude, longitude },
  alertType: 'ENTERING' | 'EXITING' | 'IN_RANGE',
  dismissedAt: Date,
  createdAt: Date
}
```

#### 1.3 Create Relatives API Routes (`server/routes/relatives.js`)

**POST /api/relatives/add** - Add relative to monitor
```
Request: { phoneNumber, name, notes? }
Response: { success, relativesCount }
Validation: Phone number format, no duplicates
```

**GET /api/relatives** - List saved relatives
```
Response: { relatives: [{ phoneNumber, name, addedAt, notes }] }
```

**DELETE /api/relatives/:phoneNumber** - Remove relative
```
Response: { success, message }
```

**PUT /api/relatives/:phoneNumber** - Update relative info
```
Request: { name?, notes? }
Response: { success, relative }
```

**POST /api/relatives/location** - Manually update location (fallback)
```
Request: { latitude, longitude, accuracy }
Response: { success, nearbyRelatives: [{ name, distance }] }
```

**POST /api/relatives/toggle-sharing** - Enable/disable location sharing
```
Request: { enabled: boolean }
Response: { success, locationSharingEnabled }
```

---

### Phase 2: Real-Time Location Tracking

#### 2.1 Proximity Detection Utility (`server/utils/proximity.js`)

Functions:
```javascript
// Calculate distance between two lat/lng points
calculateDistance(lat1, lng1, lat2, lng2) -> km

// Check if user within range of any relatives
checkProximity(user, savedRelatives, threshold = 1.0) -> [{ name, distance, proximity }]

// Validate coordinates
isValidLocation(lat, lng) -> boolean

// Format alert message
formatAlertMessage(relativeName, distance) -> string
```

#### 2.2 Socket.IO Location Events (`server/server.js`)

Add event handlers:

**`updateLocation`** (client → server)
- Receives: `{ userId, latitude, longitude, accuracy }`
- Validates JWT + location coordinates
- Updates user's `currentLocation` in DB
- Checks proximity to saved relatives
- Broadcasts `locationUpdated` to followers
- Emits `proximityAlert` if threshold crossed

**`proximityAlert`** (server → client)
- Sends: `{ relativeName, distance, lat, lng, timestamp }`
- Triggers notification on recipient device
- Stores alert in RelativeAlert collection

**`stopLocationSharing`** (client → server)
- Disables location updates
- Notifies followers

---

### Phase 3: Frontend Location Tracking

#### 3.1 Extend SocketContext (`client/src/context/SocketContext.js`)

Add state:
```javascript
currentLocation: { latitude, longitude, accuracy, timestamp },
locationSharingEnabled: boolean,
nearbyRelatives: [{ name, distance, timeDetected }],
locationError: string,
gpsStatus: 'acquiring' | 'active' | 'disabled' | 'error'
```

Add functions:
```javascript
startLocationTracking()   // Request geolocation permission
stopLocationTracking()     // Stop watching position
handleLocationUpdate()     // Emit updateLocation event
handleProximityAlert()     // Trigger notification
```

Implementation:
```javascript
// Use navigator.geolocation.watchPosition
// Interval: 15-30 seconds (configurable)
// Handle permission denial gracefully
// Fallback if GPS unavailable
```

#### 3.2 Proximity Alert Notification Component

Create `client/src/components/ProximityAlert.js`:
```javascript
Features:
- Banner alert showing relative name + distance
- Sound notification (with mute toggle)
- Auto-dismiss after 10 seconds (configurable)
- "Show on map" button for future map feature
- Dismiss button
```

#### 3.3 Relative Management UI (`client/src/pages/Dashboard.js`)

Add section:
```
Relatives Management Panel:
├─ Location Sharing Toggle (with GPS status)
├─ List of saved relatives:
│  ├─ Name + Phone Number
│  ├─ Add Date
│  ├─ Delete button
│  └─ Edit button
├─ Add Relative Form:
│  ├─ Phone number input
│  ├─ Name input
│  ├─ Notes (optional)
│  └─ Add button
└─ Proximity Alerts Log:
   ├─ Recent alerts list
   └─ Clear history button
```

---

## Data Flow Diagrams

### Location Update Flow
```
User A (App)
    ↓
Browser Geolocation API
    ↓
currentLocation = { lat, lng, accuracy }
    ↓
Socket.IO: emit('updateLocation', location)
    ↓
Server (Socket handler)
    ↓
Update User.currentLocation in DB
    ↓
For each savedRelative in User.savedRelatives:
  ├─ calculateDistance(userLat, userLng, relativeLat, relativeLng)
  ├─ if distance < 1.0 km:
  │  ├─ Create RelativeAlert document
  │  └─ emit('proximityAlert', { name, distance })
  └─ emit('locationUpdated', { userId, location })
    ↓
User B receives 'proximityAlert' event
    ↓
Display notification banner + optional sound alert
```

### Relative Registration Flow
```
User fills form with:
├─ Phone number
├─ Name
└─ Notes (optional)
    ↓
POST /api/relatives/add (with JWT token)
    ↓
Server validation:
├─ Valid phone format
├─ No duplicate entries
└─ User authenticated
    ↓
Store in User.savedRelatives array
    ↓
Response: { success: true, relative: {...} }
    ↓
Update Dashboard UI
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/relatives/add` | Add relative phone number to monitor |
| GET | `/api/relatives` | Get list of saved relatives |
| DELETE | `/api/relatives/:phoneNumber` | Remove relative from monitoring |
| PUT | `/api/relatives/:phoneNumber` | Update relative name/notes |
| POST | `/api/relatives/location` | Manually update current location |
| POST | `/api/relatives/toggle-sharing` | Enable/disable location sharing |
| GET | `/api/relatives/alerts` | Get proximity alert history |

---

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `updateLocation` | Client → Server | `{ latitude, longitude, accuracy }` |
| `locationUpdated` | Server → Client | `{ userId, latitude, longitude, timestamp }` |
| `proximityAlert` | Server → Client | `{ relativeName, distance, timestamp }` |
| `stopLocationSharing` | Client → Server | `{ userId }` |
| `locationSharingDisabled` | Server → Client | `{ userId }` |

---

## Privacy & Security Considerations

### Privacy Controls
1. ✅ Location sharing is **opt-in** (default: disabled)
2. ✅ Users explicitly enable for each contact
3. ✅ Phone number-based (not automatic user discovery)
4. ✅ One-directional monitoring (User A monitors relatives, not bidirectional)
5. ✅ Block list respected (blocked users can't receive alerts)

### Data Security
1. ✅ JWT authentication on all endpoints
2. ✅ HTTPS required in production
3. ✅ Location data encrypted in transit (Socket.IO + HTTPS)
4. ✅ Location stored in DB (can be deleted on request)
5. ✅ Audit trail in RelativeAlert collection

### Compliance
1. ✅ Explicit user consent for location tracking
2. ✅ Clear privacy policy notice
3. ✅ Ability to delete all location history
4. ✅ GDPR/CCPA compliant data handling

---

## Configuration

**Location Update Interval**: 15-30 seconds (configurable via env variable)
```
LOCATION_UPDATE_INTERVAL=20000  // 20 seconds in milliseconds
```

**Proximity Threshold**: 1 km (configurable)
```
PROXIMITY_ALERT_THRESHOLD=1.0  // kilometers
```

**Alert Auto-dismiss**: 10 seconds (configurable)
```
ALERT_AUTO_DISMISS_MS=10000  // 10 seconds
```

**GPS Timeout**: 30 seconds
```
GPS_TIMEOUT_MS=30000  // 30 seconds
```

---

## Error Handling

### Frontend Errors
- **GPS Permission Denied**: Show banner "Location access required"
- **GPS Timeout**: Retry after 30 seconds, show "GPS unavailable"
- **Network Error**: Queue location updates, retry when online
- **Invalid Phone Number**: Show validation error with format example

### Server Errors
- **Invalid Coordinates**: Log error, skip proximity check
- **Database Error**: Log error, continue operation
- **Missing User**: Return 404 with clear message
- **Duplicate Relative**: Return 409 with "Already monitoring this number"

---

## Testing Strategy

### Unit Tests
- Distance calculation (haversine formula)
- Phone number validation
- Location coordinate validation
- Proximity threshold logic

### Integration Tests
- Add/remove relatives flow
- Location update flow
- Proximity alert trigger
- Socket.IO event flow

### Manual Testing
- Test with 2+ devices simultaneously
- Test GPS accuracy variations
- Test permission denial
- Test network interruption
- Test battery saver mode
- Test with blocked users

---

## Future Enhancements

1. **Map Visualization**: Show relative locations on map
2. **Geofencing**: Set custom zones instead of 1km
3. **Notifications**: SMS/Email alerts instead of in-app only
4. **Multi-device Sync**: Sync location across devices
5. **Family Group**: Monitor multiple family members together
6. **Location History**: View past location trails
7. **Smart Notifications**: AI-based alert scheduling
8. **Integration with Phone Contacts**: Auto-populate from phone contacts

---

## Implementation Timeline

**Week 1**: Backend models + API routes (Phase 1)
**Week 2**: Socket.IO events + Proximity utility (Phase 2)
**Week 3**: Frontend context + UI components (Phase 3)
**Week 4**: Testing + Documentation + Deployment

---

## File Structure After Implementation

```
server/
├── models/
│   ├── User.js (MODIFIED)
│   └── RelativeAlert.js (NEW)
├── routes/
│   ├── relatives.js (NEW)
│   └── messages.js (existing)
├── utils/
│   ├── proximity.js (NEW)
│   └── encryption.js (existing)
└── server.js (MODIFIED)

client/
├── src/
│   ├── components/
│   │   ├── ProximityAlert.js (NEW)
│   │   └── ProtectedRoute.js (existing)
│   ├── context/
│   │   ├── SocketContext.js (MODIFIED)
│   │   └── AuthContext.js (existing)
│   └── pages/
│       └── Dashboard.js (MODIFIED)
```

---

**Status**: Ready for implementation
**Created**: November 28, 2025
**Version**: 1.0.0
