const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const http = require('http');
const config = require('./.vscode/settings.json');
const client = new Discord.Client();

let connection;
let song;
let dispatcher;
let stringToKillCurrentStream;

const songs = [
    { name: 'PumpItUp', url: 'https://www.youtube.com/watch?v=0HtyF0jux2Q' },
    { name: 'RamRanch', url: 'https://www.youtube.com/watch?v=qEoxJ0QZkZ4' }
];

let token = process.env.TOKEN;

if (!token) {
    token = config.TOKEN;
}

function CreateListener() {
    const server = http.createServer((request, response) => {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello World!");
    });

    const port = process.env.PORT || 1337;
    server.listen(port);
}

function PlayStream(songURL) {
    song = ytdl(songURL, { filter: 'audioonly', quality: 'lowestaudio' });

    dispatcher = connection.play(song);

    dispatcher.on('start', () => {
        console.log('audio is playing!');
    });

    dispatcher.on('finish', () => {
        connection.disconnect();
        song.destroy();
        dispatcher.destroy();
        console.log('audio finished playing!');
    });

    dispatcher.on('error', console.error);
}

function DestroyCurrentStream() {
    if (dispatcher) {
        dispatcher.destroy();
        console.log('Stream ended...s');
        if (connection) {
            connection.disconnect();
        }
    }
}

CreateListener();

client.login(token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    try {
        if (msg.author.username.toLowerCase() === 'pumpitupbot') { return; }

        const messageContentLower = msg.content.toLowerCase();

        if (messageContentLower === stringToKillCurrentStream) {
            DestroyCurrentStream();
        } else if (messageContentLower === 'pumpitup' && msg.member.voice.channel) {
            DestroyCurrentStream();
            stringToKillCurrentStream = 'pumpitdown';
            msg.reply('ITS TIME TO PUMP IT UP BITCHES!')
            connection = await msg.member.voice.channel.join();

            // play pumpt it up...
            PlayStream(songs.find(x => x.name.toLowerCase() === 'pumpitup').url);
        } else if (messageContentLower === '🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠🤠' && msg.member.voice.channel) {
            DestroyCurrentStream();
            stringToKillCurrentStream = 'yeehaw';
            msg.reply('WELCOME TO THE RANCH PARTNER!!!')
            connection = await msg.member.voice.channel.join();

            // play ram ranch...
            PlayStream(songs.find(x => x.name.toLowerCase() === 'ramranch').url);
        }
    } catch (error) {
        console.log(error);
    }

});
