const https = require('https');

const options = {
  hostname: 'ihsogkyivbgdjgoyxhyv.supabase.co',
  path: '/rest/v1/tasks?select=id&limit=5',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_xdOd2oJZDIYWm2bzWcslfg_CbT0SvyA',
    'Authorization': 'Bearer sb_publishable_xdOd2oJZDIYWm2bzWcslfg_CbT0SvyA'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
