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

function displayQuestion() {
  let question = ``;
  question += `${triviaQuestions.trivia[0].question} ${
    triviaQuestions.trivia[0].correct_answer
  }`;
  for (let i = 0; i < triviaQuestions.trivia[0].incorrect_answers.length; i++) {
    console.log(triviaQuestions.trivia[0].incorrect_answers[i]);
    question += `${triviaQuestions.trivia[0].incorrect_answers[i]}`;
  }
  return question;
}

client.on("connected", (address, port) => {
  client.action(
    "draaxx",
    "here, type \'!commands\' to see what I can do!"
  );
  client
    .say("draaxx", "/color GoldenRod")
    .then(() => client.say("draaxx", displayQuestion()))
    .catch(error => console.log(`The following error occured: ${error}`));
});

client.on("chat", (channel, user, message, self) => {
  let messageParsed = message.toLowerCase().trim();
  if (!self && messageParsed[0] === "!") {
    console.log(messageParsed);
    switch (messageParsed) {
        case "!commands":
        client.say("draaxx", `!hello - send salutations to yourself`)
            .then(() => client.say("draaxx", `!trivia - start a new trivia game`))
            .then(() => client.say("draaxx", `!bye - have bot wish you farewell`));
        break;
      case "!hello":
        client.say("draaxx", `Yooo @${user["display-name"]}! What you doin?`);
        break;
      case "!trivia":
        client.say("draaxx", `Trivia game coming soon!`);
        break;
        case "!bye":
        client.say("draaxx", `Catch you on the flipside @${user["display-name"]}!`);
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
