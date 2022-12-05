# Custom Sentry Alert to Slack 


The **Sentry** works quite nicely for most applications — it captures everything we send, categorizes it intelligently and pushes useful alerts to Slack.


Sentry allows you to build internal integrations that trigger webhooks for certain actions. Looking through the payload, it looked like we could extract what we needed and then push the relevant information to Slack.
To make this a reality we needed to:
- Create a service to accept a webhook and push to Slack.
- Configure Slack to receive the notification.
- Configure Sentry to send the webhook to the application.


## Installation
#### Running Locally
1. Create a clone of the Gather-bot repository on your local machine.
```
$ git clone https://github.com/Johnson-Dsouza/SentryToSlack.git
```
1. To Install all the dependencies with:
```sh
cd SentryToSlack
npm init -y
npm i crypto
npm install node-fetch
npm install @sentry/node
```

## Create a Service for the Sentry Webhook
We will be using serverless to configure lambda function to get triggered when sentry monitors an event.

A few changes:
- To add slack channel name in `index.js`:

```
const DEFAULT_CHANNEL = 'channel-name';
```
- To add environment variables in `serverless.yml`:

```
 environment:
      SLACK_TOKEN_SECRET: <----- Bot User OAuth Token from slack 
      SLACK_API_URL: <----- chat.postMessage endpoint from slack 
      DEBUG: true
      SENTRY_SECRET: <----- Client Secret from Internal Integration from sentry
      SENTRY_DSN: <------ public Data Source Name(DSN) from sentry
```

1. With the application developed, a simple command sends it up to the cloud and gives us the endpoint we need to use:

	```
	sls deploy --stage production
	```

	After successfully deploying, will get endpoint:
	
	```
	https://url_from_serverless/test
	```

## Configure Slack to Receive the Notification
We have use chat.postMessage endpoint and created a new application to give us the correct permissions.  
1. [Build a new app](https://api.slack.com/apps "Build a new app")
1. Click on “OAuth & Permissions”, then configure “Scopes" by adding chat:write.public:
![BotTokenScopes](https://user-images.githubusercontent.com/60909862/205455498-5aa91449-d95e-4985-aac0-73fbed624655.png)
1. Now you can install the app into your workspace and the token (i.e. Bot User OAuth Token) you get will allow your app to write to whatever public channel it needs.

## Configure Sentry to Send the Webhook to our Serverless Application
1. Enter the name and details for your project (using the Serverless url with endpoint from the Serverless step above) and enable the Alert Rule Action:
  
   ![CreateInternalIntegration-1](https://user-images.githubusercontent.com/60909862/205455435-7585b9b2-0848-4fd3-9e82-2c7c35accf80.png)
  
   Enable read access for Issue & Event:
  
   ![CreateInternalIntegration-2](https://user-images.githubusercontent.com/60909862/205455439-6b1b6f14-38a0-4501-b28b-4b1536f74d0f.png)
  
   Select the Issue and Error:
  
   ![CreateInternalInegration-3](https://user-images.githubusercontent.com/60909862/205455442-1d32205d-0e81-48e1-9b44-d92971241701.png)
    
    Once created, you will get “Client Secret” from Credentials. 
   
1. With the above configured, you can now configure the Sentry applications to send alerts to this new integration:
    ![CreateNewAlert-1](https://user-images.githubusercontent.com/60909862/205455274-9c45e2b6-5a86-403f-9620-123b17495b47.png)
    ![CreateNewAlert-2](https://user-images.githubusercontent.com/60909862/205455337-d12ea44a-9cea-4c54-9d72-207c154a2c01.png)
