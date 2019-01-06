const tmi = require("tmi.js");
require("dotenv").config();
const http = require('http');
const triviaQuestions = require("./trivia");
const supportedChannel = process.env.TWITCH_USERNAME;
const url = 'http://jservice.io/api/random';
var currentQuestion = {};

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
    channels: ["supportedChannel"]
};

const client = new tmi.client(options);
client.connect();

displayQuestion = () => {
    client.say(
        supportedChannel,
        `A.) ${triviaQuestions.trivia[0].correct_answer}`
    );
    for (let i = 0; i < triviaQuestions.trivia[0].incorrect_answers.length; i++) {
        let letter;
        console.log(triviaQuestions.trivia[0].incorrect_answers[i]);
        switch (i) {
            case 0:
                letter = "B";
                break;
            case 1:
                letter = "C";
                break;
            case 2:
                letter = "D";
                break;
            case 3:
                letter = "E";
                break;
            case 4:
                letter = "F";
                break;
        }
        client.say(
            supportedChannel,
            `${letter}.) ${triviaQuestions.trivia[0].incorrect_answers[i]}`
        );
    }
};

getTriviaQuestion = () => {
    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            currentQuestion = JSON.parse(body);
            console.log(currentQuestion);
        });
    }).on('error', function (err) {
        console.log("Got an error: ", err);
    });
};

startTriviaGame = () => {
    client
        .say(supportedChannel, `TRIVIA HAS BEGUN!`)
        .then(() =>
            client.say(supportedChannel, `${triviaQuestions.trivia[0].question}`)
        )
        .then(() => displayQuestion());
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
        );
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
        `Congratulations @${user["display-name"]}! ${guess.toUpperCase()} was the correct answer!`
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
    client
        .say(supportedChannel, "/color GoldenRod")
        .catch(error => console.log(`The following error occured: ${error}`));
});

client.on("chat", (channel, user, message, self) => {
    let messageParsed = message.toLowerCase().trim();

    if (messageParsed == currentQuestion.answer.toLowerCase()) {
        client.say(supportedChannel, `Congratulations ${user["display-name"]}`)
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