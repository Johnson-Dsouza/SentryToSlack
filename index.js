const crypto = require('crypto');
const sendSlackMessage = require('./slack');
const {
  SENTRY_SECRET,
  DEBUG,
  SENTRY_DSN,
} = process.env;

const Sentry = require("@sentry/node");
Sentry.init({dsn: SENTRY_DSN});

function sentryHandler(lambdaHandler) {
  console.log("In sentryHandler");
  return async event => {
    try {
      return await lambdaHandler(event);
    } catch (error) {
      Sentry.captureException(error);
      await Sentry.flush(2000);
      return error;
    }
  };
}

const DEFAULT_LEVEL = '#28b463'; //Green
const LEVEL_TO_COLOUR = {
  'error': '#cd5c5c', //IndianRed
  'warning': '#ffa07a' //LightSalmon
};

const DEFAULT_CHANNEL = 'channel-name';

const EVENT_TAGS = ['environment', 'level'];

const verifySignature = (request) => {
  console.log("Above if");
  if(DEBUG) {
    console.log("If true");
    return true;
  } else {
    console.log("Tf false");
    console.log(SENTRY_SECRET);
    const hmac = crypto.createHmac('sha256', SENTRY_SECRET);
    hmac.update(request.body, 'utf8');
    const digest = hmac.digest('hex');
    return digest === request.headers['Sentry-Hook-Signature'];
  }
};

// Output a set of fields to give an overview of the error
const buildField = (title, value) => {
  return {
    title: title,
    value: value,
    short: true
  }
};

const buildTagFields = (allTags) => {
  const tagsHash = allTags.reduce((acc, [tagName, tagValue]) => ({
    ...acc,
    [tagName]: tagValue
  }), {});

  return EVENT_TAGS.map(tag => buildField(tag, tagsHash[tag]));
};

// Helpers methods
const getColour = (level) => {
  return LEVEL_TO_COLOUR[level] || DEFAULT_LEVEL;
};

const getChannel = (projectId) => {
  return DEFAULT_CHANNEL;
};

// Build the message
const extractMessageBlocks = (event) => {
  console.log("In extractMessageBlocks");
  return {
    "attachments": [
      {
        "mrkdwn_in": ["text"],
        "color": getColour(event.level),
        "title": event.title,
        "title_link": event.web_url,
        "fields": [
          ...buildTagFields(event.tags),
          {
            "title": 'Message',
            "value": event.message,
            "short": false
          }
        ],
      }
    ]
  }
};


exports.main = sentryHandler(async (event) => {
  console.log("In main function");
  if(verifySignature(event)) {
    console.log("In verifySignature");
    if (event.headers['Sentry-Hook-Resource'] === 'event_alert') {
      console.log("In event_alert");
      const eventAlert = JSON.parse(event.body);
      const eventData = eventAlert.data.event;
      const slackBlocks = extractMessageBlocks(eventData);
      const channel = getChannel(eventData.project);
      await sendSlackMessage(channel, slackBlocks);
      console.log("Completed event_alert");
    }
    return {
      statusCode: 200,
      body: JSON.stringify({status: 'ok'})
    }
  } 
  else {
    return {
      statusCode: 401,
      body: JSON.stringify({status: 'denied'})
    }
  }
});