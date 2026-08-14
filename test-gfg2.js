const https = require('https');
https.get('https://auth.geeksforgeeks.org/user/nahramcvj/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Length:', data.length));
});
