const inputDiv = document.getElementById("phone-input");
const statusTable = document.getElementById("status-table");

(async () => {
  const params = new URLSearchParams(location.search);
  const phone = to10DLC(params.get("phone"));
  if (phone) document.getElementById("phone-input").value = phone;
})();

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
