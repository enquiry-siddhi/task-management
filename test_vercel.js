const https = require('https');

const options = {
  hostname: 'api.vercel.com',
  path: '/v9/projects',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer prj_0lPjv3cz2WTGOjuiGr4s7YeH6ZaW',
    'Content-Type': 'application/json'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.substring(0, 500));
  });
}).on('error', err => console.error('Error:', err.message));
