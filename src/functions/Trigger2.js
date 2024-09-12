const { app } = require('@azure/functions');
const axios = require('axios');

app.http('Trigger2', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // Extract headers from the incoming request and log them
            const incomingHeaders = request.headers;
            context.log('Received Headers:', incomingHeaders);

            // Capture body from the incoming request if needed
            //const requestBody = request.body || {};

            // Add necessary headers (if any, such as Content-Type or Authorization) manually
            const headersToSend = {
                'Content-Type': 'application/json', // Example of a required header
                // Add any other necessary headers here
            };

            // Make the HTTP call to the endpoint and expect binary data
            const response = await axios({
                method: 'get', // Adjust the method as per your needs
                url: 'https://prod-21.uksouth.logic.azure.com/workflows/5ba0def50b7e43498b887e8aac99bfae/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wt-FxeMbuDM_UwFENGNdX-BGwFYX-u7hWtIqjw4Z5xQ',
                headers: headersToSend, // Pass only necessary headers
                responseType: 'arraybuffer', // Important: Expect binary data
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
