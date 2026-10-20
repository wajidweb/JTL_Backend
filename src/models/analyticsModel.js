const { pool } = require("../config/db");

const AnalyticsModel = {
  /**
   * Get real-time dashboard analytics from MySQL
   */
  async getDashboardAnalytics() {
    // 1. Fetch Total Counts
    const [[{ total: totalSpecialists }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM team_members"
    );
    const [[{ total: totalGallery }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM gallery_items"
    );
    const [[{ total: totalSessions }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM video_items WHERE category = 'Session'"
    );
    const [[{ total: totalFamily }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM video_items WHERE category = 'Family'"
    );

    // 2. Build Last 6 Months Window
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      months.push({
        key: `${year}-${monthNum}`,
        month: monthLabel,
        photos: 0,
        sessions: 0,
        testimonials: 0,
      });
    }

    // 3. Query Real Monthly Gallery Uploads
    const [galleryMonthly] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS count
      FROM gallery_items
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY ym
    `);

    // 4. Query Real Monthly Video Sessions
    const [sessionsMonthly] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS count
      FROM video_items
      WHERE category = 'Session' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY ym
    `);

    // 5. Query Real Monthly Family Stories
    const [familyMonthly] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS count
      FROM video_items
      WHERE category = 'Family' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY ym
    `);

    // Map DB counts into monthly timeline
    const activityTrend = months.map((m) => {
      const gMatch = galleryMonthly.find((r) => r.ym === m.key);
      const sMatch = sessionsMonthly.find((r) => r.ym === m.key);
      const fMatch = familyMonthly.find((r) => r.ym === m.key);

      return {
        month: m.month,
        photos: gMatch ? Number(gMatch.count) : 0,
        sessions: sMatch ? Number(sMatch.count) : 0,
        testimonials: fMatch ? Number(fMatch.count) : 0,
      };
    });

    // 6. Real Content Distribution Breakdown
    const distribution = [
      { name: "Gallery Photos", value: Number(totalGallery) },
      { name: "Session Videos", value: Number(totalSessions) },
      { name: "Family Stories", value: Number(totalFamily) },
      { name: "Specialists", value: Number(totalSpecialists) },
    ];

    // 7. Recent Items
    const [recentSpecialists] = await pool.query(
      "SELECT id, name, role, skills, whatsapp_number, profile_picture FROM team_members ORDER BY id DESC LIMIT 4"
    );

    const [recentVideos] = await pool.query(
      "SELECT id, category, title, badge, video_type, video_url, thumbnail_url, parent_name, created_at FROM video_items ORDER BY id DESC LIMIT 4"
    );

    const [recentGallery] = await pool.query(
      "SELECT id, title, image_url, created_at FROM gallery_items ORDER BY id DESC LIMIT 4"
    );

    return {
      totals: {
        specialists: Number(totalSpecialists),
        gallery: Number(totalGallery),
        sessionVideos: Number(totalSessions),
        familyVideos: Number(totalFamily),
        totalVideos: Number(totalSessions) + Number(totalFamily),
      },
      activityTrend,
      distribution,
      recentSpecialists,
      recentVideos,
      recentGallery,
    };
  },
};

module.exports = AnalyticsModel;
