# PsychBot (Formerly AgnostiBot, formerly PsychBot)
Resident bot of the /improve/ discord.

## Usage
```console
$ git clone git@github.com:jincosghost/psychbot.git
$ cd psychbot
$ npm install
```

At this point you should create a discord account for the bot, and a Firebase repo (remember to copy your serviceuser.json to the bots directory).
Then create a file called settings.json in the psychbot directory, that looks like this:

```javascript
{
    "token" : "BASE64 BOT OUATH2 TOKEN HERE"
    "email" : "BASE64 BOT ACCOUNT EMAIL ADDRESS HERE",
    "password" : "BASE64 BOT ACCOUNT PASSWORD HERE",
    "username" : "BOTS DISPLAY NAME HERE",
    "game" : "BOT GAME HERE",
    "avatar" : "BASE64 AVATAR HERE",
    "welcomePM" : [
                    "WELCOME PRIVATE MESSAGE FOR NEW USER JOINS",
                    "NEW LINES AS NEW ARRAY ENTRIES"
                  ],
    "db" : "FIREBASE DB URL HERE"
}
```

Add the bot account to your server, and run:
```console
$ npm start
```

## License
GPLv3
