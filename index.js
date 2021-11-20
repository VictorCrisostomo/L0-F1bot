const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('./config.json');

// import 'dotenv/config'
// import discord from "discord.js"
// import ytdl from "ytdl-core"

const client = new Discord.Client();

let broadcast = null;
let interval = null;

if (!config.TOKEN) {
    console.log("token invalido parcero!");
    process.exit(1);
} else if (!config.CHANNEL_ID || Number(config.CHANNEL_ID) == NaN) {
    console.log("id errado amigão!");
    process.exit(1);
} else if (!ytdl.validateURL(config.URL)) {
    console.log("link errado papai!");
    process.exit(1);
}

client.on("ready", () =>{
    console.log('O pai ta on!');
});

client.on('ready', async () => {
    client.user.setActivity('Coding with Lo-Fi');
    let channel = client.channels.cache.get(config.CHANNEL_ID) || await client.channels.fetch(config.CHANNEL_ID)

    if (!channel) {
        console.error('canal não existe o jão');
        return process.exit(1);
    } else if (channel.type !== "voice") {
        console.error('id não é um canal de voz cabeção!');
        return process.exit(1);
    }

    broadcast = client.voice.createBroadcast();
    let stream = ytdl(config.URL);
    stream.on('error', console.error);
    broadcast.play(stream);
    if (!interval) {
        interval = setInterval(async function () {
            try {
                if (stream && !stream.ended) stream.destroy();
                stream = ytdl(config.URL, {highWaterMark: 100 << 150});
                stream.on('error', console.error);
                broadcast.play(stream);
            } catch (e) {return}
        }, 1800000)
    }
    try {
        const conection = await channel.join();
        conection.play(broadcast);
    } catch (error) {
        console.error(error);
    }
});

setInterval(async function () {
    if (!client.voice.connections.size) {
        let channel = client.channels.cache.get(config.CHANNEL_ID) || await client.channels.fetch(config.CHANNEL_ID);
        if (!channel) return;
        try {
            const connection = await channel.join();
            connection.play(broadcast);
        } catch (error) {
            console.error(error);
        }
    }
}, 20000);

client.login(config.TOKEN)

process.on('unhandledRejection', console.error);