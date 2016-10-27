# PsychBot
Self-improvement focused Discord Bot.

![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)

## Features
* Written completely in ES6
* Efficient functions
* Clean code, adhering to [Standard](https://github.com/feross/standard) styling
* Firebase integration for secure database handling

## Commands
### General
| Command        | Output                                     |
| -------------- |------------------------------------------- |
| !help          | replies with help text                     |
| !uptime        | replies with bot uptime                    |
| !whois @user   | replies with mentioned user info           |
| !roll 1,20,5   | roll a dice - die,sides,modifier           |
| !gmroll 2,10,0 | roll a dice privately - die,sides,modifier |
| !yn            | replies with yes or no                     |
| !coin          | replies with a coin flip                   |
| !8ball         | replies with magic 8ball answers           |

### Goal settings
| Command                | Output                                                          |
| -----------------------| --------------------------------------------------------------- |
| !setgoal goal,DD/MM/YY | sets a publically viewable goal.                                |
| !getgoal @user         | replies with users goal and due date                            |
| !delgoal               | deletes your goal                                               |

### Wellbeing Tracking
| Command                     | Output                                                          |
| --------------------------- | --------------------------------------------------------------- |
| !setperma 1,2,3,4,5,6,7,8,9 | store a set of [PERMA-P](https://jincosghost.github.io/permap) results. Where number = [1]: Positive Emotion, [2]: Negative Emotion, [3]: Engagement, [4]: Relationships, [5]: Meaning, [6]: Accomplishment, [7]: Health, [8]: Overall Wellbeing, [9]: Lonliness. Once stored you will also get a timecode so you can delete the data later on. |
| !getperma @user             | replies with users PERMA analysis                               |
| !delperma timecode          | deletes the specified PERMA set                                 |

## Usage
Requires Node 6.0+

```console
$ git clone git@github.com:jincosghost/psychbot.git
$ cd psychbot
$ npm install
```

At this point you should create a discord account for the bot, and a Firebase repo (remember to copy your serviceuser.json to the bots directory).
Then create a file called settings.json in the psychbot directory, that looks like this:

```javascript
{
    "avatar"    : "BASE64 AVATAR HERE",
    "db"        : "FIREBASE DB URL HERE"
    "email"     : "BASE64 BOT ACCOUNT EMAIL ADDRESS HERE",
    "game"      : "BOT GAME HERE",
    "password"  : "BASE64 BOT ACCOUNT PASSWORD HERE",
    "token"     : "BASE64 BOT OUATH2 TOKEN HERE",
    "username"  : "BOTS DISPLAY NAME HERE",
    "welcomePM" : [
                    "WELCOME PM FOR NEW USER JOINS",
                    "NEW LINES AS NEW ARRAY ENTRIES"
                  ]
}
```

Add the bot account to your server, and run:
```console
$ npm start
```

To stop PsychBot:
```console
$ npm stop
```

## License
MIT
