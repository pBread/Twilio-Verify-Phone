let syncClient;
let syncDoc;
let token;

const params = new URLSearchParams(location.search);
const phone = to10DLC(params.get("phone"));

async function main() {
  if (!phone) throw Error("Invalid Phone Number");
  await setToken();
  await initSync();
  initSyncDoc(phone);
}

async function setToken() {
  token = await fetch("/generate-token").then((res) => res.json());
  if (syncClient) syncClient.update(token.jwt);
}

async function initSync() {
  syncClient = null;
  const _syncClient = new Twilio.Sync.SyncClient(token.jwt);
  await new Promise((resolve) =>
    _syncClient.on("connectionStateChanged", (state) => {
      console.log("connectionStateChanged", state);
      if (state === "connected") resolve();
    })
  );

  syncClient = _syncClient;

  syncClient.on("tokenAboutToExpire", setToken);
  syncClient.on("tokenExpired", setToken);
}

async function initSyncDoc(phone) {
  if (syncClient === undefined) return;
  if (syncDoc !== undefined) return;

  syncDoc = null;
  await new Promise((resolve) => {
    syncClient.document(phone).then(async (doc) => {
      console.log("doc created", doc);

      doc.on("updated", (event) => {
        console.log("doc updated", event);
        setStatus(event.data.status, event.data.updated);
      });
      syncDoc = doc;
      resolve();
    });
  });
}

function to10DLC(str) {
  try {
    const { area, country, prefix, line } = str.match(
      /^\s*(?:\+?(?<country>\d{1,3}))?[-. (]*(?<area>\d{3})[-. )]*(?<prefix>\d{3})[-. ]*(?<line>\d{4})(?: *x(\d+))?\s*$/
    ).groups;

    return `+${1}${area}${prefix}${line}`;
  } catch (error) {
    return null;
  }
}

main();
