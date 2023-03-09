let syncClient;
let token;

async function main() {
  await setToken();
  initSync();
}

async function setToken() {
  token = await fetch("/generate-token").then((res) => res.json());
  if (syncClient) syncClient.update(token.jwt);
}

function initSync() {
  syncClient = new Twilio.Sync.SyncClient(token.jwt, { loglevel: "dev" });
  syncClient.on("connectionStateChanged", (state) => {
    console.log("connectionStateChanged: ", state);
  });

  syncClient.on("tokenAboutToExpire", setToken);
  syncClient.on("tokenExpired", setToken);
}

main();
