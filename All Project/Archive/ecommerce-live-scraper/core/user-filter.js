// User Filter - Blacklist, Whitelist, VIP List
class UserFilter {
  constructor(options = {}) {
    this.blacklist = new Set(options.blacklist || []);
    this.whitelist = new Set(options.whitelist || []);
    this.viplist = new Set(options.viplist || []);
  }

  // Check if user should be filtered out
  shouldFilter(username) {
    // VIP users always pass
    if (this.isVIP(username)) {
      return false;
    }

    // If whitelist exists and not empty, only whitelisted users pass
    if (this.whitelist.size > 0) {
      return !this.whitelist.has(username.toLowerCase());
    }

    // Otherwise, filter if in blacklist
    return this.blacklist.has(username.toLowerCase());
  }

  // Check if user is VIP
  isVIP(username) {
    return this.viplist.has(username.toLowerCase());
  }

  // Check if user is blacklisted
  isBlacklisted(username) {
    return this.blacklist.has(username.toLowerCase());
  }

  // Check if user is whitelisted
  isWhitelisted(username) {
    return this.whitelist.has(username.toLowerCase());
  }

  // Add user to blacklist
  addToBlacklist(username) {
    this.blacklist.add(username.toLowerCase());
  }

  // Remove user from blacklist
  removeFromBlacklist(username) {
    this.blacklist.delete(username.toLowerCase());
  }

  // Add user to whitelist
  addToWhitelist(username) {
    this.whitelist.add(username.toLowerCase());
  }

  // Remove user from whitelist
  removeFromWhitelist(username) {
    this.whitelist.delete(username.toLowerCase());
  }

  // Add user to VIP list
  addToVIPList(username) {
    this.viplist.add(username.toLowerCase());
  }

  // Remove user from VIP list
  removeFromVIPList(username) {
    this.viplist.delete(username.toLowerCase());
  }

  // Update all lists
  updateLists(options = {}) {
    if (options.blacklist) {
      this.blacklist = new Set(options.blacklist.map(u => u.toLowerCase()));
    }
    if (options.whitelist) {
      this.whitelist = new Set(options.whitelist.map(u => u.toLowerCase()));
    }
    if (options.viplist) {
      this.viplist = new Set(options.viplist.map(u => u.toLowerCase()));
    }
  }

  // Get all lists
  getLists() {
    return {
      blacklist: Array.from(this.blacklist),
      whitelist: Array.from(this.whitelist),
      viplist: Array.from(this.viplist)
    };
  }

  // Clear all lists
  clearAll() {
    this.blacklist.clear();
    this.whitelist.clear();
    this.viplist.clear();
  }

  // Get statistics
  getStats() {
    return {
      blacklist: this.blacklist.size,
      whitelist: this.whitelist.size,
      viplist: this.viplist.size
    };
  }
}

module.exports = UserFilter;
