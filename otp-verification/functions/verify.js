const twilio = require("twilio");
require("dotenv").config();

const { ACCOUNT_SID, AUTH_TOKEN, VERIFY_SVC_SID } = process.env;
const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function (context, event, callback) {
  const code = event.code;
  const to = to10DLC(event.to);

  try {
    const result = await client.verify.v2
      .services(VERIFY_SVC_SID)
      .verificationChecks.create({ code, to });

    callback(null, result);
  } catch (error) {
    console.log(error);
    callback(error);
  }
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
