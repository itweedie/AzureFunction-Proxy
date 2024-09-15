const { app } = require('@azure/functions');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs').promises;
const path = require('path');

app.http('proxy', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // Extract headers from the incoming request and log them
            const incomingHeaders = request.headers;
            //context.log('Received Headers:', incomingHeaders);

            // Extract query parameters from the incoming request
            const queryParams = request.query;
            context.log('Received Query Parameters:', queryParams);

            // Check if the 'route' query parameter exists
            const route = queryParams.route;
            if (!route) {
                return {
                    status: 400,
                    body: "Missing 'route' query parameter"
                };
            }

            // Load the JSON file containing route-to-endpoint mappings
            const routesFilePath = path.join(__dirname, 'routes.json');
            const routesData = await fs.readFile(routesFilePath, 'utf8');
            const routes = JSON.parse(routesData);

            // Lookup the route in the JSON file
            const endpointUrl = routes[route];
            if (!endpointUrl) {
                return {
                    status: 400,
                    body: `No endpoint found for route: ${route}`
                };
            }

            // Convert any additional query parameters to a query string format (excluding the 'route' parameter)
            const additionalQueryParams = { ...queryParams };
            delete additionalQueryParams.route;
            const queryString = querystring.stringify(additionalQueryParams);

            // Append the additional query string to the endpoint URL (if any additional query string exists)
            const fullUrl = queryString ? `${endpointUrl}?${queryString}` : endpointUrl;

            // Add necessary headers, including the custom header 'X-MS-CLIENT-PRINCIPAL-ID'
            const headersToSend = {
                'Content-Type': 'application/json', // Example of a required header
                'X-MS-CLIENT-PRINCIPAL-ID': incomingHeaders['x-ms-client-principal-id'] || '', // Pass the required header
                // Add any other necessary headers here
            };

            // Make the HTTP GET call to the endpoint
            const response = await axios({
                method: 'get',
                url: fullUrl, // Use the full URL with query parameters
                headers: headersToSend, // Pass the necessary headers
                responseType: 'arraybuffer', // Important: Expect binary data if file response
                timeout: 60000 // Optional: set a timeout for long responses
            });

            // Return the binary data and set proper headers
            return {
                status: response.status,
                headers: {
                    ...response.headers, // Pass original headers back
                    'Content-Type': response.headers['content-type'], // Ensure correct Content-Type is returned
                    'Content-Disposition': response.headers['content-disposition'], // Pass through file name, if any
                },
                body: response.data // Binary data
            };

        } catch (error) {
            context.log(`Error occurred: ${error.message}`);
            // Handle errors and return appropriate status
            return {
                status: error.response ? error.response.status : 500,
                body: error.message || "Error processing request"
            };
        }
    }
});
