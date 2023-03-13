let syncClient;
let syncDoc;
let token;

const inputDiv = document.getElementById("phone-input");
const statusTable = document.getElementById("status-table");

async function main() {
  const params = new URLSearchParams(location.search);
  const phone = to10DLC(params.get("phone"));
  if (phone) document.getElementById("phone-input").value = phone;

  await setToken();
  await initSync();
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

async function send() {
  const phone = to10DLC(inputDiv.value);
  if (!phone) return setStatus("Invalid Phone Number");
  await initSyncDoc(phone);
  syncDoc.update({ status: "sending", updated: new Date().toLocaleString() });

  await fetch("/send-link?phone=+18475070348");
}

async function check() {
  const phone = to10DLC(inputDiv.value);
  if (!phone) return setStatus("Invalid Phone Number");

  await initSyncDoc(phone);
  setStatus(syncDoc.data.status, syncDoc.data.updated);
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

function setStatus(status, date) {
  if (!date) date = new Date().toLocaleString();

  const row = document.createElement("tr");
  const thStatus = document.createElement("th");
  thStatus.innerText = status;
  const thDate = document.createElement("th");
  thDate.innerText = date;

  row.appendChild(thStatus);
  row.appendChild(thDate);
  statusTable.appendChild(row);
}

main();
