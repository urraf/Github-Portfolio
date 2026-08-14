const https = require('https');
https.get('https://www.geeksforgeeks.org/profile/nahramcvj/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/Problems Solved.*?(\d+)/i);
    console.log('GFG matches:', match);
    if(data.length > 0) console.log('Length:', data.length);
  });
});
