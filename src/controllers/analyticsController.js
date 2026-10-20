const AnalyticsModel = require("../models/analyticsModel");

const AnalyticsController = {
  /**
   * GET /api/analytics/dashboard
   * Fetch real database analytics for charts and stat counters
   */
  async getDashboard(req, res, next) {
    try {
      const data = await AnalyticsModel.getDashboardAnalytics();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Analytics controller error:", error);
      next(error);
    }
  },
};

module.exports = AnalyticsController;
