const { Client,  VoiceChannel, GuildMember, PermissionFlagsBits, GatewayIntentBits, Partials } = require('discord.js');

let Settings = require('./Settings.json');

const {
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    joinVoiceChannel,
} = require('@discordjs/voice');
const play = require('play-dl');

class ACAR extends Client {
    constructor(options) {
        super({
            options,
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildIntegrations
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.User,

            ]
        })

        this.player = createAudioPlayer({
            inlineVolume : true,
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });
        this.url = Settings.youtube
        this.stream;
        this.message;
        this.channelId;
        this.playing;
        this.voiceConnection;
        this.staffJoined = false;
    
        this.on("guildUnavailable", async (guild) => {  })
        .on("disconnect", () => {})
        .on("reconnecting", () => {})
        .on("error", (e) => console.log(e))
        .on("warn", (info) => console.log(info));

        process.on("unhandledRejection", (err) => { console.log(err) });
        process.on("warning", (warn) => { console.log(warn) });
        process.on("beforeExit", () => { console.log('Sistem kapatılıyor...'); });
        process.on("uncaughtException", err => {
            const hata = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
                console.error("Beklenmedik Hata: ", hata);
               // process.exit(1);
        });


    }

    async _start(channelId, a) {
        let guild = this.guilds.cache.get(Settings.guild);
        if(!guild) return console.log("sunucu yok!");
        let channel = guild.channels.cache.get(channelId);
        if(!channel) return console.log("kanal yok");
        this.channelId = channelId;
    
        let connection = this.voiceConnection 
        let stream;
        let resource;
        if(Settings.local) {
            resource = this.stream = createAudioResource(Settings.file); 
        } else {
            stream = await play.stream(this.url);
            resource = this.stream = createAudioResource(stream.stream, {
                inputType: stream.type,
            }); 
        }
        
        let player = this.player
        
        player.on(AudioPlayerStatus.Playing, () => {
       
        });
        player.on(AudioPlayerStatus.Paused, () => {
            
        });
        player.on('idle', async () => {
            if(this.staffJoined == true) return;
            if(Settings.local) {
                resource = this.stream = createAudioResource(Settings.file); 
            } else {
                stream = await play.stream(this.url);
                resource = this.stream = createAudioResource(stream.stream, {
                    inputType: stream.type,
                }); 
            }
            this.player.play(resource);
        });
        if(this.staffJoined == true) return;
        player.play(resource)
        connection.subscribe(player);
    }
}

module.exports = { ACAR };

VoiceChannel.prototype.hasStaff = function(checkMember = false) {
    if(this.members.some(m => (checkMember !== false ? m.user.id !== checkMember.id : true) && !m.user.bot && m.roles.highest.position >= m.guild.roles.cache.get(Settings.staff_role).position)) return true;
    return false;
}

VoiceChannel.prototype.getStaffs = function(checkMember = false) {
    return this.members.filter(m => (checkMember !== false ? m.user.id !== checkMember.id : true) && !m.user.bot && m.roles.highest.position >= m.guild.roles.cache.get(Settings.staff_role).position).size
}

GuildMember.prototype.isStaff = function() {
    if(
        !this.user.bot &&
        (
            this.permissions.has(PermissionFlagsBits.Administrator) ||
           this.roles.highest.position >= this.guild.roles.cache.get(Settings.staff_role).position
        )
    ) return true;
    return false;
}