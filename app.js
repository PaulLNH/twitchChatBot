const tmi = require("tmi.js");
require("dotenv").config();
// const http = require('http');
const axios = require('axios');
const triviaQuestions = require("./trivia");
const supportedChannel = process.env.TWITCH_USERNAME;
const url = 'http://jservice.io/api/random';
var currentQuestion = {};

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

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
    channels: [supportedChannel]
};

const client = new tmi.client(options);
client.connect();

displayQuestion = () => {
    client.say(
        supportedChannel,
        `Category: ${currentQuestion.category.title} for ${currentQuestion.value} points.`
    );
};

getTriviaQuestionHTTP = () => {
    // http.get(url, res => {
    //     var body = '';

    //     res.on('data', chunk => body += chunk);

    //     res.on('end', () => {
    //         let parsedCurrentQuestion = body;
    //         currentQuestion = parsedCurrentQuestion[0];
    //         console.log(`Current Question: ${body}`);
    //         // return currentQuestion
    //     });
    // }).on('error', errpr => console.log("Got an error: ", err));
};

getTriviaQuestion = () => {
    axios.get(url)
        .then(response => {
            currentQuestion = response.data[0];
            console.log(response.data[0]);
            // console.log(response.data.explanation);
        })
        .catch(error => {
            console.log(error);
        });
};

startTriviaGame = () => {
    client
        .say(supportedChannel, `TRIVIA HAS BEGUN!`)
        .then(() => client.say(supportedChannel, `Category: "${currentQuestion.category.title}", worth $${currentQuestion.value}`))
        .then(() => client.say(supportedChannel, `${currentQuestion.question}`))
        .catch(error => console.log(`The following error occured: ${error}`));
}

displayCommandsList = () => {
    client
        .say(supportedChannel, `!hello - send salutations to yourself`)
        .then(() => client.say(supportedChannel, `!trivia - start a new trivia game`))
        .then(() => client.say(supportedChannel, `!bye - have bot wish you farewell`))
        .then(() =>
            client.say(
                supportedChannel,
                `!clear - clears the chat (mod or broadcaster only)`
            )
        ).catch(error => console.log(`The following error occured: ${error}`));
}

clearChatCommand = (user) => {
    if (user.mod || user.badges.broadcaster === "1") {
        client.say(supportedChannel, `/clear`);
    } else {
        client.say(
            supportedChannel,
            `I'm sorry @${user["display-name"]}, only mods may clear chat.`
        );
    }
}

correctGuess = (user, guess) => {
    client.say(
        supportedChannel,
        `Congratulations @${user["display-name"]}, "${guess.toProperCase()}" is the correct answer! $${currentQuestion.value} has been added to your bankroll.`
    );
}

incorrectGuess = (user, guess) => {
    client.say(
        supportedChannel,
        `I'm sorry @${user["display-name"]}, ${guess.toUpperCase()} is not correct.`
    );
}

client.on("connected", (address, port) => {
    getTriviaQuestion();
    client.action(supportedChannel, "here, type '!commands' to see what I can do!");
    client.say(supportedChannel, "/color GoldenRod")
        .then(() => client.say(supportedChannel, `I can use the chat feature!`))
        .catch(error => console.log(`The following error occured: ${error}`));
});

client.on("chat", (channel, user, message, self) => {
    console.log(message);
    let messageParsed = message.toLowerCase().trim();
    let answerParsed = currentQuestion.answer.toLowerCase();

    if (messageParsed == answerParsed) {
        // client.say(supportedChannel, `Congratulations ${user["display-name"]}, `);
        correctGuess(user, message);
    }

    if (!self && messageParsed[0] === "!") {
        console.log(messageParsed);
        switch (messageParsed) {
            case "!commands":
                displayCommandsList();
                break;
            case "!hello":
                client.say(supportedChannel, `Yooo @${user["display-name"]}! What you doin?`);
                break;
            case "!trivia":
                startTriviaGame();
                break;
            case "!bye":
                client.say(
                    supportedChannel,
                    `Catch you on the flipside @${user["display-name"]}!`
                );
                break;
            case "!clear":
                clearChatCommand(user);
                break;
            default:
                break;
        }
    }
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