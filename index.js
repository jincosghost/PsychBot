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

function isMention(usr) {
    if (usr == null || typeof usr == undefined || usr == undefined) {
        return false;
    } else {
        return true;
    }
}

bot.on("message", (msg) => {
    let prefix = "!";
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    if (msg.author.discriminator === "6604") {
        let d = Math.floor(Math.random() * 100) + 1;
        if (d < 10) {
            msg.channel.sendMessage(`w-what is ISO?? :laughinggirls:`);
            return;
        }
    }

    let input = msg.cleanContent.toUpperCase(); //for case insensitive stuff
    var db = firebase.database();

    if (msg.content.startsWith(prefix + "help")){
        msg.channel.sendMessage(`\`\`\`Markdown
#PsychBot\'s Commands\n!help : displays this message.\n\n< Memes >\n!isdoe @user : checks if mentioned user is Doe.\n!whois @user : displays info on the mentioned user.\n!roll # : rolls a die with the specified number of sides.\n!gmroll # : same as roll but the result is sent to you in a DM.\n!yn (question) : will answer your question with yes or no.\n!8ball (question) : will shake a magic 8 ball for you.\n\n< Goals >\n!setgoal (goal) : will set a publically viewable goal.\n!getgoal @user : displays the mentioned user\'s goal.\n!delgoal : will delete your set goal.\n\n< Wellbeing Tracking >\n[Wellbeing scores can be obtained at Jinco\'s Github](http://jincosghost.github.io/permap).\n!setperma 1,2,3,4,5,6,7,8,9 : will store your PERMA scores in this order:\n    [1]: Positive Emotion,\n    [2]: Negative Emotion,\n    [3]: Engagement,\n    [4]: Relationships,\n    [5]: Meaning,\n    [6]: Accomplishment,\n    [7]: Health,\n    [8]: Overall Wellbeing,\n    [9]: Lonliness.\nThis command will also generate a timecode for the stored results so that you can delete them later.\n!getperma @user : displays averages for user\'s stored PERMA scores.\n!delperma (timecode) : will delete the specified set of PERMA scores.\`\`\``);
    } else if (msg.content.startsWith(prefix + "isdoe")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to check if they're Doe.`);
        } else if (usr.id === msg.author.id) {
            msg.channel.sendMessage(`I'd be concerned if you don't know who you are, ${msg.author.username}`);
        } else if (usr.discriminator === "2753") {
            msg.channel.sendMessage(`Yes, that is Doe, ${msg.author.username}`);
        } else {
            msg.channel.sendMessage(`Nope, that is not Doe, ${msg.author.username}`);
        }
    } else if (msg.content.startsWith(prefix + "whois")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to do whois.`);
        } else {
            let theMember = msg.guild.member(usr);
            let dob = theMember.joinDate;
            let timez = moment(dob).fromNow();
            if (usr.id === msg.author.id) {
                msg.channel.sendMessage(`${usr.username} (${usr.discriminator}), you joined ${timez}, on ${dob}.\nHere is your avatar: ${usr.avatarURL}`);
            } else {
                msg.channel.sendMessage(`${usr.username} (${usr.discriminator}) joined ${timez}, on ${dob}.\nHere is their avatar: ${usr.avatarURL}`);
            }
        }
    } else if (msg.content.startsWith(prefix + "roll")) {
        let cleanMsg = msg.cleanContent.replace(/!roll\s/,''); // remove !roll
            cleanMsg = cleanMsg.replace(/[^0-9]+/g, ''); // remove anything that isnt a number . or ,
        let sides = 6;
        if (Number(cleanMsg) !== 0) {
            sides = Number(cleanMsg);
        }
        let result = Math.floor(Math.random() * sides) + 1;
        msg.channel.sendMessage(`${msg.author.username} rolled a ${result}`);
    } else if (msg.content.startsWith(prefix + "gmroll")) {
        let cleanMsg = msg.cleanContent.replace(/!gmroll\s/,''); // remove !gmroll
            cleanMsg = cleanMsg.replace(/[^0-9]+/g, ''); // remove anything that isnt a number . or ,
        let sides = 6;
        if (Number(cleanMsg) !== 0) {
            sides = Number(cleanMsg);
        }
        let result = Math.floor(Math.random() * sides) + 1;
        msg.author.sendMessage(`You rolled a ${result}`);
    } else if (msg.content.startsWith(prefix + "yn")) {
        let rep;
        ~~(Math.random()*2) ? rep = "Yes" : rep = "No";
        msg.channel.sendMessage(`${rep}, ${msg.author.username}`);
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
        } else if (array.some(isNaN)) {
            msg.channel.sendMessage(`${msg.author.username}, some of the data you gave me wasn't numbers. Please enter !setperma followed by nine comma seperated numbers.`);
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
        let cleanMsg = msg.cleanContent.replace(/!setgoal\s/,'');
        if (cleanMsg == "" || cleanMsg == null || !cleanMsg) {
            msg.channel.sendMessage(`${msg.author.username}, I didn't detect any text after you told me to set your goal. Please try again.`);
        } else {
            let timestamp = moment().format('x');
            let ref = db.ref(`${msg.guild.id}/goals/`);
            let usersRef = ref.child(`${msg.author.id}`);
            usersRef.set({
                "goal" : cleanMsg,
                "timestamp" : timestamp
            }).then(function(){
                msg.channel.sendMessage(`${msg.author.username}, I've set your goals.`);
            }).catch(function(e){
                msg.channel.sendMessage(`${msg.author.username}, there was an error setting your goals: ${e}`);
            });
        }
    } else if (msg.content.startsWith(prefix + "getgoal")) {
        let usr = msg.mentions.users.first();
        if (!isMention(usr)) {
            msg.channel.sendMessage(`${msg.author.username}, you need to mention a user to get their goals.`);
        } else {
            let ref = db.ref(`${msg.guild.id}/goals/${usr.id}`);
            ref.once("value", function(data){
                let goal = data.val();
                if (data.val() !== null) {
                    if (usr.id === msg.author.id) {
                        msg.channel.sendMessage(`${msg.author.username}, your goal is: \*${goal.goal}\*, which was set ${moment(goal.timestamp, 'x').fromNow()}.`);
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
});

bot.on('warn', (w) => {
    console.log("Warning: " + w);
});

function init(){
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