var restify = require('restify');
var builder = require('botbuilder');
require('dotenv').config();

// Setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, 
    function(){
        console.log('%s listening to %s', server.name, server.url);
    });

// Default store: volatile in-memory store - Only for prototyping!
var inMemoryStorage = new builder.MemoryBotStorage();

// Chat connector for communicating with Bot Framework service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Prepare UnversalBot for teams related activities
var bot = new builder.UniversalBot(connector)
            .set('storage', inMemoryStorage);

// Prepare for LUIS service app
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName;
var luisModelUrl = 'https://'+luisAPIHostName+'/luis/v2.0/apps/'+luisAppId+'?subscription-key='+luisAPIKey;

// Create LUIS recognizer
var recognizer = new builder.LuisRecognizer(luisModelUrl);
bot.recognizer(recognizer);

// Control input text
bot.use({
    botbuilder: function(session, next){
        var oldText = session.message.text;
        // string replace logic (still can be improved if need be)
        // can read the value from .env file, or hard code the text directly here
        session.message.text = oldText.replace(process.env.TextToSearch, '').trim();
        next();        
    }
});

// Set the dialog
// ****** dialog with '/' would act as entry point to the message convesation ******
bot.dialog('/', [
    function(session){
        session.send("you said - %s", session.message.text);            
    }
]);

// Set the dialog for various matching LUIS intents
bot.dialog('GreetingDialog', (session) => {
    session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
    session.endDialog();
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
});

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
});

