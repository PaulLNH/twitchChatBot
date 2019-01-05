const tmi = require("tmi.js");
require("dotenv").config();
const triviaQuestions = require("./trivia");

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
    channels: ["draaxx"]
};

const client = new tmi.client(options);
client.connect();

displayQuestion = () => {
    client.say(
        "draaxx",
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
            "draaxx",
            `${letter}.) ${triviaQuestions.trivia[0].incorrect_answers[i]}`
        );
    }
};

startTriviaGame = () => {
    client
        .say("draaxx", `TRIVIA HAS BEGUN!`)
        .then(() =>
            client.say("draaxx", `${triviaQuestions.trivia[0].question}`)
        )
        .then(() => displayQuestion());
}

displayCommandsList = () => {
    client
        .say("draaxx", `!hello - send salutations to yourself`)
        .then(() => client.say("draaxx", `!trivia - start a new trivia game`))
        .then(() => client.say("draaxx", `!bye - have bot wish you farewell`))
        .then(() =>
            client.say(
                "draaxx",
                `!clear - clears the chat (mod or broadcaster only)`
            )
        );
}

clearChatCommand = (user) => {
    if (user.mod || user.badges.broadcaster === "1") {
        client.say("draaxx", `/clear`);
    } else {
        client.say(
            "draaxx",
            `I'm sorry @${user["display-name"]}, only mods may clear chat.`
        );
    }
}

correctGuess = (user, guess) => {
    client.say(
        "draaxx",
        `Congratulations @${user["display-name"]}! ${guess.toUpperCase()} was the correct answer!`
    );
}

incorrectGuess = (user, guess) => {
    client.say(
        "draaxx",
        `I'm sorry @${user["display-name"]}, ${guess.toUpperCase()} is not correct.`
    );
}

client.on("connected", (address, port) => {
    client.action("draaxx", "here, type '!commands' to see what I can do!");
    client
        .say("draaxx", "/color GoldenRod")
        .catch(error => console.log(`The following error occured: ${error}`));
});

client.on("chat", (channel, user, message, self) => {
    let messageParsed = message.toLowerCase().trim();
    if (!self && messageParsed[0] === "!") {
        console.log(messageParsed);
        switch (messageParsed) {
            case "!commands":
                displayCommandsList();
                break;
            case "!hello":
                client.say("draaxx", `Yooo @${user["display-name"]}! What you doin?`);
                break;
            case "!trivia":
                startTriviaGame();
                break;
            case "!bye":
                client.say(
                    "draaxx",
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
    if (!self && messageParsed === "a" || messageParsed === "b" || messageParsed === "c" || messageParsed === "d" || messageParsed === "e") {
        switch (messageParsed) {
            case "a":
                correctGuess(user, messageParsed);
                break;
            case "b":
                incorrectGuess(user, messageParsed);
                break;
            case "c":
                incorrectGuess(user, messageParsed);
                break;
            case "d":
                incorrectGuess(user, messageParsed);
                break;
            case "e":
                incorrectGuess(user, messageParsed);
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