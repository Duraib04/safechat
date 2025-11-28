const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const RelativeAlert = require('../models/RelativeAlert');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Phone number validation regex
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * POST /api/relatives/add
 * Add a relative phone number to monitor
 */
router.post(
  '/add',
  authMiddleware,
  [
    body('phoneNumber')
      .matches(PHONE_REGEX)
      .withMessage('Invalid phone number format'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Notes must not exceed 200 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber, name, notes } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if relative already exists
      const existingRelative = user.savedRelatives.find(
        (r) => r.phoneNumber === phoneNumber
      );

      if (existingRelative) {
        return res.status(409).json({ message: 'Already monitoring this phone number' });
      }

      // Add relative to savedRelatives
      user.savedRelatives.push({
        phoneNumber,
        name,
        notes: notes || '',
        addedAt: new Date(),
      });

      await user.save();

      res.status(201).json({
        message: 'Relative added successfully',
        relative: user.savedRelatives[user.savedRelatives.length - 1],
      });
    } catch (error) {
      console.error('Add relative error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/relatives
 * Get list of saved relatives
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('savedRelatives');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      relatives: user.savedRelatives || [],
      count: user.savedRelatives?.length || 0,
    });
  } catch (error) {
    console.error('Get relatives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/relatives/:phoneNumber
 * Remove a relative from monitoring
 */
router.delete('/:phoneNumber', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.savedRelatives.length;
    user.savedRelatives = user.savedRelatives.filter(
      (r) => r.phoneNumber !== phoneNumber
    );

    if (user.savedRelatives.length === initialLength) {
      return res.status(404).json({ message: 'Relative not found' });
    }

    await user.save();

    res.json({
      message: 'Relative removed successfully',
      remaining: user.savedRelatives.length,
    });
  } catch (error) {
    console.error('Delete relative error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/relatives/:phoneNumber
 * Update relative name or notes
 */
router.put(
  '/:phoneNumber',
  authMiddleware,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Notes must not exceed 200 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber } = req.params;
      const { name, notes } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const relative = user.savedRelatives.find((r) => r.phoneNumber === phoneNumber);

      if (!relative) {
        return res.status(404).json({ message: 'Relative not found' });
      }

      // Update fields
      if (name) relative.name = name;
      if (notes !== undefined) relative.notes = notes;

      await user.save();

      res.json({
        message: 'Relative updated successfully',
        relative,
      });
    } catch (error) {
      console.error('Update relative error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * POST /api/relatives/location
 * Manually update current location
 */
router.post(
  '/location',
  authMiddleware,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('accuracy')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Invalid accuracy value'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { latitude, longitude, accuracy } = req.body;
      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          currentLocation: {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: new Date(),
          },
        },
        { new: true }
      ).select('currentLocation');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Location updated successfully',
        location: user.currentLocation,
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * POST /api/relatives/toggle-sharing
 * Enable or disable location sharing
 */
router.post(
  '/toggle-sharing',
  authMiddleware,
  [body('enabled').isBoolean().withMessage('Enabled must be boolean')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { enabled } = req.body;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { locationSharingEnabled: enabled },
        { new: true }
      ).select('locationSharingEnabled');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: `Location sharing ${enabled ? 'enabled' : 'disabled'}`,
        locationSharingEnabled: user.locationSharingEnabled,
      });
    } catch (error) {
      console.error('Toggle sharing error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/relatives/alerts
 * Get proximity alert history
 */
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, skip = 0, dismissed = false } = req.query;

    const query = {
      user: req.userId,
      dismissed: dismissed === 'true',
    };

    const alerts = await RelativeAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await RelativeAlert.countDocuments(query);

    res.json({
      alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/relatives/alerts/:alertId/dismiss
 * Dismiss a proximity alert
 */
router.put('/alerts/:alertId/dismiss', authMiddleware, async (req, res) => {
  try {
    const alert = await RelativeAlert.findOne({
      _id: req.params.alertId,
      user: req.userId,
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.dismissed = true;
    alert.dismissedAt = new Date();
    await alert.save();

    res.json({ message: 'Alert dismissed' });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
