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

exports.main = async (event) => {
  const dealId = event.inputFields['dealId'];
  const itemId = event.inputFields['itemId'];
  const classLI = event.inputFields['class'];
  const department = event.inputFields['department'];
  const price = event.inputFields['price'];
  const dateAsString = event.inputFields['dateAsString'];
  const checkNumber = event.inputFields['checkNumber'];
  const batchNumber = event.inputFields['batchNumber'];
  const BaseURL = 'https://4147491-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/cashsale';
  const AuthorizationHeader = ns_auth('POST', BaseURL)
  console.log(AuthorizationHeader)

    var options = {
    'method': 'POST',
    'url': BaseURL,
    'headers': {
      'Authorization': `${AuthorizationHeader}`
    },
    body: JSON.stringify({
      "acctNumber": {
        "id": "1230"
    },
      "entity": {
        "id": "669137" //Customer
      },
      "class": {
        "id": classLI //Class
      },
      "location": {
        "id": "1" //Location
      },
      "custbodyem_deal_transaction_id": dealId, //DEAL TRANSACTION ID (HUBSPOT INTEGRATION)
      "custbodylgl_id": batchNumber, //REFERENCE/EXTERNAL #
      "otherRefNum": checkNumber, //CHECK #
      "tranDate": dateAsString, //Date
      "department": {
        "id": department //Department
      },
      "item": {
        "items": [
          {
            "item": {
              "id": itemId //ItemId
            },
            "amount": +price, //Amount
            "quantity": 1
          }
        ]
      }
    })
  };
  try {
    await new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) reject(error);
        console.log(response.body);
        resolve(response.body);
      });
    });
    console.log("finished")

  } catch(e) {
    console.error(e);
    throw e;
  }
};