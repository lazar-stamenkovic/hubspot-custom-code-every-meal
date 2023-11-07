var request = require('request');
exports.main = async (event, callback) => {
  const dealId = event.inputFields['hs_object_id'];
  const checkNumber = event.inputFields['transaction_id_check_number'];
  const batchNumber = event.inputFields['batch_number'];
  const date = event.inputFields['date_of_gift'];
  const invoiceNumber = event.inputFields['netsuite_invoice_number'];
  const dateOfGift = new Date(parseInt(date));
  const year = dateOfGift.getFullYear();
  const month = String(dateOfGift.getMonth() + 1).padStart(2, '0');
  const day = String(dateOfGift.getDate()).padStart(2, '0');
  const dateAsString = `${year}-${month}-${day}`;

  var options = {
    'method': 'GET',
    'url': `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/line_items`,
    'headers': {
      'Authorization': `Bearer ${process.env.household}`
    }
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    const responseData = JSON.parse(response.body);
    const lineItemId = responseData.results[0].id;

    // Now, we will make a new request using the lineItemId as the ID variable in the URL
    var lineItemOptions = {
      'method': 'GET',
      'url': `https://api.hubapi.com/crm/v3/objects/line_items/${lineItemId}?properties=department&properties=class&properties=amount&properties=name`,
      'headers': {
        'Authorization': `Bearer ${process.env.household}`
      }
    };

    request(lineItemOptions, function (error, lineItemResponse) {
      if (error) throw new Error(error);
      const resData = JSON.parse(lineItemResponse.body);
      const price = resData.properties.amount
      const classLI = resData.properties.class
      const department = resData.properties.department
      const name = resData.properties.name
      let itemId, departmentId, classId

      switch (classLI) {
        case 'Temporarily Restricted Funds':
          classId=2
          break;
        case 'Unrestricted Funds':
          classId=1
          break;
        case 'Temporarily Restricted Funds - Capital Campaign':
          classId=436
          break;
        default:
          break;
      }

      switch (department) {
        case 'Capital Campaign':
          departmentId=16
          break;
        case 'Development':
          departmentId=7
          break;
        case 'Finance':
          departmentId=14
          break;
        case 'Food Sourcing':
          departmentId=1
          break;
        case 'Operations':
          departmentId=8
          break;
        case 'Program':
          departmentId=5
          break;
        case 'Supply Chain':
          departmentId=13
          break;
        case 'Transportation (Food)':
          departmentId=3
          break;
        case 'Volunteer':
          departmentId=15
          break;
        case 'Warehouse':
          departmentId=2
          break;
        default:
          break;
      }

      switch (name) {
        case '4001 - Sponsor Revenue':
          itemId=3596
          break;
        case '4403 - Public Events':
          itemId=3599
          break;
        case '4203 - Government Grants':
          itemId=2523
          break;
        case '4202 - Family/Private Foundations':
          itemId=2521
          break;
        case '4175 - Matching Gifts':
          itemId=2591
          break;
        case '4302 - Fundraising : External':
          itemId=2525
          break;
        case '4301 - Fundraising : Internal':
          itemId=2524
          break;
        case '4402 - Sponsored Events':
          itemId=2527
          break;
        case '4002 - Corporate & Organization Revenue':
          itemId=2529
          break;
        case '4125 - Individual Contributions':
          itemId=2530
          break;
        case '4201 - Corporate Foundations':
          itemId=2520
          break;
        case '4401 - Mobile Events':
          itemId=2526
          break;
        case '4150 - Donor Advised Contributions':
          itemId=2590
          break;
        case '4504 - Donated Goods and Services : Supplies & Equipment':
          itemId=2534
          break;
        case '4501 - Donated Goods and Services : Inventory':
          itemId=2531
          break;
        case '4507 - Donated Goods and Services : Transportation':
          itemId=2532
          break;
        case '4503 - Donated Goods and Services : Promotion & Marketing':
          itemId=2533
          break;
        case '4502 - Donated Goods and Services : Storage & Packing':
          itemId=3484
          break;
        case '4505 - Donated Goods and Services : Software':
          itemId=2535
          break;
        case '4506 - Donated Goods and Services : Other ':
          itemId=2536
          break;
        default:
          break;
      }

      callback({
        outputFields: {
          price: price,
          batchNumber: batchNumber,
          checkNumber: checkNumber,
          dealId: dealId,
          dateAsString: dateAsString,
          invoiceNumber: invoiceNumber,
          class: classId,
          department: departmentId,
          itemId: itemId
        }
      });
    });
  });
};
