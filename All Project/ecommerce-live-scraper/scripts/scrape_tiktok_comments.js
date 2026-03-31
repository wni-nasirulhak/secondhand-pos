// TikTok LIVE Comment Scraper
// Returns array of {username, comment, timestamp}

const comments = [];
const seenComments = new Set();

// Try multiple selectors for TikTok LIVE
const selectors = {
  container: [
    '[data-e2e="comment-item"]',
    '.comment-item',
    '[class*="Comment"]',
    '[class*="comment"]'
  ],
  username: [
    '[data-e2e="comment-username"]',
    '.comment-username',
    '[class*="Username"]',
    '[class*="username"]'
  ],
  text: [
    '[data-e2e="comment-text"]',
    '.comment-text-content',
    '[class*="CommentText"]',
    '[class*="comment-text"]'
  ]
};

// Find elements using multiple selectors
function findElements(selectors) {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) return elements;
  }
  return [];
}

// Get text from element using multiple selectors
function getText(parent, selectors) {
  for (const selector of selectors) {
    const el = parent.querySelector(selector);
    if (el && el.textContent.trim()) return el.textContent.trim();
  }
  return '';
}

// Find comment containers
const commentElements = findElements(selectors.container);

console.log(`Found ${commentElements.length} comment elements`);

commentElements.forEach((element) => {
  try {
    const username = getText(element, selectors.username) || 'Unknown';
    const commentText = getText(element, selectors.text);
    
    if (!commentText) return;
    
    const key = `${username}:${commentText}`;
    
    if (!seenComments.has(key)) {
      seenComments.add(key);
      comments.push({
        username,
        comment: commentText,
        timestamp: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error('Error parsing comment:', e);
  }
});

console.log(`Extracted ${comments.length} unique comments`);
return comments;
