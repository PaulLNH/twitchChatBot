module.exports = {
    answerParsed: (targetStr) => {
        var index = targetStr.indexOf("\\");
        while (index >= 0) {
            targetStr = targetStr.replace("\\", "");
            index = targetStr.indexOf("\\");
        }
        let parsedString = targetStr.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
        return parsedString;
    },
    checkForPlayerOLD: (obj, username) => obj.username === username,
    checkForPlayer: function (obj, username) {
        return obj.some(function (el) {
            return el.username === username;
        });
    },
}