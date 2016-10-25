"use strict";
const atob = require("atob");
const Discord = require("discord.js");
const firebase = require("firebase");
const moment = require("moment");
const settings = require("./settings.json");

//create bot
const bot = new Discord.Client({fetch_all_members: true, ws: {compress: true}});

// cache some settings
const botUsername = settings.username;
const botAvatar = settings.avatar;
const botGame = settings.game;
const welcomePM = settings.welcomePM.join("\n");

let uptime;

function isMention(usr) {
    if (usr == null || typeof usr == undefined || usr == undefined) {
        return false;
    } else {
        return true;
    }
}

function dueDates() {
    let db = firebase.database();
    bot.guilds.forEach(function(guild){
        let ref = db.ref(`${guild.id}/goals/`);
            guild.members.map(u => {
                let usr = u.user.id;
                let usrRef = ref.child(usr);
                usrRef.on("value", function(data){
                    if (data.val() !== null) {
                        let dd = data.val().duedate;
                        let now = moment();
                        if (moment(dd).isSameOrBefore(now)) {
                            u.sendMessage(`${u.user.username}, ${data.val().goal} is due.`);
                        }
                    }
                });
        });
    });
}

bot.on("message", (msg) => {
    let prefix = "!";
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    if (msg.author.discriminator === "6604") {
        let d = Math.floor(Math.random() * 100) + 1;
        if (d < 2) {
            msg.channel.sendMessage(`w-what is ISO?? \:laughinggirls\:`);
            return;
        }
    }

    let input = msg.content.toUpperCase(); //for case insensitive stuff
    let db = firebase.database();

    if (msg.content.startsWith(prefix + "help")){
        msg.channel.sendMessage(`\`\`\`Markdown
#PsychBot\'s Commands\n!help : displays this message.\n!uptime : displays my uptime.\n\n< Memes >\n!isdoe @user : checks if mentioned user is Doe.\n!whois @user : displays info on the mentioned user.\n!roll dice,sides,modifier : rolls dice.\n!gmroll # : same as roll but the result is sent to you in a DM.\n!yn (question) : will answer your question with yes or no.\n!8ball (question) : will shake a magic 8 ball for you.\n!coin : will flip a coin.\n\n< Goals >\n!setgoal (goal),(duedate as dd/mm/yy) : will set a publically viewable goal and will DM you on the duedate.\n!getgoal @user : displays the mentioned user\'s goal.\n!delgoal : will delete your set goal.\n\n< Wellbeing Tracking >\n[Wellbeing scores can be obtained at Jinco\'s Github](http://jincosghost.github.io/permap).\n!setperma 1,2,3,4,5,6,7,8,9 : will store your PERMA scores in this order:\n    [1]: Positive Emotion,\n    [2]: Negative Emotion,\n    [3]: Engagement,\n    [4]: Relationships,\n    [5]: Meaning,\n    [6]: Accomplishment,\n    [7]: Health,\n    [8]: Overall Wellbeing,\n    [9]: Lonliness.\nThis command will also generate a timecode for the stored results so that you can delete them later.\n!getperma @user : displays averages for user\'s stored PERMA scores.\n!delperma (timecode) : will delete the specified set of PERMA scores.\`\`\``);
    } else if (msg.content.startsWith(prefix + "uptime")) {
        msg.channel.sendMessage(`${msg.author.username}, I have been online for ${moment(uptime).fromNow(true)}.`);
    } else if (msg.content.startsWith(prefix + "isdoe")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to check if they're Doe.`);
            return;
        } else if (usr.id === msg.author.id) {
            msg.channel.sendMessage(`I'd be concerned if you don't know who you are, ${msg.author.username}`);
        } else if (usr.discriminator === "2753" || usr.discriminator === "6604") {
            msg.channel.sendMessage(`Yes, that is Doe, ${msg.author.username}`);
        } else {
            msg.channel.sendMessage(`Nope, that is not Doe, ${msg.author.username}`);
        }
    } else if (msg.content.startsWith(prefix + "whois")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to do whois.`);
            return;
        } else {
            let theMember = msg.guild.member(usr);
            let dob = theMember.joinDate;
            let timez = moment(dob).fromNow();
            if (usr.id === msg.author.id) {
                msg.channel.sendMessage(`${usr.username} (${usr.discriminator}), you joined ${timez}, on ${moment(dob).format("dddd, MMMM Do YYYY, h:mm:ss a (UTC Z)")}. Here is your avatar: ${usr.avatarURL}`);
            } else {
                msg.channel.sendMessage(`${usr.username} (${usr.discriminator}) joined ${timez}, on ${moment(dob).format("dddd, MMMM Do YYYY, h:mm:ss a (UTC Z)")}. Here is their avatar: ${usr.avatarURL}`);
            }
        }
    } else if (msg.content.startsWith(prefix + "roll") || msg.content.startsWith(prefix + "gmroll") ) {
        let cleanMsg = msg.cleanContent.replace(/!roll\s/,''); // remove !roll
            cleanMsg = cleanMsg.replace(/[^0-9,]+/g, ''); // remove anything that isnt a number or ,
        let args = cleanMsg.split(",");
        args = args.filter(Number);
        // default to one six-sided die with no modifier
        let dice = 1, sides = 6, modifier = 0;
        if (args.length !== 0) {
            if (args.length > 3) {
                msg.channel.sendMessage(`I detected too many numbers to roll, ${msg.author.username}. The command is !roll dice,sides,modifier, for example: !roll 2,6,5.`);
                return;
            } else if (args.length === 3){
                dice = Number(args[0]);
                sides = Number(args[1]);
                modifier = Number(args[2]);
                if (dice > 10) {
                    msg.channel.sendMessage(`Too many dice, ${msg.author.username}. Maximum is 10.`);
                    return;
                }
            } else if (args.length === 2) {
                dice = Number(args[0]);
                sides = Number(args[1]);
                if (dice > 10) {
                    msg.channel.sendMessage(`Too many dice, ${msg.author.username}. Maximum is 10.`);
                    return;
                }
            } else if (args.length === 1) {
                sides = Number(args[0]);
            }
        }
        let rolls = [];
        let str = "";
        for (let i = 0; i < dice; i++) {
            let roll = Math.floor(Math.random() * sides) + 1;
            rolls[i] = roll;
            str += "(" + roll + ") ";
        }
        var sum = rolls.reduce((a, b) => a + b, 0);
        if (msg.content.startsWith(prefix + "roll")) {
            msg.channel.sendMessage(`\`${str}+ ${modifier}\`\n${msg.author.username} rolled \*\*${sum+modifier}\*\*.`);
        } else {
            msg.author.sendMessage(`\`${str}+ ${modifier}\`\nYou rolled \*\*${sum+modifier}\*\*.`);
        }
    } else if (msg.content.startsWith(prefix + "yn") || msg.content.startsWith(prefix + "coin")) {
        let result;
        if (msg.content.startsWith(prefix + "yn")) {
            ~~(Math.random()*2) ? result = "Yes" : result = "No";
        } else {
            ~~(Math.random()*2) ? result = "Heads" : result = "Tails";
        }
        msg.channel.sendMessage(`${result}, ${msg.author.username}`);
    } else if (msg.content.startsWith(prefix + "8ball")) {
        let answers = [
            'Maybe', 'Certainly not', 'I hope so', 'Not in your wildest dreams',
            'There is a good chance', 'Quite likely', 'I think so', 'I hope not',
            'I hope so', 'Never', 'Fuhgeddaboudit', 'Ahaha! Really', 'Pfft',
            'Sorry', 'Hell yes', 'Hell to the no', 'The future is bleak',
            'The future is uncertain', 'I would rather not say', 'Who cares',
            'Possibly', 'Never, ever, ever', 'There is a small chance', 'Yes'
        ];
        let answer = answers[Math.floor(Math.random() * answers.length)];
        msg.channel.sendMessage(`${answer}, ${msg.author.username}`);
    } else if (msg.content.startsWith(prefix + "setperma")) {
        let cleanMsg = msg.cleanContent.replace(/!setperma\s/,''); // remove !setperma
            cleanMsg = cleanMsg.replace(/[^0-9.,]+/g, ''); // remove anything that isnt a number . or ,
        let array = cleanMsg.split(',');
            array = array.filter(Number);
        if (array.length < 9 || array.length > 9) {
            msg.channel.sendMessage(`${msg.author.username}, I expected nine numbers in order to save your wellbeing scores. You gave me ${array.length}. Please try again.`);
            return;
        } else if (array.some(isNaN)) {
            msg.channel.sendMessage(`${msg.author.username}, some of the data you gave me wasn't numbers. Please enter !setperma followed by nine comma seperated numbers.`);
            return;
        } else {
            let timez = moment().format('x');
            let ref = db.ref(`${msg.guild.id}/perma/${msg.author.id}`);
            let usersRef = ref.child(`${timez}`);
            usersRef.set({
                "PE" : array[0],
                "NE" : array[1],
                "NG" : array[2],
                "RE" : array[3],
                "ME" : array[4],
                "AC" : array[5],
                "HE" : array[6],
                "OW" : array[7],
                "LO" : array[8]
            }).then(function(){
                msg.channel.sendMessage(`${msg.author.username}, I've recorded your PERMA scores. To delete this set use !delperma ${timez}.`);
            }).catch(function(e){
                msg.channel.sendMessage(`${msg.author.username}, there was an error: ${e}`);
            });
        }
    } else if (msg.content.startsWith(prefix + "getperma")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to get their PERMA scores.`);
            return;
        } else {
            let ref = db.ref(`${msg.guild.id}/perma/${usr.id}`);
            ref.once("value", function(data){
                let scores = data.val();
                let entries = Object.keys(scores).length;
                let arrPE = [], arrNE = [], arrNG = [], arrRE = [], arrME = [], arrAC = [], arrHE = [], arrOW = [], arrLO = [];
                Object.keys(scores).forEach(function(score) {
                    arrPE.push(scores[score].PE);
                    arrNE.push(scores[score].NE);
                    arrNG.push(scores[score].NG);
                    arrRE.push(scores[score].RE);
                    arrME.push(scores[score].ME);
                    arrAC.push(scores[score].AC);
                    arrHE.push(scores[score].HE);
                    arrOW.push(scores[score].OW);
                    arrLO.push(scores[score].LO);
                });
                var calc = function(arr){
                    var sum = 0;
                    for( var i = 0; i < arr.length; i++ ){
                        sum += parseInt( arr[i], 10 );
                    }
                    var avg = sum/arr.length;
                        return avg;
                }
                msg.channel.sendMessage(`\`\`\`Markdown
#${usr.username}\'s PERMA Scores\nBased on ${entries} sets of PERMA scores, here are ${usr.username}\'s averages:\n\n Positive Emotion: ${calc(arrPE)}\n Negative Emotion: ${calc(arrNE)}\n       Engagement: ${calc(arrNG)}\n    Relationships: ${calc(arrRE)}\n          Meaning: ${calc(arrME)}\n   Accomplishment: ${calc(arrAC)}\n           Health: ${calc(arrHE)}\n        Lonliness: ${calc(arrLO)}\nOverall Wellbeing: ${calc(arrOW)}\`\`\``);
            }).catch(function(e){
                msg.channel.sendMessage(`${msg.author.username}, there was an error ${e}`);
            });
        }
    } else if (msg.content.startsWith(prefix + "delperma")) {
        let cleanMsg = msg.cleanContent.replace(/!delperma\s/,'');
        let trimmed = cleanMsg.trim();
        if (trimmed == "" || trimmed == null || !trimmed || trimmed.length === 0) {
            msg.channel.sendMessage(`${msg.author.username}, you need to specify a timecode with that command.`);
            return;
        } else {
            let ref = db.ref(`${msg.guild.id}/perma/${msg.author.id}/`);
            let usersRef = ref.child(`${cleanMsg}`);
            usersRef.once("value", function(data){
                if (data.val() == null) {
                    msg.channel.sendMessage(`${msg.author.username}, there was no set of PERMA scores with that timecode.`);
                } else {
                    usersRef.remove().then(function(){
                        msg.channel.sendMessage(`${msg.author.username}, I deleted that set of PERMA scores.`);
                    }).catch(function(e){
                        msg.channel.sendMessage(`${msg.author.username}, there was an error deleteing that set of PERMA scores: ${e}`);
                    });
                }
            }).catch(function(e){
                msg.channel.sendMessage(`${msg.author.username}, there was an error: ${e}`);
            });
        }
    } else if (msg.content.startsWith(prefix + "setgoal")) {
        let cleanMsg = msg.cleanContent.replace(/(^!setgoal)\s/i,'');
        let args = cleanMsg.split(" ").slice(1);
            args = cleanMsg.split(",");
        if (cleanMsg == "" || cleanMsg == null || !cleanMsg || cleanMsg == "!setgoal" || cleanMsg == "!setgoal ") {
            msg.channel.sendMessage(`${msg.author.username}, I didn't detect any text after you told me to set your goal. Please try again.`);
            return;
        } else if (args.length !== 2) {
            msg.channel.sendMessage(`${msg.author.username}, there was an incorrect number of arguments to set your goals. The correct way is !setgoal (goal),(duedate dd/mm/yy). Please try again.`);
            return;
        } else {
            if (moment(args[1], 'DD/MM/YY').isValid()) {
                let due = moment(args[1], 'DD/MM/YY').format('x');
                let timestamp = moment().format('x');
                let ref = db.ref(`${msg.guild.id}/goals/`);
                let usersRef = ref.child(`${msg.author.id}`);
                usersRef.set({
                    "goal" : args[0],
                    "timestamp" : timestamp,
                    "duedate" : due
                }).then(function(){
                    msg.channel.sendMessage(`${msg.author.username}, I've set your goals.`);
                }).catch(function(e){
                    msg.channel.sendMessage(`${msg.author.username}, there was an error setting your goals: ${e}`);
                });
            } else {
                msg.channel.sendMessage(`${msg.author.username}, there was an error with the date you added, the correct format is DD/MM/YY. Please try again.`);
            }
        }
    } else if (msg.content.startsWith(prefix + "getgoal")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to get their goals.`);
            return;
        } else {
            let ref = db.ref(`${msg.guild.id}/goals/${usr.id}`);
            ref.once("value", function(data){
                let goal = data.val();
                if (data.val() !== null) {
                    if (usr.id === msg.author.id) {
                        msg.channel.sendMessage(`${msg.author.username}, your goal is: \*${goal.goal}\*, which was set ${moment(goal.timestamp, 'x').fromNow()}, and is due ${moment(goal.duedate, 'x').format('DD/MM/YY')}.`);
                    } else {
                        msg.channel.sendMessage(`${msg.author.username}, ${usr.username}'s goal is: \*\*${goal.goal}\*\*, which was set ${moment(goal.timestamp, 'x').fromNow()}.`);
                    }
                } else {
                    if (usr.id === msg.author.id) {
                        msg.channel.sendMessage(`${msg.author.username}, you haven't set a goal yet.`);
                    } else {
                        msg.channel.sendMessage(`${msg.author.username}, ${usr.username} hasn't set a goal yet.`);
                    }
                }
            }).catch(function(e){
                msg.channel.sendMessage(`${msg.author.username}, there was an error: ${e}`);
            });
        }
    } else if (msg.content.startsWith(prefix + "delgoal")) {
        let ref = db.ref(`${msg.guild.id}/goals/`);
        let usersRef = ref.child(`${msg.author.id}`);
        usersRef.once("value", function(data){
            if (data.val() == null) {
                msg.channel.sendMessage(`${msg.author.username}, there were no goals to delete.`);
            } else {
                ref.remove().then(function(){
                    msg.channel.sendMessage(`${msg.author.username}, I deleted your goals.`);
                }).catch(function(e){
                    msg.channel.sendMessage(`${msg.author.username}, there was an error: ${e}`);
                });
            }
        }).catch(function(e){
            msg.channel.sendMessage(`${msg.author.username}, there was an error: ${e}`);
        });
    } else {
        return;
    }
});

bot.on('guildMemberAdd', (guild, member) => {
    let userTag = null;
    if (typeof member.nickname == "undefined" || member.nickname == "undefined" || member.nickname == null) {
        userTag = member.user.username;
    } else {
        userTag = member.nickname;
    }
    //console.log(`New User ${userTag} has joined ${guild.name}`);
    guild.defaultChannel.sendMessage(`${userTag} has joined the server`);
    member.sendMessage(welcomePM);
});

bot.on("guildMemberRemove", (guild, member) => {
    let userTag = null;
    if (typeof member.nickname == "undefined" || member.nickname == "undefined" || member.nickname == null) {
        userTag = member.user.username;
    } else {
        userTag = member.nickname;
    }
    //console.log(`User ${userTag} has left ${guild.name}`);
    guild.defaultChannel.sendMessage(`${userTag} has left the server`);
});

bot.on('guildDelete', (guild) => {
    console.log(`Left "${guild.name}"` );
});

bot.on("ready", () => {
    console.log(`Ready to serve in ${bot.channels.size} channel(s) on ${bot.guilds.size} server(s), for a total of ${bot.users.size} user(s):`);

    bot.guilds.forEach(function(guild){
        console.log(`>${guild.name} (${guild.id}) ${guild.memberCount} user(s):`);
        guild.channels.forEach(function(channel){
            console.log(`  >>${channel.name} (${channel.id}) ${channel.type}`);
        });
    });

    bot.user.setUsername(botUsername)
        .then((user) => console.log(`>>My username is ${user.username}`))
        .catch(console.log);
    bot.user.setAvatar(botAvatar)
        .then((user) => console.log(">>My avatar has been set"))
        .catch(console.log);
    bot.user.setStatus("online", botGame)
        .then((user) => console.log(">>Status updated"))
        .catch(console.log);

    dueDates();
});

bot.on('warn', (w) => {
    console.log("Warning: " + w);
});

function init(){
    uptime = moment();
    firebase.initializeApp({
        serviceAccount: "firebase.json",
        databaseURL: settings.db
    });

    bot.login(atob(settings.token));
}

init();


// REJECTVILLE
//let guildRole = null;
/*else if (msg.content.startsWith(prefix + "unrelated")){
    guildRole = msg.guild.roles.find("name", "unrelated");
    if (guildRole){
        msg.member.addRole(guildRole).then(function(){
            msg.channel.sendMessage(`I added you to the unrelated role, ${msg.author.username}`);
        }).catch(function(error){
            console.log(error);
        });
    } else {
        msg.channel.sendMessage("Unrelated role not found!");
    }
} else if (msg.content.startsWith(prefix + "antiunrelated")) {
    guildRole = msg.guild.roles.find("name", "unrelated");
    if (guildRole){
        msg.member.removeRole(guildRole);
        msg.channel.sendMessage(`I removed you from the unrelated role, ${msg.author.username}`);
    } else {
        msg.channel.sendMessage("Unrelated role not found!");
    }
} */