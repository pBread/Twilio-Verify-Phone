const confirmedDiv = document.getElementById("confirmed");
const rejectedDiv = document.getElementById("rejected");
const verificationDiv = document.getElementById("verification");

const params = new URLSearchParams(location.search);
const phone = to10DLC(params.get("phone"));
if (!phone) throw Error("Invalid Phone Number");

/****************************************************
 Initialization
****************************************************/
(async () => {
  await syncPromise;
  await initSyncDoc(phone);
  syncDoc.update({ status: "opened", updated: new Date().toLocaleString() });
})();

/****************************************************
 Page Actions
****************************************************/
async function reject() {
  syncDoc.update({ status: "rejected", updated: new Date().toLocaleString() });
  confirmedDiv.style = "display:none;";
  rejectedDiv.style = "display:auto;";
  verificationDiv.style = "display:none;";
}

async function confirm() {
  syncDoc.update({ status: "confirmed", updated: new Date().toLocaleString() });
  confirmedDiv.style = "display:auto;";
  rejectedDiv.style = "display:none;";
  verificationDiv.style = "display:none;";
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
