const codeDiv = document.getElementById("code-input");
const loadingDiv = document.getElementById("loading");
const phoneDiv = document.getElementById("phone-input");
const statusDiv = document.getElementById("status");

async function send(channel) {
  loading(true);

  try {
    await fetch(`/send?channel=${channel}&to=${to10DLC(phoneDiv.value)}`).then(
      (res) => res.text()
    );
    setStatus("Sent");
  } catch (error) {
    console.error(error);
  }

  loading(false);
}

async function verify() {
  loading(true);

  try {
    const result = await fetch(
      `/verify?code=${codeDiv.value}&to=${to10DLC(phoneDiv.value)}`
    ).then((res) => res.json());
    if (result.status === "approved") setStatus("Approved");
    else setStatus("Rejected");
  } catch (error) {
    setStatus("Rejected");
  }

  loading(false);
}

function setStatus(status) {
  switch (status.toLowerCase()) {
    case "approved":
      statusDiv.style = "color: green";
      break;
    case "rejected":
      statusDiv.style = "color: red";
      break;
    case "sent":
      statusDiv.style = "color: black";
  }

  statusDiv.innerText = status;
}

function loading(isLoading) {
  if (isLoading) loadingDiv.style = "display:auto;";
  else loadingDiv.style = "display:none;";
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
