const Settings = require('./Settings.json');
let { ACAR } = require('./Voices.Global.Client');
const {
    joinVoiceChannel,
} = require('@discordjs/voice');

for (let index = 0; index < Settings.tokens.length; index++) {
    let token = Settings.tokens[index]
    let channel = Settings.channels < 1 ? Settings.channels[0] : Settings.channels[index]
    if(channel) {
        let client = new ACAR()
        client.login(token).catch(err => {
            console.log(`${index + 1}. Satırdaki Token Arızalı!`)
        })
        client.on("voiceStateUpdate", async (oldState, newState) => { 
            if(oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
                client.user.setPresence({ activities: [{name: Settings.state}], status: "dnd" })
                let guild = client.guilds.cache.get(Settings.guild);
                if(!guild) return console.log("sunucu yok!");
                let Channel = global.Voice = guild.channels.cache.get(channel);
                if(!Channel) return console.log("channel yok");
                client.voiceConnection = await joinVoiceChannel({
                    channelId: Channel.id,
                    guildId: Channel.guild.id,
                    adapterCreator: Channel.guild.voiceAdapterCreator,
                    group: client.user.id
                });
            }
        })
        
        client.on('ready', async () => {
            console.log(`${client.user.tag}`)
            client.user.setPresence({ activities: [{name: Settings.state}], status: "dnd" })
            let guild = client.guilds.cache.get(Settings.guild);
            if(!guild) return console.log("sunucu yok!");
            let Channel = global.Voice = guild.channels.cache.get(channel);
            if(!Channel) return console.log("channel yok");
            client.voiceConnection = await joinVoiceChannel({
                channelId: Channel.id,
                guildId: Channel.guild.id,
                adapterCreator: Channel.guild.voiceAdapterCreator,
                group: client.user.id
            });
            if(!Channel.hasStaff()) await client._start(channel)
            else client.staffJoined = true, client.playing = false, await client._start(channel);
            
        })
        
        client.on('voiceStateUpdate', async (oldState, newState) => { 
            if(
                newState.channelId && (oldState.channelId !== newState.channelId) &&
                newState.member.isStaff() &&
                newState.channelId === channel &&
                !newState.channel.hasStaff(newState.member)
            ) {
                client.staffJoined = true;
                client.player.stop()
                return;
            }
            if( 
                oldState.channelId && 
                (oldState.channelId !== newState.channelId) && 
                newState.member.isStaff() && 
                oldState.channelId === channel &&
                !oldState.channel.hasStaff()
            ) {
                client.staffJoined = false;
                client._start(channel, true)
                return 
            }
        })
    }
}

