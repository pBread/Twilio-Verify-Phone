const twilio = require("twilio");

const { ACCOUNT_SID, AUTH_TOKEN, MSG_SVC_SID, ORIGIN, SYNC_SVC_SID } =
  process.env;
const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function (context, event, callback) {
  const phone = to10DLC(event.phone);
  await client.messages.create({
    body: `Hello, click the following link to confirm your identity: ${ORIGIN}/track-link?phone=${phone}`,
    messagingServiceSid: MSG_SVC_SID,
    to: phone,
  });

  await client.sync
    .services(SYNC_SVC_SID)
    .documents(phone)
    .update({ data: { status: "sent", updated: new Date().toLocaleString() } });

  callback(null, msg);
};

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
