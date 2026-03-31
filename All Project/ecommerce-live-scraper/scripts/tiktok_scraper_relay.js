// TikTok LIVE Comment Scraper using Chrome Relay
const https = require('https');

const TARGET_ID = '44345203494BC318F4D80FE982539839';
const DURATION = 60; // seconds
const INTERVAL = 3; // seconds

const allComments = [];
const seenKeys = new Set();

// Function to call browser API
function browserEvaluate(script) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      action: 'act',
      profile: 'chrome',
      targetId: TARGET_ID,
      request: {
        kind: 'evaluate',
        fn: script
      }
    });

    const options = {
      hostname: 'localhost',
      port: 8080, // OpenClaw gateway port
      path: '/api/browser',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const extractScript = `
(function() {
  const comments = [];
  
  // Multiple selectors to try
  const containerSelectors = [
    '[data-e2e="comment-item"]',
    '.comment-item',
    '[class*="Comment"]',
    '[class*="ChatItem"]',
    '.live-comment-item'
  ];
  
  const usernameSelectors = [
    '[data-e2e="comment-username"]',
    '.comment-username',
    '[class*="Username"]',
    '[class*="username"]'
  ];
  
  const textSelectors = [
    '[data-e2e="comment-text"]',
    '.comment-text-content',
    '[class*="CommentText"]',
    '[class*="comment-text"]',
    '[class*="Text"]'
  ];
  
  // Find elements
  function findAll(selectors) {
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) return Array.from(els);
    }
    return [];
  }
  
  function findText(parent, selectors) {
    for (const sel of selectors) {
      const el = parent.querySelector(sel);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return '';
  }
  
  const commentEls = findAll(containerSelectors);
  
  commentEls.forEach((el) => {
    const username = findText(el, usernameSelectors) || 'Unknown';
    const text = findText(el, textSelectors);
    
    if (text) {
      comments.push({ username, comment: text });
    }
  });
  
  return { count: comments.length, comments };
})()
`;

async function scrape() {
  console.log('Starting TikTok LIVE scraper via Chrome Relay...');
  console.log(`Duration: ${DURATION}s | Interval: ${INTERVAL}s\n`);
  
  const startTime = Date.now();
  let round = 0;
  
  while ((Date.now() - startTime) / 1000 < DURATION) {
    round++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    
    console.log(`[Round ${round} | ${elapsed}s] Fetching...`);
    
    try {
      const result = await browserEvaluate(extractScript);
      const data = result.result?.value || { comments: [] };
      
      let newCount = 0;
      (data.comments || []).forEach(({ username, comment }) => {
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
      
      console.log(`  Found ${data.count || 0} total, ${newCount} new (total: ${allComments.length})`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, INTERVAL * 1000));
  }
  
  console.log(`\nCompleted! Total unique comments: ${allComments.length}\n`);
  console.log(JSON.stringify(allComments, null, 2));
}

scrape().catch(console.error);
