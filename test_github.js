const https = require('https');

https.get('https://visualgabri.github.io/Esercizi/Triceps_file/image037.gif', (res) => {
  console.log('Status Code for github.io:', res.statusCode);
  process.exit(0);
}).on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
