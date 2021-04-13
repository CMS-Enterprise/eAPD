```mermaid
sequenceDiagram
  participant W as Web App
  participant S as Server
  participant O as Okta

  W->>S: Get user information
  Note over W,S: GET /me with access token as Bearer
  S-->>O: Validate user access token
  Note over O,S: verify.verifyAccessToken(<br/>token, applicationName<br/>)
  O->>S: Return Okta access claims
  Note over O,S: { ..., uid: userId, ... }
  S-->>O: Get user profile
  Note over O,S: oktaClient.getUser(userId)
  O->>S: Return user profile
  Note over O,S: { <br />...,<br/>uid: userId,<br />displayName: displayName,<br />status: 'ACTIVE',<br />... <br />}
  S->>S: Retrieve authorizated roles from database
  S->>S: Retrive allowed activities from database
  S-->>W: Return user profile, role, and access
  Note over W,S: {<br/>...,<br>activities: [activities],<br/>id: userId,<br/> name: displayName,<br/>state: state,<br/>role: role,<br/>...<br/>}
```
