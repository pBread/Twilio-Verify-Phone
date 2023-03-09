const Twilio = require("twilio");
require("dotenv").config();

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const SYNC_SVC_SID = process.env.SYNC_SVC_SID || "default";

const AccessToken = Twilio.jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;

exports.handler = function (context, event, callback) {
  const token = generateToken("customer-service-agent");
  callback(null, token);
};

function generateToken(identity) {
  // Create an access token which we will sign and return to the client
  const token = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);

  // Assign the provided identity
  token.identity = identity;

  // Point to a particular Sync service, or use the account default Service
  const syncGrant = new SyncGrant({ serviceSid: SYNC_SVC_SID });
  token.addGrant(syncGrant);

  // Serialize the token to a JWT string and include it in a JSON response
  return { identity: token.identity, jwt: token.toJwt() };
}
