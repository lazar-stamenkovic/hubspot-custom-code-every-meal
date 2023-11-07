const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request');
exports.main = async (event) => {
  const dealId = event.inputFields['dealId'];
  const itemId = event.inputFields['itemId'];
  const classLI = event.inputFields['class'];
  const department = event.inputFields['department'];
  const price = event.inputFields['price'];
  const dateAsString = event.inputFields['dateAsString'];
  const checkNumber = event.inputFields['checkNumber'];
  const batchNumber = event.inputFields['batchNumber'];
  const BaseURL = 'https://4147491.suitetalk.api.netsuite.com/services/rest/record/v1/cashsale';
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
    'url': 'https://4147491.suitetalk.api.netsuite.com/services/rest/record/v1/cashsale',
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
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
};
