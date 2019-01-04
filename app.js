const tmi = require('tmi.js');
require('dotenv').config();

const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_OAUTH
    },
    channels: ['draaxx']
}

const client = new tmi.client(options);
client.connect();

client.on('connected', (address, port) => {
    client.action('draaxx', 'Yoooo! DraaxxBot here, holla at ya computer!');
});

client.on('chat', (channel, user, message, self) => {
    console.log('message:');
    console.log(message);
    console.log('user:');
    console.log(user);
    console.log('self:');
    console.log(self);
    client.action('draaxx', `Yooo @${user['display-name']}! What you doin?`);
});

// message = exact message player inputs as a string

// user:
// { badges: { broadcaster: '1', premium: '1' },
// color: '#0000FF',
// 'display-name': 'Draaxx',
// emotes: null,
// flags: null,
// id: 'fd5f3f3f-d903-4679-9b21-827c6d58b306',
// mod: false,
// 'room-id': '23577841',
// subscriber: false,
// 'tmi-sent-ts': '1546574810929',
// turbo: false,
// 'user-id': '23577841',
// 'user-type': null,
// 'emotes-raw': null,
// 'badges-raw': 'broadcaster/1,premium/1',
// username: 'draaxx',
// 'message-type': 'chat' }

// self = boolean