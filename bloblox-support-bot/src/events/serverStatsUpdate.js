import ServerStats from '../models/ServerStats.js';

async function updateStats(guild) {
    try {
        const config = await ServerStats.findOne({ guildId: guild.id });
        if (!config) return;

        // Asegurar caché fresca de miembros
        await guild.members.fetch();

        const total = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = total - bots;
        const channelsCount = guild.channels.cache.size;

        if (config.totalMembersChannelId) {
            const chan = guild.channels.cache.get(config.totalMembersChannelId);
            if (chan) await chan.setName(`👥 Miembros: ${total}`).catch(() => {});
        }

        if (config.humansChannelId) {
            const chan = guild.channels.cache.get(config.humansChannelId);
            if (chan) await chan.setName(`👤 Usuarios: ${humans}`).catch(() => {});
        }

        if (config.botsChannelId) {
            const chan = guild.channels.cache.get(config.botsChannelId);
            if (chan) await chan.setName(`🤖 Bots: ${bots}`).catch(() => {});
        }

        if (config.channelsCountChannelId) {
            const chan = guild.channels.cache.get(config.channelsCountChannelId);
            if (chan) await chan.setName(`📁 Canales: ${channelsCount}`).catch(() => {});
        }
    } catch (e) {
        console.error('Error actualizando ServerStats:', e);
    }
}

export default {
    name: 'ready',
    once: false,
    async execute(client) {
        // Escuchar entradas y salidas
        client.on('guildMemberAdd', member => updateStats(member.guild));
        client.on('guildMemberRemove', member => updateStats(member.guild));
    }
};