const {
    SLACK_TOKEN_SECRET,
    SLACK_API_URL,
} = process.env;

const fetch = require('node-fetch');

const slackPost = (endpoint, endpointParams) => {
    const url = new URL(SLACK_API_URL + endpoint)
    const defaultParams = {
    };
    const params = {...defaultParams, ...endpointParams}
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SLACK_TOKEN_SECRET}`
        }
    }).then(resp => resp.json())
};


const sendSlackMessage = async (channel, messageAttrs) => {
    console.log("In sendSlackMessage method");
    await slackPost('chat.postMessage', {
        channel: channel,
        icon_emoji: ':face_with_monocle:',
        username: 'SlackAway Reporter',
        ...messageAttrs
    });
};

module.exports = sendSlackMessage;