const http = require("https");

exports.main = async (event, callback) => {
  /*****
    Use inputs to get data from any action in your workflow and use it in your code instead of having to use the HubSpot API.
  *****/
  const ticketId = event.inputFields['hs_object_id'];
  const accessToken = process.env.accessToken;
  let offset = 0
  let hasMore = true
  let results = []
  while(hasMore) {
  	const res = await new Promise((resolve, reject) => {
      const options = {
        method: "GET",
        hostname: "api.hubapi.com",
        port: null,
        path: `/crm-associations/v1/associations/${ticketId}/USER_DEFINED/267?offset=${offset}`,
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const req = http.request(options, (res) => {
        let chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
        });
        res.on("end", async () => {
          const body = Buffer.concat(chunks);
          try {
            const ticketData = JSON.parse(body);
            resolve( ticketData );
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });
      req.end();
  	});
  	if (res.results) {
      hasMore = res.hasMore
      offset = res.offset
      results = results.concat(res.results);
    } else {
      hasMore = false
    }
  }
  callback({
    outputFields: {
      dealIds: results
    }
  });
}
