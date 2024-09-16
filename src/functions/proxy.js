// Import necessary modules
const { app } = require('@azure/functions'); // Azure Functions SDK
const axios = require('axios'); // HTTP client for making requests
const querystring = require('querystring'); // Utility to handle query strings
require('dotenv').config(); // Load environment variables from .env file

// Load environment variables for Logic App URL and Flow-Key
const FLOW_URL = process.env.FLOW_URL; // The external Logic App URL
const FLOW_KEY = process.env.FLOW_KEY; // Flow-Key for authentication or identification

// Define the HTTP trigger function
app.http('proxy', {
    methods: ['GET'], // Supported HTTP methods (GET and POST)
    authLevel: 'anonymous', // Authentication level for the Azure Function
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // Extract and log incoming request headers for debugging purposes
            const incomingHeaders = request.headers;
            context.log('Received Headers:', incomingHeaders);

            // Extract and log query parameters from the request URL
            const queryParams = request.query;
            context.log('Received Query Parameters:', queryParams);

            // Convert query parameters into a query string format
            const queryString = querystring.stringify(queryParams);

            // Construct the full URL for the external Logic App call
            // Append query string if it exists
            const fullUrl = queryString ? `${FLOW_URL}&${queryString}` : FLOW_URL;

            // Construct headers to send to the external Logic App
            const headersToSend = {
                ...incomingHeaders, // Include all original incoming headers
                'Flow-Key': FLOW_KEY || '', // Include the Flow-Key from environment variables
            };

            // Make the HTTP request to the external Logic App
            const response = await axios({
                method: 'get', // Use GET method to retrieve data
                url: fullUrl, // Full URL including query parameters
                headers: headersToSend, // Headers including all incoming and custom ones
                responseType: 'arraybuffer', // Expect binary data (e.g., files) as response
                timeout: 60000 // Timeout after 60 seconds if no response
            });

            // Return the response from the external service
            return {
                status: response.status, // Return the status code from the external request
                headers: {
                    ...response.headers, // Forward headers from the external response
                },
                body: response.data // Return the binary response data
            };

        } catch (error) {
            // Log and handle errors
            context.log(`Error occurred: ${error.message}`);
            return {
                status: error.response ? error.response.status : 500, // Return the status code if available, or default to 500
                body: error.message || "Error processing request" // Provide the error message
            };
        }
    }
});
