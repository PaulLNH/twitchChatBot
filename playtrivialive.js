const axios = require("axios");
const say = require("./app");
const url = "http://jservice.io/api/random";

// secondsPerRound: 7,
// timeRemaining: 0,
// currentQuestion: {},
// players: [],
// winners: [],
// losers: []

var Round = {
    previousQuestion: {},
    currentQuestion: {},
    question: {
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
    },
};

const Strings = {
    commands: {
        mods: {
            header: `MOD only commands:`,
            start: `!start - starts a new game.`,
            clear: `!clear - clears the chat anonymously`,
            stop: `!stop - stops the current game`,
        },
        users: {
            header: `Player commands:`,
            help: `!help - this is how you got this list...`,
            answer: `'what is '... - all answers must have this prefix in order to be recorded`,
        },
    },
    startHeader: `TRIVIA HAS BEGUN!`,
    categoryAndValue: `Category: "${Round.question.category.title}", worth $${Round.question.value}`,
    question: `${Round.question.question}`,
    correctAnswers: `The following players have earned $${Round.question.value}`,
};

displayTestQuestion = () => {
    say.inChat(
        Strings.startHeader,
        Strings.categoryAndValue,
        Strings.question
    );
};

startTriviaGame = () => {
    // displayQuestion();
    displayTestQuestion();
};

correctGuess = (user, guess) => {
    client.say(
        supportedChannel,
        `Congratulations @${user["display-name"]}, "${answerParsed(
      currentQuestion.answer
    )}" is the correct answer! $${
      currentQuestion.value
    } has been added to your bankroll.`
    );
};

testCorrectGuess = (user, guess) => {
    client.say(
        supportedChannel,
        `Congratulations @${user["display-name"]}, "${
        question.answer
    }" is the correct answer! $${
        question.value
    } has been added to your bankroll.`
    );
};

getTriviaQuestion = () => {
    axios
        .get(url)
        .then(response => {
            this.currentQuestion = response.data[0];
            console.log(response.data[0]);
            // console.log(response.data.explanation);
        })
        .catch(error => {
            console.log(error);
        });
};

messageIsAnswer = (message) => message.startsWith("what is ");

// answerParsed = (targetStr) => {
//     var index = targetStr.indexOf("\\");
//     while (index >= 0) {
//         targetStr = targetStr.replace("\\", "");
//         index = targetStr.indexOf("\\");
//     }
//     let parsedString = targetStr.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
//     return parsedString;
// };

module.exports = {
    displayTestQuestion,
    startTriviaGame,
    testCorrectGuess,
    Round,
    messageIsAnswer,
}