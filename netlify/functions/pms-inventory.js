const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
  const { fromDate, toDate } = JSON.parse(event.body);

  const xmlRequest = `
    <RES_Request>
      <Request_Type>Inventory</Request_Type>
      <Authentication>
        <HotelCode>102</HotelCode>
        <AuthCode>964565257540601c7c-ed65-11ec-9</AuthCode>
      </Authentication>
      <FromDate>${fromDate}</FromDate>
      <ToDate>${toDate}</ToDate>
    </RES_Request>
  `;

  try {
    const response = await fetch('https://live.ipms247.com/pmsinterface/getdataAPI.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlRequest
    });
    const xmlData = await response.text();
    return {
      statusCode: 200,
      body: xmlData,
      headers: { 'Content-Type': 'application/xml' }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}; 