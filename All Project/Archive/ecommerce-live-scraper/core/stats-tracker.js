// Statistics Tracker - Track comments, users, and performance
class StatsTracker {
  constructor() {
    this.startTime = null;
    this.totalComments = 0;
    this.platformStats = {};
    this.userStats = {};
    this.timeline = [];
    this.lastMinuteComments = [];
  }

  start() {
    this.startTime = Date.now();
    this.totalComments = 0;
    this.platformStats = {};
    this.userStats = {};
    this.timeline = [];
    this.lastMinuteComments = [];
  }

  addComment(comment) {
    this.totalComments++;
    
    // Update platform stats
    if (!this.platformStats[comment.platform]) {
      this.platformStats[comment.platform] = 0;
    }
    this.platformStats[comment.platform]++;
    
    // Update user stats
    if (!this.userStats[comment.username]) {
      this.userStats[comment.username] = 0;
    }
    this.userStats[comment.username]++;
    
    // Add to timeline
    this.timeline.push({
      timestamp: Date.now(),
      platform: comment.platform,
      username: comment.username
    });
    
    // Update last minute comments
    this.lastMinuteComments.push(Date.now());
    this.cleanupLastMinute();
  }

  cleanupLastMinute() {
    const oneMinuteAgo = Date.now() - 60000;
    this.lastMinuteComments = this.lastMinuteComments.filter(t => t > oneMinuteAgo);
  }

  getCommentsPerMinute() {
    this.cleanupLastMinute();
    return this.lastMinuteComments.length;
  }

  getTopUsers(limit = 10) {
    return Object.entries(this.userStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([username, count]) => ({ username, count }));
  }

  getPlatformBreakdown() {
    return this.platformStats;
  }

  getTimeline(points = 20) {
    if (this.timeline.length === 0) return [];
    
    const step = Math.max(1, Math.floor(this.timeline.length / points));
    const result = [];
    
    for (let i = 0; i < this.timeline.length; i += step) {
      const slice = this.timeline.slice(i, i + step);
      result.push({
        timestamp: slice[0].timestamp,
        count: slice.length
      });
    }
    
    return result;
  }

  getUptime() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getStats() {
    return {
      totalComments: this.totalComments,
      commentsPerMinute: this.getCommentsPerMinute(),
      topUsers: this.getTopUsers(),
      platformBreakdown: this.getPlatformBreakdown(),
      timeline: this.getTimeline(),
      uptime: this.getUptime()
    };
  }

  reset() {
    this.startTime = null;
    this.totalComments = 0;
    this.platformStats = {};
    this.userStats = {};
    this.timeline = [];
    this.lastMinuteComments = [];
  }
}

module.exports = StatsTracker;
