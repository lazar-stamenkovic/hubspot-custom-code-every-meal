const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request');
exports.main = async (event, callback) => {
  const dealId = event.inputFields['dealId'];
  const BaseURL = 'https://4147491.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql';
  const BaseURLEncoded = encodeURIComponent(BaseURL);

  const TimeStamp = Math.floor(new Date().getTime() / 1000);
  const Nonce = Math.floor(Math.random() * (99999999 - 9999999) + 9999999).toString();
  const ConsumerKey = process.env.consumerKey;
  const ConsumerSecret = process.env.consumerSecret;
  const TokenID = process.env.tokenId;
  const TokenSecret = process.env.tokenSecret;

  // Concatenating and URL Encoding Parameters
  const ConcatenatedParameters = querystring.stringify({
    oauth_consumer_key: ConsumerKey,
    oauth_nonce: Nonce,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: TimeStamp,
    oauth_token: TokenID,
    oauth_version: '1.0',
  });
  const ConcatenatedParametersEncoded = encodeURIComponent(ConcatenatedParameters);

  // Prepare Signature
  const SignatureMessage = `POST&${BaseURLEncoded}&${ConcatenatedParametersEncoded}`;

  // Creating Signature Key
  const SignatureKey = `${ConsumerSecret}&${TokenSecret}`;

  // Create Signature
  const signature = crypto.createHmac('sha256', SignatureKey)
    .update(SignatureMessage)
    .digest('base64');

  // URL Encode the Signature
  const SignatureEncoded = encodeURIComponent(signature);

  // Create Authorization
  const Realm = '4147491';
  const AuthorizationHeader = `OAuth realm="${Realm}",oauth_consumer_key="${ConsumerKey}",oauth_token="${TokenID}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${TimeStamp}",oauth_nonce="${Nonce}",oauth_version="1.0",oauth_signature="${SignatureEncoded}"`;
  console.log(AuthorizationHeader)

    var options = {
    'method': 'POST',
    'url': 'https://4147491.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql',
    'headers': {
      'Prefer': 'transient',
      'Content-Type': 'application/json',
      'Authorization': `${AuthorizationHeader}`
    },
    body: JSON.stringify({
      "q": `SELECT * FROM transaction where custbodyem_deal_transaction_id=${dealId}`
    })
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const res = JSON.parse(response.body);
    const tranId=res.items[0].tranid
    callback({
        outputFields: {
          TransactionId: tranId
        }
      });
  });
};
