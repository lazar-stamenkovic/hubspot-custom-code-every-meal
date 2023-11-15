const http = require("https");

exports.main = async (event, callback) => {
  /*****
    Use inputs to get data from any action in your workflow and use it in your code instead of having to use the HubSpot API.
  *****/
  const ticketId = event.inputFields['ticketId'];
  const accessToken = process.env.accessToken;

  const option = {
    "method": "PATCH",
    "hostname": "api.hubapi.com",
    "port": null,
    "path": `/crm/v3/objects/tickets/${ticketId}`,
    "headers": {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": `Bearer ${accessToken}`
    }
  };

  const result = await new Promise((resolve, reject) => {
    let req = http.request(option, function (res) {
      var get_ns_cust_id_chunks = [];

      res.on("data", function (chunk) {
        get_ns_cust_id_chunks.push(chunk);
      });

      res.on("end", function () {
        resolve(true)
      });
    });
    req.write(JSON.stringify({properties: { hs_pipeline_stage: '127052143' }}));
    req.end();
  })

  /*****
    Use the callback function to output data that can be used in later actions in your workflow.
  *****/
  callback({
    outputFields: {
      success: result
    }
  });
}
