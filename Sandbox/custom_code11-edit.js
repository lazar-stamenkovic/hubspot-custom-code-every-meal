const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request');

function ns_auth(method,baseUrl){

  /**********Netsuitet***********/
 const BaseURLEncoded = encodeURIComponent(baseUrl);

 const TimeStamp = Math.floor(new Date().getTime() / 1000);
 const Nonce = Math.floor(Math.random() * (99999999 - 9999999) + 9999999).toString();
 const ConsumerKey = process.env.CONSUMER_KEY;
 const ConsumerSecret = process.env.CONSUMER_SECRET;
 const TokenID = process.env.TOKEN_ID;
 const TokenSecret = process.env.TOKEN_SECRET;

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
 const SignatureMessage = `${method}&${BaseURLEncoded}&${ConcatenatedParametersEncoded}`;

 // Creating Signature Key
 const SignatureKey = `${ConsumerSecret}&${TokenSecret}`;

 // Create Signature
 const signature = crypto.createHmac('sha256', SignatureKey)
 .update(SignatureMessage)
 .digest('base64');

 // URL Encode the Signature
 const SignatureEncoded = encodeURIComponent(signature);

 // Create Authorization
 const Realm = '4147491_SB1';
 const AuthorizationHeader = `OAuth realm="${Realm}",oauth_consumer_key="${ConsumerKey}",oauth_token="${TokenID}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${TimeStamp}",oauth_nonce="${Nonce}",oauth_version="1.0",oauth_signature="${SignatureEncoded}"`;
 //console.log(AuthorizationHeader)

 /******************************/
 /**** END Authentification ****/
 /******************************/
 return AuthorizationHeader;
}

exports.main = async (event, callback) => {
  const dealId = event.inputFields['dealId'];
  const BaseURL = 'https://4147491-sb1.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql';
  const AuthorizationHeader = ns_auth('POST', BaseURL)

    var options = {
    'method': 'POST',
    'url': BaseURL,
    'headers': {
      'Prefer': 'transient',
      'Content-Type': 'application/json',
      'Authorization': `${AuthorizationHeader}`
    },
    body: JSON.stringify({
      "q": `SELECT * FROM transaction where custbodyem_deal_transaction_id=${dealId}`
    })
  };
  try {
    const tranId = await new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) {
          return reject(error);
        }
        const res = JSON.parse(response.body);
        if (!res || !res.items || !res.items.length || !res.items[0].tranid) {
          return reject(`failed to get tran id - ${JSON.stringify(res)}`)
        }
        resolve(res.items[0].tranid)
      });
    });
    callback({
      outputFields: {
        TransactionId: tranId
      }
    });
  } catch(e) {
    console.error(e);
    throw e;
  }
};
