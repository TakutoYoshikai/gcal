# gcal
A simple google calendar library

### Usage
```bash
npm install --save TakutoYoshikai/gcal
```

step1. Create a Google Cloud Application.

step2. Enable Google Calendar API.

step3. Enable OAuth2 and Create OAuth Client ID (Choose Web Application).

step4. Set redirect uri to `http://localhost:3000/refresh_token`

step5. Download client secret json of the created OAuth Client ID.

```javascript
const GCClient = require("gcal");

const client = new GCClient("./credentials.json"); //downloaded client secret json.
  
(async () => { 
  console.log(client.authUrl()); // OAuth2 URL.
  await client.waitAuth(3000); // port is 3000.
  const events = await client.listEvents(); //Get events.
  console.log(events);
})();
```

### License
MIT License
