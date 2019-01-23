# v3NodeLuisBotWithControlledText
This bot sample is for v3 Node.js SDK, where intention was to control user input before the message passed to LUIS endpoint.


This scenario is where, when tried out from a Teams' Team Channel, i.e. invoked as a Team app. What happens is like, for every text input, the message used to look like: 
1. <at>nodebotapp</at> hello
2. <at>nodebotapp</at> please help me.

Because of this sort of input string passed to LuisRecognizer, the same text used to passed to the LUIS endpoint and found like: the text itself was unexpected for the LUIS endpoint.

Hence, the solution is to find a way to control the input string, so that LUIS endpoint can be passed with stripped or expected text. Out here, I just had to strip off (following string inerpolation operation) **<at>nodebotapp</at>**, and pass the remaining text to LUIS service app. It's all managed via a function call for **bot.use**, and parse the **session.message.text** string.

## LUIS app recognizer preparation

```
// Prepare for LUIS service app
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName;
var luisModelUrl = 'https://'+luisAPIHostName+'/luis/v2.0/apps/'+luisAppId+'?subscription-key='+luisAPIKey;

// Create LUIS recognizer
var recognizer = new builder.LuisRecognizer(luisModelUrl);
bot.recognizer(recognizer);
```

## Control the input text from channel to service

```
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
```

For this sample, utilized the following npm packages:
```
    "botbuilder": "^3.15.0",
    "dotenv": "^6.2.0",
    "restify": "^7.6.0"
```	

