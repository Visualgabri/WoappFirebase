const https = require('https');

https.get('https://definizionemuscolareestrema.com/Esercizi/Triceps_file/image037.gif', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  process.exit(0);
}).on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
