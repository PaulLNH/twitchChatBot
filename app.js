// const PlayTriviaLive = require('./playtrivialive');
const utils = require("./utils");
// const triviaQuestions = require("./trivia");
const tmi = require("tmi.js");
require("dotenv").config();
// const http = require('http');
const axios = require("axios");
const supportedChannel = process.env.TWITCH_USERNAME;

// For formatting player input into proper case ex: "tHanK yOu" -> "Thank You"
String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const url = "http://jservice.io/api/random";
// var currentQuestion = {};
const testQuestion = {
  id: 10572,
  answer: "<i>Child\\'s Play</i>",
  question: "Chucky, a killer doll, made his debut in this 1988 film",
  value: 200,
  airdate: "1993-02-26T12:00:00.000Z",
  created_at: "2014-02-11T22:52:44.862Z",
  updated_at: "2014-02-11T22:52:44.862Z",
  category_id: 1232,
  game_id: null,
  invalid_count: null,
  category: {
    id: 1232,
    title: "horror films",
    created_at: "2014-02-11T22:52:44.724Z",
    updated_at: "2014-02-11T22:52:44.724Z",
    clues_count: 5
  }
};
var Round = {
  secondsPerRound: 7,
  timeRemaining: 0,
  currentQuestion: {},
  players: [],
  winners: [],
  losers: []
};
// var roundWinners = [];
// var roundLosers = [];

const tmiConfig = {
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

const client = new tmi.client(tmiConfig);
client.connect();

gameTimer = () => {
  setTimeout(() => {
    console.log(`${Round.timeRemaining} seconds left in the round`);
    Round.timeRemaining++;
    gameTimer();
  }, 1000);
};

// Working rest parameters function
sayInChat = (...msgs) => {
  msgs.forEach(msg => {
    client
      .say(supportedChannel, msg)
      .catch(error => console.log(`The following error occured: ${error}`));
  });
};

// Broken async await function...
// sayInChat = async (...msgs) => {
//   try {
//     let returnVal = await client.say(supportedChannel, msgs);
//   } catch (err) {
//     console.log(`Error: ${err}`); // TypeError: failed to fetch
//   }
// };

displayTestQuestion = () => {
  let startHeader = `TRIVIA HAS BEGUN!`;
  let categoryAndValue = `Category: "${testQuestion.category.title}", worth $${
    testQuestion.value
  }`;
  let question = `${testQuestion.question}`;
  let testString = `HOLY MOLY THIS WORKS?!`;
  sayInChat(startHeader, categoryAndValue, question);
  // client
  //     .say(supportedChannel, `TRIVIA HAS BEGUN!`)
  //     .then(() => client.say(supportedChannel, `Category: "${testQuestion.category.title}", worth $${testQuestion.value}`))
  //     .then(() => client.say(supportedChannel, `${testQuestion.question}`))
  //     .catch(error => console.log(`The following error occured: ${error}`));
};

displayQuestion = () => {
  client
    .say(supportedChannel, `TRIVIA HAS BEGUN!`)
    .then(() =>
      client.say(
        supportedChannel,
        `Category: "${Round.currentQuestion.category.title}", worth $${
          Round.currentQuestion.value
        }`
      )
    )
    .then(() =>
      client.say(supportedChannel, `${Round.currentQuestion.question}`)
    )
    .catch(error => console.log(`The following error occured: ${error}`));
};

displayTestAnswer = (user, guess) => {
  client.say(
    supportedChannel,
    `Congratulations @${user["display-name"]}, "${utils
      .answerParsed(testQuestion.answer)
      .toUpperCase()}" is the correct answer! $${
      testQuestion.value
    } has been added to your total.`
  );
};

displayAnswer = (user, guess) => {
  client.say(
    supportedChannel,
    `Congratulations @${user["display-name"]}, "${utils
      .answerParsed(currentQuestion.answer)
      .toUpperCase()}" is the correct answer! $${
      currentQuestion.value
    } has been added to your total.`
  );
};

displayTestIncorrectGuess = (user, guess) => {
  client.say(
    supportedChannel,
    `I'm sorry @${user["display-name"]}, ${guess.toUpperCase()} is not correct.`
  );
};

displayIncorrectGuess = (user, guess) => {
  client.say(
    supportedChannel,
    `I'm sorry @${user["display-name"]}, ${guess.toUpperCase()} is not correct.`
  );
};

getTriviaQuestion = () => {
  axios
    .get(url)
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
  // displayQuestion();
  displayTestQuestion();
};

startNewRound = () => {
  Round = {
    secondsPerRound: 7,
    timeRemaining: 0,
    currentQuestion: {},
    players: [],
    winners: [],
    losers: []
  };
};

displayCommandsList = () => {
  client
    .say(supportedChannel, `!hello - send salutations to yourself`)
    .then(() =>
      client.say(supportedChannel, `!trivia - start a new trivia game`)
    )
    .then(() =>
      client.say(supportedChannel, `!bye - have bot wish you farewell`)
    )
    .then(() =>
      client.say(
        supportedChannel,
        `!clear - clears the chat (mod or broadcaster only)`
      )
    )
    .catch(error => console.log(`The following error occured: ${error}`));
};

clearChatCommand = user => {
  if (user.mod || user.badges.broadcaster === "1") {
    client.say(supportedChannel, `/clear`);
  } else {
    client.say(
      supportedChannel,
      `I'm sorry @${user["display-name"]}, only mods may clear chat.`
    );
  }
};

client.on("connected", (address, port) => {
  getTriviaQuestion();
  client.action(
    supportedChannel,
    `bot is now online! type "!help" for a list of commands.`
  );
  client
    .say(supportedChannel, `/color GoldenRod`)
    .catch(error => console.log(`The following error occured: ${error}`));
});

client.on(`chat`, (channel, user, message, self) => {
  console.log(message);
  let messageParsed = message.toLowerCase().trim();
  // let testAnswerParsed = testQuestion.answer.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
  let testAnswerParsed = utils.answerParsed(testQuestion.answer);
  // let answerParsed = currentQuestion.answer.toLowerCase();

  // console.log('messageParsed: ' + messageParsed);
  // console.log('answerParsed: ' + testAnswerParsed);
  console.log(`Round Winners: ${Round.winners}`);
  console.log(`Round Losers: ${Round.losers}`);
  console.log(Round.players);

  let answerParsed = messageParsed.substr(8);
  console.log(answerParsed);

  // You left off here... this is a check to see if the player already took a turn this game.
  // ********************** IMPORTANT ********************************
  // You need to add a check for incorrect answers, players will get 3 chances, add it to the Rounds.players object
  let playerExists = utils.checkForPlayer(Round.players, user.username);
  console.log(playerExists);

  // Bot can't check it's own messages, has to start with "what is" and cannot have a key in Round.players already
  // if (!self && messageParsed.startsWith("what is ") && (Round.players.indexOf(user["display-name"]) === -1)) {
  if (
    !self &&
    messageParsed.startsWith("what is ") &&
    Round.winners.indexOf(user["display-name"]) === -1 &&
    Round.losers.indexOf(user["display-name"]) === -1
  ) {
    if (answerParsed == testAnswerParsed) {
      Round.players.push(user);
      Round.winners.push(user["display-name"]);
      console.log(`Round Winners: ${Round.winners}`);
      // displayAnswer(user, message);
      displayTestAnswer(user, answerParsed);
    } else if (answerParsed !== testAnswerParsed) {
      Round.players.push(user);
      Round.losers.push(user["display-name"]);
      console.log(`Round Losers: ${Round.losers}`);
      displayTestIncorrectGuess(user, answerParsed);
    }
  }

  if (!self && messageParsed[0] === "!") {
    console.log(messageParsed);
    switch (messageParsed) {
      case "!help":
        displayCommandsList();
        break;
      case "!power":
        client.say(
          supportedChannel,
          `@${user["display-name"]}, you don't have any powerups to use.`
        );
        break;
      case "!start":
        startTriviaGame();
        break;
      case "!clear":
        clearChatCommand(user);
        startNewRound();
        break;
      default:
        break;
    }
  }
});

// if (!self && (messageParsed[0] !== "!")) {
//     if ((messageParsed == testAnswerParsed) && (roundWinners.indexOf(user) === -1)) {
//         roundWinners.push(user);
//         console.log(`Round Winners: ${roundWinners}`);
//         // displayAnswer(user, message);
//         displayTestAnswer(user, message);
//     } else {
//         roundLosers.push(user);
//         console.log(`Round Losers: ${roundLosers}`);
//         displayTestIncorrectGuess(user, message);
//     }
// }

client.on("cheer", (channel, userstate, message) => {
  // Can't test without using the cheer emote on twitch.
  // This will be setup for users to purchase "powerups"
  // Powerups:
  //          - Select the category for the next 3 questions
  //          - Double points for everyone for this question
  //          - Freeze assets, players don't lose money if this question is incorrectly answered
  console.log(userstate);
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
