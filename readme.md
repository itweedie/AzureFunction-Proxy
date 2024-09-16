# AzureFunction-PowerAutomateProxy
This repository contains an Azure Function that acts as an HTTP Proxy to authenticate and forward requests to a Power Automate Flow. The function is designed to validate incoming requests and then route them to a Power Automate Flow, ensuring that only authenticated requests are processed.

## Features

- Forwards all headers received from the incoming request.
- Adds custom header `Flow-Key` (from environment variables).
- Handles `GET` method.
- Appends query parameters from the incoming request to the external URL.
- Configurable via environment variables to avoid hardcoding sensitive data like URLs and keys.
- Proper error handling and logging for easy debugging.


## Deployment Instructions

### 1. Fork the GitHub Repository
The first step is to fork the repository that contains the code for the Azure Function. This will allow you to create a copy of the repository under your own GitHub account.

- Navigate to the GitHub repository you want to fork.
- Click on the **Fork** button at the top-right corner of the repository page. This will create a copy of the repository in your GitHub account.

### 2. Deploy to Azure via Button
Once you have forked the repository, you can deploy the function app directly to Azure using the **Deploy to Azure** button.


After clicking the button, you will be prompted to provide the following parameters:

- **functionAppName**: Name of your Azure Function App.
- **hostingPlanName**: Name of the hosting plan (leave as default unless you want to customize).
- **logicAppUrl**: The URL of your Logic App (replace with your own Logic App URL).
- **flowKey**: Your Flow-Key value for the external Logic App.

### 3. Configure the Azure Deployment
Once you're on the custom deployment page in the Azure portal, you’ll need to configure the following settings:

- **Subscription**: Select your Azure subscription.
- **Resource Group**: Either select an existing resource group or create a new one.
- **Region**: Select the appropriate region for your deployment (closest to your users or where your infrastructure resides).
- **App Name**: Give your Azure Function app a unique name.

After configuring these settings, click the **Review + Create** button, followed by **Create** to start the deployment. Azure will automatically provision the resources based on your configuration.

### 4. Connect the Azure Function to Your GitHub Repository
Once the resources are created and the function app is deployed, the next step is to set up continuous deployment from your GitHub repository. Azure Functions has built-in support for this via the **Deployment Center**.

#### Steps to Connect:

1. **Navigate to the Azure Function**:
   - In the Azure portal, navigate to the resource group where your Azure Function was created.
   - Click on the Function App to open its dashboard.

2. **Open the Deployment Center**:
   - In the left-hand menu, scroll down and click on **Deployment Center**. This is where you can configure continuous deployment.

3. **Select GitHub as the Source**:
   - In the **Deployment Center**, you’ll be asked to choose a source for the code. Select **GitHub** as the source control provider.
   - Click on **Authorize** to grant Azure access to your GitHub account (if not already authorized).

4. **Choose Your Repository and Branch**:
   - Select the GitHub repository you forked earlier.
   - Choose the branch you want to deploy from, typically the default branch (e.g., `main` or `master`).

5. **Set Up Build Provider**:
   - You can choose between **GitHub Actions** or **Kudu** for deploying your code. 
     - **GitHub Actions** provides a more modern CI/CD pipeline.
     - **Kudu** offers a simple and integrated build experience.

6. **Review and Save**:
   - After selecting the repository and branch, review the setup.
   - Click on **Save** to establish the connection.

### 5. Verify the Deployment
After setting up continuous deployment, any new changes pushed to your forked GitHub repository will automatically trigger a deployment to your Azure Function. You can monitor the deployment status and logs in the **Deployment Center**.

- To verify that everything is working, navigate to your Function App URL (found in the Azure portal under the **Overview** tab of your Function App).
- You should see the function running as expected.

### 6. Update and Maintain the Azure Function
Whenever you want to update the Azure Function, simply commit and push your changes to the GitHub repository. The continuous deployment pipeline will automatically redeploy the latest changes to Azure.



## Setup Instructions

### Prerequisites flow Local Development

- [Node.js](https://nodejs.org/en/download/)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [GitHub Codespaces](https://docs.github.com/en/codespaces/getting-started/quickstart) (optional for development)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)
- Logic App URL and `Flow-Key`

### Local Development

1. **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2. **Install dependencies**:
    Make sure you have all the necessary dependencies installed:
    ```bash
    npm install
    ```

3. **Create a `.env` file**:
    Create a `.env` file in the root of your project directory with the following contents:

    ```env
    FLOW_URL=https://prod-21.uksouth.logic.azure.com/workflows/your-logic-app-url
    FLOW_KEY=your-flow-key-value
    ```

4. **Run the function locally**:
    Start the Azure Functions runtime locally:
    ```bash
    func start
    ```

    Your function will be available at: `http://localhost:7071/api/proxy`.

5. **Test the function**:
    Use a tool like `curl`, Postman, or your browser to send a `GET` or `POST` request to the function.

    Example with `curl`:
    ```bash
    curl -X GET http://localhost:7071/api/proxy -H "X-MS-CLIENT-PRINCIPAL-ID: custom-id"
    ```

    ### Configuration

- The external Power Automate Flow URL is set using the `FLOW_URL` environment variable.
- The `Flow-Key` header is added using the `FLOW_KEY` environment variable.
- The function automatically forwards all incoming headers to the external endpoint.

### Environment Variables

| Variable Name    | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `FLOW_URL`  | The URL for the external Logic App you are proxying to.   |
| `FLOW_KEY`       | The Flow-Key header used for authentication/identification. |

### Testing

- To test the function, you can browse to the end point, or send HTTP requests using `curl`, Postman, or any tool of your choice to the locally running or deployed function endpoint.
- The function will log incoming headers, query parameters, and errors for easier debugging.

### Contributing

Feel free to open issues or submit pull requests if you want to contribute to this project.

### License

This project is licensed under the MIT License.
