const axios = require('axios');
const url = 'http://jservice.io/api/random';

module.exports = {
        previousQuestion: {},
        currentQuestion: {},
        testQuestion: {
            id: 10572,
            answer: '<i>Child\\\'s Play</i>',
            question: 'Chucky, a killer doll, made his debut in this 1988 film',
            value: 200,
            airdate: '1993-02-26T12:00:00.000Z',
            created_at: '2014-02-11T22:52:44.862Z',
            updated_at: '2014-02-11T22:52:44.862Z',
            category_id: 1232,
            game_id: null,
            invalid_count: null,
            category: {
                id: 1232,
                title: 'horror films',
                created_at: '2014-02-11T22:52:44.724Z',
                updated_at: '2014-02-11T22:52:44.724Z',
                clues_count: 5
            }
        },
        displayTestQuestion: function () {
            client
                .say(supportedChannel, `TRIVIA HAS BEGUN!`)
                .then(() => client.say(supportedChannel, `Category: "${testQuestion.category.title}", worth $${testQuestion.value}`))
                .then(() => client.say(supportedChannel, `${testQuestion.question}`))
                .catch(error => console.log(`The following error occured: ${error}`));
        },
        startTriviaGame: function () {
            // displayQuestion();
            displayTestQuestion();
        },
        correctGuess: function (user, guess) {
            client.say(
                supportedChannel,
                `Congratulations @${user["display-name"]}, "${answerParsed(currentQuestion.answer)}" is the correct answer! $${currentQuestion.value} has been added to your bankroll.`
            );
        },
        testCorrectGuess: function (user, guess) {
            client.say(
                supportedChannel,
                `Congratulations @${user["display-name"]}, "${PlayTriviaLive.testQuestion.answer}" is the correct answer! $${PlayTriviaLive.testQuestion.value} has been added to your bankroll.`
            );
        },
        getTriviaQuestion: function () {
            axios.get(url)
                .then(response => {
                    PlayTriviaLive.currentQuestion = response.data[0];
                    console.log(response.data[0]);
                    // console.log(response.data.explanation);
                })
                .catch(error => {
                    console.log(error);
                });
        },
        answerParsed: function (targetStr) {
            var index = targetStr.indexOf("\\");
            while(index >= 0){
                targetStr = targetStr.replace("\\","");
                index = targetStr.indexOf("\\");
            }
            let parsedString = targetStr.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
            return parsedString;
        }
}