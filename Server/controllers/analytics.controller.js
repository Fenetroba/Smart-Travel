const Analytics = require('../models/Analytics');

/**
 * POST /api/analytics/track
 * Track user events for analytics
 */
async function trackEvent(req, res, next) {
  try {
    const { eventType, data } = req.body;
    
    // Add IP and user agent for tracking
    const analyticsData = {
      eventType,
      data: {
        ...data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    };

    await Analytics.create(analyticsData);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics data (admin only)
 */
async function getDashboardData(req, res, next) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total searches in last 30 days
    const totalSearches = await Analytics.countDocuments({
      eventType: 'route_search',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Unique users (sessions) in last 30 days
    const uniqueUsers = await Analytics.distinct('data.sessionId', {
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Daily searches for last 7 days (for line chart)
    const dailySearches = await Analytics.aggregate([
      {
        $match: {
          eventType: 'route_search',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transport type usage (for pie chart)
    const transportUsage = await Analytics.aggregate([
      {
        $match: {
          eventType: 'route_search',
          createdAt: { $gte: thirtyDaysAgo },
          'data.transportType': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$data.transportType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Popular routes
    const popularRoutes = await Analytics.aggregate([
      {
        $match: {
          eventType: 'route_search',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            start: '$data.startLocation',
            end: '$data.endLocation'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Hourly distribution (for usage patterns)
    const hourlyDistribution = await Analytics.aggregate([
      {
        $match: {
          eventType: 'route_search',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalSearches,
        uniqueUsers: uniqueUsers.length,
        dailySearches,
        transportUsage,
        popularRoutes,
        hourlyDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { trackEvent, getDashboardData };