/**
 *  @Author Paul Laird
 *  @Date 20190110
 *  @Version 0.5
 */

const PlayTriviaLive = require("./playtrivialive");
const utils = require("./utils");
// const triviaQuestions = require("./trivia");
const tmi = require("tmi.js");
require("dotenv").config();
// const http = require('http');
// const axios = require("axios");
const supportedChannel = process.env.TWITCH_USERNAME;

// For formatting player input into proper case ex: "tHanK yOu" -> "Thank You"
String.prototype.toProperCase = function () {
    return this.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
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
    if (Round.timeRemaining >= 0) {
        setTimeout(() => {
            console.log(`${Round.timeRemaining} seconds left in the round`);
            Round.timeRemaining--;
            gameTimer();
        }, 1000);
    } else if (Round.timeRemaining <= 0) {
        Round.timeRemaining = Round.secondsPerRound;
    }
};

// Working rest parameters function
exports.inChat = (...msgs) => {
    msgs.forEach(msg => {
        client
            .say(supportedChannel, msg)
            .catch(error => console.log(`The following error occured: ${error}`));
    });
};

sayInChat = (...msgs) => {
    msgs.forEach(msg => {
        client
            .say(supportedChannel, msg)
            .catch(error => console.log(`The following error occured: ${error}`));
    });
};

client.on("connected", (address, port) => {
    client.action(
        supportedChannel,
        ` is now online! type "!help" for a list of commands.`
    );
    // Display trivia question on load for testing
    PlayTriviaLive.displayTestQuestion();
});

client.on(`chat`, (channel, user, message, self) => {

    /**
     *  @PsuedoCode
     * STEP1: Filter out messages sent from 'self'
     * STEP2: Parse the message sent from the user into lowercase with no extra white space
     * STEP3: Check to see if the message is a command "!" 
     *              OR 
     *          Check if the message is an answer to a trivia question with the prefix "what is "
     * STEP4: If the message is a command, have bot run associated command
     * STEP5: If the message is an answer, run check to see if the answer can be accepted.
     *        An answer can be accepted if:
     *          The user is not in any array
     *              OR
     *          The user is not in the 'winners' array
     *              OR  
     *          The user is in the 'players' array and has 'guessesRemaining' > 0
     * STEP6: Check the parsed answer message against the parsed answer key
     *          If the answer is correct, give the user credit for correct answer and push to players
     *          array and the winners answers array.
     * STEP7: If the answer is incorrect, push user to the losers array and subtract a remaining guess from players array
     */

    console.log(message);
    let messageParsed = message.toLowerCase().trim();
    let correctAnswerParsed = utils.answerParsed(
        PlayTriviaLive.Round.question.answer
    );

    

    if (!self) {
        // function = messageParsed.startsWith("what is ") - returns boolean
        if (PlayTriviaLive.messageIsAnswer(messageParsed)) {
            // 
        }
    };

    console.log(`Round Winners: ${Round.winners}`);
    console.log(`Round Losers: ${Round.losers}`);
    console.log(Round.players);

    let playerGuessParsed = messageParsed.substr(8);
    console.log(playerGuessParsed);

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
        if (playerGuessParsed == correctAnswerParsed) {
            Round.players.push(user);
            Round.winners.push(user["display-name"]);
            console.log(`Round Winners: ${Round.winners}`);
            // displayAnswer(user, message);
            // displayTestAnswer(user, answerParsed);
        } else if (playerGuessParsed !== correctAnswerParsed) {
            Round.players.push(user);
            console.log(`Round Players User: ${Round.players.user}`);
            Round.losers.push(user["display-name"]);
            console.log(`Round Losers: ${Round.losers}`);
            // displayTestIncorrectGuess(user, answerParsed);
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
                PlayTriviaLive.startTriviaGame();
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


client.on("cheer", (channel, userstate, message) => {
    // Can't test without using the cheer emote on twitch.
    // This will be setup for users to purchase "powerups"
    // Powerups:
    //          - Select the category for the next 3 questions
    //          - Double points for everyone for this question
    //          - Freeze assets, players don't lose money if this question is incorrectly answered
    console.log(userstate);
});

/** 
 * PARAMS RETURNED FROM CLIENT FUNCTION
 * channel, user, message, self
 * 
 * @channel - returns the channel as a string that chat was discovered in
 * 
 * @user 
 *  user: { 
 *      badges: { 
 *          broadcaster: '1', 
 *          premium: '1' 
 *      },
 *      color: '#0000FF',
 *      'display-name': 'PlayTriviaLive',
 *      emotes: null,
 *      flags: null,
 *      id: 'fd5f3f3f-d903-4679-9b21-827c6d58b306',
 *      mod: false,
 *      'room-id': '23577841',
 *      subscriber: false,
 *      'tmi-sent-ts': '1546574810929',
 *      turbo: false,
 *      'user-id': '23577841',
 *      'user-type': null,
 *      'emotes-raw': null,
 *      'badges-raw': 'broadcaster/1,premium/1',
 *      username: 'playtirvialive',
 *      'message-type': 'chat' 
 *  };
 * 
 * @message - String exactly as user typed in chat
 * 
 * @self returns a boolen if the message was returned by the bot or not
 * 
 */
