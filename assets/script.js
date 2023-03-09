let syncClient;
let syncDoc;
let token;

const inputDiv = document.getElementById("phone-input");
const statusDiv = document.getElementById("verification-status");

async function main() {
  await setToken();
  initSync();
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

async function initSyncDoc() {
  if (syncClient === undefined) return;
  if (syncDoc !== undefined) return;

  const phone = getPhone();
  if (!phone) setStatus("Invalid Phone Number");

  syncDoc = null;
  await new Promise((resolve) => {
    syncClient.document(phone).then(async (doc) => {
      console.log("doc created", doc);

      doc.on("updated", (event) => {
        console.log("doc updated", event);
        setStatus(event.data.status);
      });
      syncDoc = doc;
      resolve();
    });
  });
}

async function send() {
  const phone = getPhone();
  if (!phone) return setStatus("Invalid Phone Number");
  await initSyncDoc();
  syncDoc.update({ status: "sending", updated: new Date().toLocaleString() });

  await fetch("/send-link?phone=+18475070348");
}

async function check() {
  const phone = getPhone();
  if (!phone) return setStatus("Invalid Phone Number");

  await initSyncDoc();
  setStatus(syncDoc.data.status);
}

function getPhone() {
  try {
    const { area, country, prefix, line } = inputDiv.value.match(
      /^\s*(?:\+?(?<country>\d{1,3}))?[-. (]*(?<area>\d{3})[-. )]*(?<prefix>\d{3})[-. ]*(?<line>\d{4})(?: *x(\d+))?\s*$/
    ).groups;

    return `+${1}${area}${prefix}${line}`;
  } catch (error) {
    return null;
  }
}

function setStatus(status) {
  statusDiv.innerText += `\n${status}`;
}

main();
