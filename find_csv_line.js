const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('WOAPP_STORYBOARD.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('WO A [1:05 32% / 1h 28%]')) {
      console.log("Raw CSV Line:");
      console.log(line);
      break;
    }
  }
}

run();
