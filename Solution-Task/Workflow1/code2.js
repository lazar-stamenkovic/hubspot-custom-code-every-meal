var request = require('request');

exports.main = async (event, callback) => {
  const dealId = event.inputFields['hs_object_id'];
  const accessToken = process.env.accessToken;
  const taskId = '42633296477'
  try {
    const res = await new Promise((resolve, reject) => {
      var options = {
        'method': 'PUT',
        'url': `https://api.hubapi.com/crm/v4/objects/deal/${dealId}/associations/task/${taskId}`,
        'headers': {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify([
          {
           "associationCategory": "HUBSPOT_DEFINED",
           "associationTypeId": 215
          }
        ])
      };
      request(options, function (error, response) {
        if (error) {
          reject(error);
          return;
        }
        try {
          const responseData = JSON.parse(response.body);
          console.log('3333', responseData)
          if (responseData.status == 'error'){
            reject(error);
            return
          }
          if (responseData.toObjectId == taskId) {
            resolve(responseData);
          } else {
            reject(`failed to assign to task ${response.body}`);
          }
        } catch (e) {
          reject(e)
        }
      });
    });
    callback({ outputFields: {
      success: true
    }});
  } catch(e) {
    // TODO - add error hander if failed to get values
    console.error(e);
    throw e;
  }
};
