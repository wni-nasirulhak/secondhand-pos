// TikTok LIVE Comment Scraper using CDP
const CDP = require('chrome-remote-interface');

const DURATION = 60; // seconds
const INTERVAL = 3; // seconds between checks
const TARGET_ID = '4C7CCC7A150CF75F42F37FA0FF88F50E';

const allComments = [];
const seenKeys = new Set();

async function extractComments(Runtime) {
  const script = `
    (function() {
      const comments = [];
      const selectors = {
        container: [
          '[data-e2e="comment-item"]',
          '.comment-item',
          '[class*="Comment"]'
        ],
        username: [
          '[data-e2e="comment-username"]',
          '.comment-username',
          '[class*="Username"]'
        ],
        text: [
          '[data-e2e="comment-text"]',
          '.comment-text-content',
          '[class*="CommentText"]'
        ]
      };
      
      function findElements(selectors) {
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) return Array.from(elements);
        }
        return [];
      }
      
      function getText(parent, selectors) {
        for (const selector of selectors) {
          const el = parent.querySelector(selector);
          if (el && el.textContent.trim()) return el.textContent.trim();
        }
        return '';
      }
      
      const commentElements = findElements(selectors.container);
      
      commentElements.forEach((element) => {
        try {
          const username = getText(element, selectors.username) || 'Unknown';
          const commentText = getText(element, selectors.text);
          
          if (commentText) {
            comments.push({ username, comment: commentText });
          }
        } catch (e) {}
      });
      
      return comments;
    })();
  `;
  
  const result = await Runtime.evaluate({ expression: script, returnByValue: true });
  return result.result.value || [];
}

async function main() {
  try {
    const client = await CDP({ target: TARGET_ID });
    const { Runtime } = client;
    
    await Runtime.enable();
    
    console.log('🔴 Starting TikTok LIVE comment scraper...');
    console.log(`⏱️  Duration: ${DURATION}s | Interval: ${INTERVAL}s\n`);
    
    const startTime = Date.now();
    let round = 0;
    
    while ((Date.now() - startTime) / 1000 < DURATION) {
      round++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      console.log(`[Round ${round} | ${elapsed}s] Fetching comments...`);
      
      const comments = await extractComments(Runtime);
      
      let newCount = 0;
      comments.forEach(({ username, comment }) => {
        const key = `${username}:${comment}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allComments.push({
            timestamp: new Date().toLocaleString('th-TH'),
            username,
            comment
          });
          newCount++;
        }
      });
      
      if (newCount > 0) {
        console.log(`  ✅ Found ${newCount} new comments (total: ${allComments.length})`);
      } else {
        console.log(`  ⏭️  No new comments`);
      }
      
      await new Promise(resolve => setTimeout(resolve, INTERVAL * 1000));
    }
    
    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Total unique comments: ${allComments.length}\n`);
    
    // Output as JSON for processing
    console.log(JSON.stringify(allComments, null, 2));
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
