const { JWT } = require('google-auth-library');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  console.log('Authenticating...');
  await client.authorize();

  const projectId = serviceAccount.project_id;
  const listUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;
  
  console.log(`Fetching web apps for project: ${projectId}...`);
  let response = await client.request({ url: listUrl });
  let webApps = response.data.apps || [];
  
  if (webApps.length === 0) {
    console.log('No web apps found. Registering a new Web App "WoappWeb"...');
    const createResponse = await client.request({
      url: listUrl,
      method: 'POST',
      data: {
        displayName: 'WoappWeb'
      }
    });
    
    console.log('Register request sent. Operation:', createResponse.data.name);
    console.log('Waiting 5 seconds for creation to complete...');
    await sleep(5000);
    
    console.log('Fetching web apps list again...');
    response = await client.request({ url: listUrl });
    webApps = response.data.apps || [];
  }

  if (webApps.length === 0) {
    console.log('Still no web apps found. Please check Firebase console.');
    return;
  }

  for (const app of webApps) {
    console.log(`\nFound Web App: ${app.displayName} (${app.appId})`);
    const configUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${app.appId}/config`;
    try {
      const configResponse = await client.request({ url: configUrl });
      console.log('Configuration:');
      console.log(JSON.stringify(configResponse.data, null, 2));
    } catch (err) {
      console.error(`Error fetching config for ${app.appId}:`, err.message);
    }
  }
}

main().catch(console.error);
