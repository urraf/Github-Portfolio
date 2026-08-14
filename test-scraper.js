const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const code360 = await fetchUrl('https://api.codingninjas.com/api/v3/public_section/profile/nahraf');
  console.log('Code360:', code360.slice(0, 100));
}
run();
