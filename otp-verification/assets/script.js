const codeDiv = document.getElementById("code-input");
const loadingDiv = document.getElementById("loading");
const phoneDiv = document.getElementById("phone-input");
const statusDiv = document.getElementById("status");

async function send(channel) {
  const phone = to10DLC(phoneDiv.value);
  start();

  await fetch(`/send?channel=${channel}&to=${phone}`).then((res) => res.text());
  finish();
  statusDiv.innerText = "Sent";
}

async function verify() {
  start();
  const phone = to10DLC(phoneDiv.value);
  const code = codeDiv.value;

  try {
    const result = await fetch(`/verify?code=${code}&to=${phone}`).then((res) =>
      res.json()
    );
    if (result.status === "approved") statusDiv.innerText = "Approved!";
    else statusDiv.innerText = "Rejected";
  } catch (error) {
    statusDiv.innerText = "Rejected";
  }

  finish();
}

function start() {
  loadingDiv.style = "display:auto;";
}

function finish() {
  loadingDiv.style = "display:none;";
}

function to10DLC(phone) {
  try {
    const { area, country, prefix, line } = phone.match(
      /^\s*(?:\+?(?<country>\d{1,3}))?[-. (]*(?<area>\d{3})[-. )]*(?<prefix>\d{3})[-. ]*(?<line>\d{4})(?: *x(\d+))?\s*$/
    ).groups;

    return `+${1}${area}${prefix}${line}`;
  } catch (error) {
    throw Error("Invalid phone number");
  }
}
