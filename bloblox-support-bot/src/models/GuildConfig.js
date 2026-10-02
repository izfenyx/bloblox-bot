import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String, default: null },
    levelChannelId: { type: String, default: null },
    bumpChannelId: { type: String, default: null },
    welcomeChannelId: { type: String, default: null },
    welcomeMessage: { type: String, default: '¡Bienvenido/a {user} a **{server}**! 🎉' },
    byeChannelId: { type: String, default: null },
    byeMessage: { type: String, default: '**{user_tag}** ha abandonado el servidor. ¡Esperamos verte pronto!' }
});

export default mongoose.model('GuildConfig', guildConfigSchema);